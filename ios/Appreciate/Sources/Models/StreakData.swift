import Foundation

struct StreakData: Equatable {
    var currentStreak: Int
    var longestStreak: Int
    var totalPosts: Int
    var lastPostDate: Date?
    var weekActivity: [Bool] // last 7 days, true = posted

    static let empty = StreakData(
        currentStreak: 0,
        longestStreak: 0,
        totalPosts: 0,
        lastPostDate: nil,
        weekActivity: Array(repeating: false, count: 7)
    )

    var hasPostedToday: Bool {
        guard let lastPost = lastPostDate else { return false }
        return Calendar.current.isDateInToday(lastPost)
    }

    var streakEmoji: String {
        switch currentStreak {
        case 0: "🌱"
        case 1...2: "🔥"
        case 3...6: "🔥🔥"
        case 7...13: "🔥🔥🔥"
        case 14...29: "⭐"
        default: "🏆"
        }
    }

    var streakMessage: String {
        switch currentStreak {
        case 0:
            "Start your gratitude journey today!"
        case 1:
            "Great start! Keep it going tomorrow!"
        case 2...4:
            "You've posted \(currentStreak) days in a row!"
        case 5...6:
            "\(currentStreak) day streak! Almost a full week!"
        case 7:
            "One week streak! You're building a habit!"
        case 8...13:
            "\(currentStreak) days strong! Keep shining!"
        case 14...29:
            "\(currentStreak) day streak! You're a gratitude champion!"
        default:
            "\(currentStreak) days! Incredible dedication!"
        }
    }
}
