import Foundation
import SwiftData

/// Tracks and calculates gratitude posting streaks
@Observable
final class StreakService {
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    func calculateStreak(for userId: String) -> StreakData {
        let descriptor = FetchDescriptor<GratitudePost>(
            predicate: #Predicate { $0.authorId == userId },
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )

        guard let posts = try? modelContext.fetch(descriptor), !posts.isEmpty else {
            return .empty
        }

        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        // Get unique posting days
        var postingDays = Set<Date>()
        for post in posts {
            let day = calendar.startOfDay(for: post.createdAt)
            postingDays.insert(day)
        }

        let sortedDays = postingDays.sorted(by: >)

        // Calculate current streak
        var currentStreak = 0
        var checkDate = today

        // Allow today or yesterday as the start
        if postingDays.contains(today) {
            checkDate = today
        } else if let yesterday = calendar.date(byAdding: .day, value: -1, to: today),
                  postingDays.contains(yesterday) {
            checkDate = yesterday
        } else {
            // No recent post, streak is 0
            return StreakData(
                currentStreak: 0,
                longestStreak: calculateLongestStreak(sortedDays: sortedDays),
                totalPosts: posts.count,
                lastPostDate: posts.first?.createdAt,
                weekActivity: calculateWeekActivity(postingDays: postingDays)
            )
        }

        while postingDays.contains(checkDate) {
            currentStreak += 1
            guard let previousDay = calendar.date(byAdding: .day, value: -1, to: checkDate) else {
                break
            }
            checkDate = previousDay
        }

        let longestStreak = max(currentStreak, calculateLongestStreak(sortedDays: sortedDays))

        return StreakData(
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            totalPosts: posts.count,
            lastPostDate: posts.first?.createdAt,
            weekActivity: calculateWeekActivity(postingDays: postingDays)
        )
    }

    func updateUserStreak(user: UserProfile, streak: StreakData) {
        user.currentStreak = streak.currentStreak
        user.longestStreak = streak.longestStreak
        user.totalPosts = streak.totalPosts
        user.lastPostDate = streak.lastPostDate
        try? modelContext.save()
    }

    // MARK: - Private

    private func calculateLongestStreak(sortedDays: [Date]) -> Int {
        guard !sortedDays.isEmpty else { return 0 }
        let calendar = Calendar.current
        var longest = 1
        var current = 1

        for i in 1..<sortedDays.count {
            let daysBetween = calendar.dateComponents([.day], from: sortedDays[i], to: sortedDays[i - 1]).day ?? 0
            if daysBetween == 1 {
                current += 1
                longest = max(longest, current)
            } else {
                current = 1
            }
        }
        return longest
    }

    private func calculateWeekActivity(postingDays: Set<Date>) -> [Bool] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        return (0..<7).reversed().map { daysAgo in
            guard let date = calendar.date(byAdding: .day, value: -daysAgo, to: today) else {
                return false
            }
            return postingDays.contains(date)
        }
    }
}
