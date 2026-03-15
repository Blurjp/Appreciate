import SwiftUI

struct MyWallView: View {
    let viewModel: MyWallViewModel
    let userId: String
    var postService: PostService?

    @State private var showDeleteAlert = false
    @State private var postToDelete: GratitudePost?
    @State private var postToEdit: GratitudePost?
    @State private var showEditSheet = false
    @State private var showShareSheet = false
    @State private var shareText = ""
    @State private var showToast = false
    @State private var toastMessage = ""

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.spacingL) {
                // Header
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundStyle(AppTheme.warmGold)
                        Text("My Gratitude Wall")
                            .font(AppTheme.title)
                            .foregroundStyle(AppTheme.textPrimary)
                    }

                    Text("Your private reflection space")
                        .font(AppTheme.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppTheme.spacingM)

                // Streak card
                StreakCard(streakData: viewModel.streakData)
                    .padding(.horizontal, AppTheme.spacingM)

                // Filter tabs
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppTheme.spacingS) {
                        WallFilterPill(
                            label: "All (\(viewModel.posts.count))",
                            isSelected: viewModel.selectedFilter == nil
                        ) {
                            viewModel.selectedFilter = nil
                        }
                        WallFilterPill(
                            label: "Private (\(viewModel.privatePosts.count))",
                            icon: "lock.fill",
                            isSelected: viewModel.selectedFilter == .privatePost
                        ) {
                            viewModel.selectedFilter = .privatePost
                        }
                        WallFilterPill(
                            label: "Public (\(viewModel.publicPosts.count))",
                            icon: "globe",
                            isSelected: viewModel.selectedFilter == .publicPost
                        ) {
                            viewModel.selectedFilter = .publicPost
                        }
                    }
                    .padding(.horizontal, AppTheme.spacingM)
                }

                // Posts list
                if viewModel.filteredPosts.isEmpty {
                    WallEmptyStateView()
                        .padding(.top, AppTheme.spacingXL)
                } else {
                    LazyVStack(spacing: AppTheme.spacingM) {
                        ForEach(viewModel.filteredPosts, id: \.id) { post in
                            GratitudePostCard(
                                post: post,
                                showAuthor: false,
                                onShare: {
                                    shareText = "I'm grateful for: \(post.content)\n\n-- Shared from Appreciate"
                                    showShareSheet = true
                                },
                                onDelete: {
                                    postToDelete = post
                                    showDeleteAlert = true
                                },
                                onToggleVisibility: {
                                    viewModel.toggleVisibility(post)
                                    toastMessage = post.isPublic ? "Post is now private" : "Post is now public"
                                    showToast = true
                                },
                                onEdit: {
                                    postToEdit = post
                                    showEditSheet = true
                                }
                            )
                        }
                    }
                    .padding(.horizontal, AppTheme.spacingM)
                }
            }
            .padding(.top, AppTheme.spacingM)
            .padding(.bottom, AppTheme.spacingXXL)
        }
        .background(AppTheme.background.ignoresSafeArea())
        .toast(isPresented: $showToast, message: toastMessage)
        .onAppear { viewModel.loadData(userId: userId) }
        .refreshable { viewModel.loadData(userId: userId) }
        .alert("Delete Post?", isPresented: $showDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                if let post = postToDelete {
                    viewModel.deletePost(post)
                    toastMessage = "Post deleted"
                    showToast = true
                }
            }
        } message: {
            Text("This gratitude post will be permanently removed.")
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(text: shareText)
                .presentationDetents([.medium])
        }
        .sheet(isPresented: $showEditSheet) {
            if let post = postToEdit, let postService {
                EditPostView(post: post, postService: postService) {
                    showEditSheet = false
                    viewModel.loadData(userId: userId)
                    toastMessage = "Post updated"
                    showToast = true
                }
            }
        }
    }
}

// MARK: - Wall Filter Pill

struct WallFilterPill: View {
    let label: String
    var icon: String? = nil
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if let icon {
                    Image(systemName: icon)
                        .font(.caption2)
                }
                Text(label)
                    .font(AppTheme.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? AppTheme.warmGold.opacity(0.15) : AppTheme.lightGray)
            .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.textSecondary)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Empty State

struct WallEmptyStateView: View {
    var body: some View {
        VStack(spacing: AppTheme.spacingM) {
            Text("🌱")
                .font(.system(size: 60))

            Text("Your gratitude garden is empty")
                .font(AppTheme.title3)
                .foregroundStyle(AppTheme.textPrimary)

            Text("Start planting seeds of gratitude.\nTap + to create your first post.")
                .font(AppTheme.subheadline)
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(AppTheme.spacingXL)
    }
}
