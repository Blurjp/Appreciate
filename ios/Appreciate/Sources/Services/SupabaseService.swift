import Foundation
import Supabase

/// Singleton service that provides the shared Supabase client.
/// All Supabase operations (auth, database, storage) go through this client.
final class SupabaseService {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        client = SupabaseClient(
            supabaseURL: SupabaseConfig.supabaseURL,
            supabaseKey: SupabaseConfig.supabaseAnonKey
        )
    }

    /// The currently authenticated user's UUID, or nil if not signed in.
    var currentUserId: UUID? {
        client.auth.currentUser?.id
    }

    /// Whether there is an active authenticated session.
    var isAuthenticated: Bool {
        client.auth.currentSession != nil
    }
}
