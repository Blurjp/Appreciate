import Foundation

/// Fetches streak data from Supabase.
/// The streak_data table is updated automatically by a database trigger (on_post_created)
/// whenever a new gratitude_posts row is inserted — no manual calculation needed.
@Observable
final class StreakService {
    private let supabase = SupabaseService.shared.client

    /// Fetches streak data for the given user from the Supabase streak_data table.
    func fetchStreak(for userId: String) async throws -> StreakData {
        guard let uuid = UUID(uuidString: userId) else {
            return .empty
        }

        let results: [SupabaseStreakData] = try await supabase
            .from("streak_data")
            .select()
            .eq("user_id", value: uuid)
            .execute()
            .value

        guard let streak = results.first else {
            return .empty
        }

        var data = streak.toLocal()

        // Calculate week activity from recent posts
        data.weekActivity = try await fetchWeekActivity(userId: uuid)

        return data
    }

    /// Fetches which of the last 7 days had posts, for the streak card visualization.
    private func fetchWeekActivity(userId: UUID) async throws -> [Bool] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        guard let weekAgo = calendar.date(byAdding: .day, value: -6, to: today) else {
            return Array(repeating: false, count: 7)
        }

        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        struct PostDate: Codable {
            let createdAt: String
            enum CodingKeys: String, CodingKey {
                case createdAt = "created_at"
            }
        }

        let posts: [PostDate] = try await supabase
            .from("gratitude_posts")
            .select("created_at")
            .eq("author_id", value: userId)
            .gte("created_at", value: isoFormatter.string(from: weekAgo))
            .execute()
            .value

        var postingDays = Set<Int>() // days offset from weekAgo
        for post in posts {
            if let date = isoFormatter.date(from: post.createdAt) {
                let day = calendar.startOfDay(for: date)
                let offset = calendar.dateComponents([.day], from: today, to: day).day ?? 0
                postingDays.insert(offset + 6) // 0 = 6 days ago, 6 = today
            }
        }

        return (0..<7).map { postingDays.contains($0) }
    }
}
