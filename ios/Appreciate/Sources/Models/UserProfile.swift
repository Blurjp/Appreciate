import Foundation
import SwiftData

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
