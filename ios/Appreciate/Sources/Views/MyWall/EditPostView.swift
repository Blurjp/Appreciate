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
                    // Content
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

                    // Category
                    VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                        Text("Category")
                            .font(AppTheme.headline)
                            .foregroundStyle(AppTheme.textPrimary)

                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: AppTheme.spacingS) {
                            ForEach(GratitudeCategory.allCases) { category in
                                Button {
                                    editedCategory = category
                                } label: {
                                    VStack(spacing: 4) {
                                        Text(category.emoji)
                                            .font(.title3)
                                        Text(category.rawValue)
                                            .font(AppTheme.caption)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, AppTheme.spacingS)
                                    .background(
                                        editedCategory == category
                                            ? AppTheme.categoryColor(category).opacity(0.15)
                                            : AppTheme.lightGray.opacity(0.5)
                                    )
                                    .foregroundStyle(
                                        editedCategory == category
                                            ? AppTheme.categoryColor(category)
                                            : AppTheme.textPrimary
                                    )
                                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusS))
                                    .overlay {
                                        if editedCategory == category {
                                            RoundedRectangle(cornerRadius: AppTheme.cornerRadiusS)
                                                .strokeBorder(AppTheme.categoryColor(category), lineWidth: 1.5)
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    // Visibility
                    VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                        Text("Visibility")
                            .font(AppTheme.headline)
                            .foregroundStyle(AppTheme.textPrimary)

                        ForEach(PostVisibility.allCases, id: \.self) { option in
                            Button {
                                editedVisibility = option
                            } label: {
                                HStack(spacing: AppTheme.spacingS) {
                                    Image(systemName: option.icon)
                                        .foregroundStyle(editedVisibility == option ? AppTheme.warmGold : AppTheme.mediumGray)
                                        .frame(width: 24)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(option.label)
                                            .font(AppTheme.subheadline)
                                            .fontWeight(.medium)
                                            .foregroundStyle(AppTheme.textPrimary)
                                        Text(option.description)
                                            .font(AppTheme.caption)
                                            .foregroundStyle(AppTheme.textSecondary)
                                    }
                                    Spacer()
                                    Image(systemName: editedVisibility == option ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(editedVisibility == option ? AppTheme.warmGold : AppTheme.lightGray)
                                }
                                .padding(AppTheme.spacingM)
                                .background(editedVisibility == option ? AppTheme.warmGold.opacity(0.06) : AppTheme.lightGray.opacity(0.5))
                                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
                            }
                            .buttonStyle(.plain)
                        }
                    }
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
                    Button("Save") {
                        postService.updatePost(
                            post,
                            content: editedContent.trimmingCharacters(in: .whitespacesAndNewlines),
                            visibility: editedVisibility,
                            category: editedCategory
                        )
                        onDismiss()
                    }
                    .font(AppTheme.headline)
                    .foregroundStyle(AppTheme.warmGold)
                    .disabled(editedContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
        .onAppear {
            editedContent = post.content
            editedCategory = post.category
            editedVisibility = post.visibility
        }
    }
}
