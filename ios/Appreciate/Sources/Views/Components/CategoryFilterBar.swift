import SwiftUI

struct CategoryFilterBar: View {
    @Binding var selectedCategory: GratitudeCategory?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppTheme.spacingS) {
                // "All" pill
                FilterPill(
                    label: "All",
                    emoji: "🌟",
                    isSelected: selectedCategory == nil,
                    color: AppTheme.warmGold
                ) {
                    selectedCategory = nil
                }

                ForEach(GratitudeCategory.allCases) { category in
                    FilterPill(
                        label: category.rawValue,
                        emoji: category.emoji,
                        isSelected: selectedCategory == category,
                        color: AppTheme.categoryColor(category)
                    ) {
                        selectedCategory = category
                    }
                }
            }
            .padding(.horizontal, AppTheme.spacingM)
        }
    }
}

// MARK: - Filter Pill

struct FilterPill: View {
    let label: String
    let emoji: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(emoji)
                    .font(.caption)
                Text(label)
                    .font(AppTheme.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? color.opacity(0.15) : AppTheme.lightGray.opacity(0.8))
            .foregroundStyle(isSelected ? color : AppTheme.textSecondary)
            .clipShape(Capsule())
            .overlay {
                if isSelected {
                    Capsule()
                        .strokeBorder(color.opacity(0.3), lineWidth: 1)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
