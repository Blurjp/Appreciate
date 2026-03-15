import Foundation
import AuthenticationServices
import SwiftData
import Supabase

/// Manages user authentication via Supabase Auth.
/// Supports Sign in with Apple and session persistence through Supabase's built-in token management.
@Observable
final class AuthService {
    private(set) var currentUser: UserProfile?
    private(set) var isAuthenticated = false
    private(set) var isLoading = false
    private(set) var errorMessage: String?

    private let supabase = SupabaseService.shared.client
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        Task { await restoreSession() }
    }

    // MARK: - Sign In with Apple via Supabase

    func handleSignInWithApple(_ authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityTokenData = credential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            errorMessage = "Failed to get Apple ID credentials"
            return
        }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                // Sign in with Apple via Supabase Auth
                // Supabase verifies the Apple identity token and creates/finds the user
                let session = try await supabase.auth.signInWithIdToken(
                    credentials: .init(
                        provider: .apple,
                        idToken: identityToken
                    )
                )

                // Fetch or create local profile from Supabase profiles table
                await loadProfile(userId: session.user.id)

                await MainActor.run {
                    self.isAuthenticated = true
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }

    /// Quick sign-in for development/testing using anonymous auth
    func signInAsGuest() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let session = try await supabase.auth.signInAnonymously()
                await loadProfile(userId: session.user.id)

                await MainActor.run {
                    self.isAuthenticated = true
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }

    func signOut() {
        Task {
            try? await supabase.auth.signOut()
            await MainActor.run {
                self.currentUser = nil
                self.isAuthenticated = false
            }
        }
    }

    func updateDisplayName(_ name: String) {
        guard let user = currentUser, let userId = UUID(uuidString: user.id) else { return }

        Task {
            do {
                try await supabase
                    .from("profiles")
                    .update(["name": name])
                    .eq("id", value: userId)
                    .execute()

                await MainActor.run {
                    self.currentUser?.displayName = name
                    try? self.modelContext.save()
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }

    // MARK: - Session Restoration

    /// Restores existing Supabase session on app launch.
    /// Supabase SDK handles token refresh automatically.
    private func restoreSession() async {
        do {
            let session = try await supabase.auth.session
            await loadProfile(userId: session.user.id)
            await MainActor.run {
                self.isAuthenticated = true
            }
        } catch {
            // No valid session — user needs to sign in
            await MainActor.run {
                self.isAuthenticated = false
            }
        }
    }

    /// Fetches the user profile from Supabase profiles table and caches it locally.
    private func loadProfile(userId: UUID) async {
        do {
            let profile: SupabaseProfile = try await supabase
                .from("profiles")
                .select()
                .eq("id", value: userId)
                .single()
                .execute()
                .value

            let localProfile = profile.toLocal()

            await MainActor.run {
                // Update or insert into SwiftData for local caching
                let idString = userId.uuidString
                let descriptor = FetchDescriptor<UserProfile>(
                    predicate: #Predicate { $0.id == idString }
                )
                if let existing = try? modelContext.fetch(descriptor).first {
                    existing.displayName = localProfile.displayName
                    existing.email = localProfile.email
                    existing.avatarURL = localProfile.avatarURL
                } else {
                    modelContext.insert(localProfile)
                }
                try? modelContext.save()
                self.currentUser = localProfile
            }
        } catch {
            // Profile may not exist yet (trigger may be slow); create a minimal local profile
            await MainActor.run {
                let user = UserProfile(
                    id: userId.uuidString,
                    displayName: "Grateful User",
                    email: ""
                )
                self.currentUser = user
            }
        }
    }
}
