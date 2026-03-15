import SwiftUI

struct StreakCard: View {
    let streakData: StreakData

    var body: some View {
        VStack(spacing: AppTheme.spacingM) {
            // Streak headline
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(streakData.streakEmoji)
                        .font(.system(size: 40))

                    Text(streakData.streakMessage)
                        .font(AppTheme.headline)
                        .foregroundStyle(AppTheme.textPrimary)
                }

                Spacer()

                // Streak number
                VStack(spacing: 2) {
                    Text("\(streakData.currentStreak)")
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                        .foregroundStyle(AppTheme.warmGold)

                    Text("day streak")
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.textSecondary)
                }
            }

            Divider()
                .padding(.vertical, 4)

            // Week activity dots
            HStack(spacing: AppTheme.spacingS) {
                ForEach(0..<7, id: \.self) { index in
                    VStack(spacing: 4) {
                        Circle()
                            .fill(streakData.weekActivity[index] ? AppTheme.warmGold : AppTheme.lightGray)
                            .frame(width: 28, height: 28)
                            .overlay {
                                if streakData.weekActivity[index] {
                                    Image(systemName: "checkmark")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .foregroundStyle(.white)
                                }
                            }

                        Text(dayLabel(for: index))
                            .font(.system(size: 10, weight: .medium, design: .rounded))
                            .foregroundStyle(AppTheme.textSecondary)
                    }
                }
            }

            Divider()
                .padding(.vertical, 4)

            // Stats row
            HStack {
                StatItem(value: "\(streakData.totalPosts)", label: "Total Posts", icon: "note.text")
                Spacer()
                StatItem(value: "\(streakData.longestStreak)", label: "Best Streak", icon: "trophy.fill")
                Spacer()
                StatItem(
                    value: streakData.hasPostedToday ? "Done" : "Not yet",
                    label: "Today",
                    icon: streakData.hasPostedToday ? "checkmark.circle.fill" : "circle"
                )
            }
        }
        .padding(AppTheme.spacingL)
        .background {
            RoundedRectangle(cornerRadius: AppTheme.cornerRadiusXL)
                .fill(AppTheme.cardGradient)
                .shadow(color: .black.opacity(0.06), radius: 16, x: 0, y: 6)
        }
    }

    private func dayLabel(for index: Int) -> String {
        let calendar = Calendar.current
        let today = Date()
        guard let date = calendar.date(byAdding: .day, value: -(6 - index), to: today) else {
            return ""
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return String(formatter.string(from: date).prefix(1))
    }
}

// MARK: - Stat Item

struct StatItem: View {
    let value: String
    let label: String
    let icon: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.callout)
                .foregroundStyle(AppTheme.warmGold)

            Text(value)
                .font(AppTheme.headline)
                .foregroundStyle(AppTheme.textPrimary)

            Text(label)
                .font(AppTheme.caption)
                .foregroundStyle(AppTheme.textSecondary)
        }
    }
}
