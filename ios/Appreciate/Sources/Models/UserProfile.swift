import Foundation
import SwiftData

/// Local SwiftData model for caching user profile. Mirrors Supabase public.profiles table.
@Model
final class UserProfile {
    var id: String
    var displayName: String
    var email: String
    var avatarURL: String?
    var joinedAt: Date
    var totalPosts: Int
    var currentStreak: Int
    var longestStreak: Int
    var lastPostDate: Date?

    init(
        id: String = UUID().uuidString,
        displayName: String = "",
        email: String = "",
        avatarURL: String? = nil,
        joinedAt: Date = Date(),
        totalPosts: Int = 0,
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        lastPostDate: Date? = nil
    ) {
        self.id = id
        self.displayName = displayName
        self.email = email
        self.avatarURL = avatarURL
        self.joinedAt = joinedAt
        self.totalPosts = totalPosts
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.lastPostDate = lastPostDate
    }
}

// MARK: - Supabase DTO

/// Matches Supabase public.profiles table
struct SupabaseProfile: Codable {
    let id: UUID
    let email: String
    let name: String
    let avatarUrl: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, email, name
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
    }

    func toLocal() -> UserProfile {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return UserProfile(
            id: id.uuidString,
            displayName: name,
            email: email,
            avatarURL: avatarUrl,
            joinedAt: isoFormatter.date(from: createdAt) ?? Date()
        )
    }
}
