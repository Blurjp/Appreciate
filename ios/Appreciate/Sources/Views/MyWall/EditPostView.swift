import SwiftUI

struct EditPostView: View {
    let post: GratitudePost
    let postService: PostService
    let onDismiss: () -> Void

    @State private var editedContent: String = ""
    @State private var editedCategory: GratitudeCategory = .smallJoys
    @State private var editedVisibility: PostVisibility = .privatePost

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.spacingL) {
                    contentView
                    categoryView
                    visibilityView
                }
                .padding(AppTheme.spacingL)
            }
            .background(AppTheme.background.ignoresSafeArea())
            .navigationTitle("Edit Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { onDismiss() }
                        .foregroundStyle(AppTheme.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    saveButton
                }
            }
        }
        .onAppear {
            editedContent = post.content
            editedCategory = post.category
            editedVisibility = post.visibility
        }
    }

    // MARK: - Subviews

    private var contentView: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingS) {
            Text("Gratitude")
                .font(AppTheme.headline)
                .foregroundStyle(AppTheme.textPrimary)

            TextField("What are you grateful for?", text: $editedContent, axis: .vertical)
                .font(AppTheme.body)
                .lineLimit(3...8)
                .padding()
                .background(AppTheme.lightGray.opacity(0.5))
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
        }
    }

    private var categoryView: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingS) {
            Text("Category")
                .font(AppTheme.headline)
                .foregroundStyle(AppTheme.textPrimary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: AppTheme.spacingS) {
                ForEach(GratitudeCategory.allCases) { category in
                    CategoryButton(
                        category: category,
                        isSelected: editedCategory == category
                    ) {
                        editedCategory = category
                    }
                }
            }
        }
    }

    private var visibilityView: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingS) {
            Text("Visibility")
                .font(AppTheme.headline)
                .foregroundStyle(AppTheme.textPrimary)

            ForEach(PostVisibility.allCases, id: \.self) { option in
                VisibilityButton(
                    visibility: option,
                    isSelected: editedVisibility == option
                ) {
                    editedVisibility = option
                }
            }
        }
    }

    private var saveButton: some View {
        Button("Save") {
            Task {
                try? await postService.updatePost(
                    post.id,
                    content: editedContent.trimmingCharacters(in: .whitespacesAndNewlines),
                    visibility: editedVisibility,
                    category: editedCategory
                )
                onDismiss()
            }
        }
        .font(AppTheme.headline)
        .foregroundStyle(AppTheme.warmGold)
        .disabled(editedContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
    }
}

// MARK: - Helper Views

private struct CategoryButton: View {
    let category: GratitudeCategory
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(category.emoji)
                    .font(.title3)
                Text(category.rawValue)
                    .font(AppTheme.caption)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.spacingS)
            .background(isSelected ? AppTheme.categoryColor(category).opacity(0.15) : AppTheme.lightGray.opacity(0.5))
            .foregroundStyle(isSelected ? AppTheme.categoryColor(category) : AppTheme.textPrimary)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusS))
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadiusS)
                        .strokeBorder(AppTheme.categoryColor(category), lineWidth: 1.5)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

private struct VisibilityButton: View {
    let visibility: PostVisibility
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.spacingS) {
                Image(systemName: visibility.icon)
                    .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.mediumGray)
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(visibility.label)
                        .font(AppTheme.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(AppTheme.textPrimary)
                    Text(visibility.description)
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.lightGray)
            }
            .padding(AppTheme.spacingM)
            .background(isSelected ? AppTheme.warmGold.opacity(0.06) : AppTheme.lightGray.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
        }
        .buttonStyle(.plain)
    }
}
