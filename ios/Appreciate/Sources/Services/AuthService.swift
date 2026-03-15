import Foundation
import AuthenticationServices
import SwiftData

/// Manages user authentication state
/// For MVP, uses local persistence. Firebase Auth integration planned for v2.
@Observable
final class AuthService {
    private(set) var currentUser: UserProfile?
    private(set) var isAuthenticated = false
    private(set) var isLoading = false

    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        loadSavedUser()
    }

    // MARK: - Sign In with Apple

    func handleSignInWithApple(_ authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            return
        }

        let userId = credential.user
        let fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
            .compactMap { $0 }
            .joined(separator: " ")
        let email = credential.email ?? ""

        // Check if user already exists
        let descriptor = FetchDescriptor<UserProfile>(
            predicate: #Predicate { $0.id == userId }
        )

        if let existing = try? modelContext.fetch(descriptor).first {
            currentUser = existing
        } else {
            let displayName = fullName.isEmpty ? "Grateful User" : fullName
            let user = UserProfile(
                id: userId,
                displayName: displayName,
                email: email
            )
            modelContext.insert(user)
            try? modelContext.save()
            currentUser = user
        }

        isAuthenticated = true
        saveUserId(userId)
    }

    /// Quick sign-in for development/testing
    func signInAsGuest() {
        let guestId = "guest_\(UUID().uuidString)"

        let user = UserProfile(
            id: guestId,
            displayName: "Grateful User",
            email: ""
        )
        modelContext.insert(user)
        try? modelContext.save()

        currentUser = user
        isAuthenticated = true
        saveUserId(guestId)
    }

    func signOut() {
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "appreciate_user_id")
    }

    func updateDisplayName(_ name: String) {
        currentUser?.displayName = name
        try? modelContext.save()
    }

    // MARK: - Persistence

    private func loadSavedUser() {
        guard let userId = UserDefaults.standard.string(forKey: "appreciate_user_id") else {
            return
        }

        let descriptor = FetchDescriptor<UserProfile>(
            predicate: #Predicate { $0.id == userId }
        )

        if let user = try? modelContext.fetch(descriptor).first {
            currentUser = user
            isAuthenticated = true
        }
    }

    private func saveUserId(_ id: String) {
        UserDefaults.standard.set(id, forKey: "appreciate_user_id")
    }
}
