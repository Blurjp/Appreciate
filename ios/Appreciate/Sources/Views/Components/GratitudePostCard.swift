import SwiftUI

struct GratitudePostCard: View {
    let post: GratitudePost
    var showAuthor: Bool = true
    var onHeart: (() -> Void)?
    var onShare: (() -> Void)?
    var onDelete: (() -> Void)?
    var onToggleVisibility: (() -> Void)?
    var onEdit: (() -> Void)?

    @State private var heartScale: CGFloat = 1.0

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingM) {
            // Header
            HStack(spacing: AppTheme.spacingS) {
                // Author avatar
                Circle()
                    .fill(AppTheme.categoryColor(post.category).opacity(0.2))
                    .frame(width: 40, height: 40)
                    .overlay {
                        Text(post.displayAuthor.prefix(1).uppercased())
                            .font(AppTheme.headline)
                            .foregroundStyle(AppTheme.categoryColor(post.category))
                    }

                VStack(alignment: .leading, spacing: 2) {
                    if showAuthor {
                        HStack(spacing: 4) {
                            if post.visibility == .anonymousPublic {
                                Image(systemName: "person.fill.questionmark")
                                    .font(.caption2)
                                    .foregroundStyle(AppTheme.mediumGray)
                            }
                            Text(post.displayAuthor)
                                .font(AppTheme.subheadline)
                                .fontWeight(.semibold)
                                .foregroundStyle(AppTheme.textPrimary)
                        }
                    }
                    HStack(spacing: 4) {
                        Image(systemName: post.visibility.icon)
                            .font(.caption2)
                        Text(post.timeAgoText)
                            .font(AppTheme.caption)
                    }
                    .foregroundStyle(AppTheme.mediumGray)
                }

                Spacer()

                // Category badge
                CategoryBadge(category: post.category)
            }

            // Content
            Text(post.content)
                .font(AppTheme.body)
                .foregroundStyle(AppTheme.textPrimary)
                .lineSpacing(4)

            // Feeling
            if !post.feeling.isEmpty {
                Text(post.feeling)
                    .font(AppTheme.callout)
                    .foregroundStyle(AppTheme.textSecondary)
                    .italic()
            }

            // Photo
            if let photoData = post.photoData, let uiImage = UIImage(data: photoData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(maxHeight: 200)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
            }

            // Actions
            HStack(spacing: AppTheme.spacingL) {
                if let onHeart {
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                            heartScale = 1.3
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                                heartScale = 1.0
                            }
                        }
                        onHeart()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "heart.fill")
                                .foregroundStyle(post.heartCount > 0 ? AppTheme.softCoral : AppTheme.mediumGray)
                                .scaleEffect(heartScale)
                            if post.heartCount > 0 {
                                Text("\(post.heartCount)")
                                    .font(AppTheme.caption)
                                    .foregroundStyle(AppTheme.textSecondary)
                            }
                        }
                    }
                }

                if let onShare {
                    Button {
                        onShare()
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                            .font(AppTheme.caption)
                            .foregroundStyle(AppTheme.mediumGray)
                    }
                }

                Spacer()

                if let onEdit {
                    Button {
                        onEdit()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "pencil")
                            Text("Edit")
                        }
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.mediumGray)
                    }
                }

                if let onToggleVisibility {
                    Button {
                        onToggleVisibility()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: post.isPublic ? "lock.open.fill" : "lock.fill")
                            Text(post.isPublic ? "Make Private" : "Make Public")
                        }
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.mediumGray)
                    }
                }

                if let onDelete {
                    Button(role: .destructive) {
                        onDelete()
                    } label: {
                        Image(systemName: "trash")
                            .font(AppTheme.caption)
                            .foregroundStyle(AppTheme.mediumGray)
                    }
                }
            }
        }
        .padding(AppTheme.spacingM)
        .background(AppTheme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusL))
        .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 4)
    }
}

// MARK: - Category Badge

struct CategoryBadge: View {
    let category: GratitudeCategory

    var body: some View {
        HStack(spacing: 4) {
            Text(category.emoji)
                .font(.caption2)
            Text(category.rawValue)
                .font(AppTheme.caption)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(AppTheme.categoryColor(category).opacity(0.12))
        .foregroundStyle(AppTheme.categoryColor(category))
        .clipShape(Capsule())
    }
}
