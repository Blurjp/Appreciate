import SwiftUI

struct FeedView: View {
    let viewModel: FeedViewModel

    @State private var showShareSheet = false
    @State private var shareText = ""

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.spacingL) {
                // Header
                VStack(spacing: AppTheme.spacingS) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Today's Appreciation Feed")
                                .font(AppTheme.title2)
                                .foregroundStyle(AppTheme.textPrimary)

                            HStack(spacing: 4) {
                                Text("🌟")
                                Text(viewModel.dateHeader)
                                Text("·")
                                Text("\(viewModel.todayCount) appreciations today")
                            }
                            .font(AppTheme.caption)
                            .foregroundStyle(AppTheme.textSecondary)
                        }

                        Spacer()
                    }
                    .padding(.horizontal, AppTheme.spacingM)

                    // Category filters
                    CategoryFilterBar(selectedCategory: Binding(
                        get: { viewModel.selectedCategory },
                        set: { viewModel.selectCategory($0) }
                    ))
                }

                // Trending section
                if !viewModel.posts.isEmpty {
                    VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                        HStack {
                            Text("🏆")
                            Text("Trending Appreciations")
                                .font(AppTheme.headline)
                                .foregroundStyle(AppTheme.textPrimary)
                        }
                        .padding(.horizontal, AppTheme.spacingM)
                    }
                }

                // Posts
                if viewModel.posts.isEmpty {
                    FeedEmptyState(hasFilter: viewModel.selectedCategory != nil) {
                        viewModel.selectCategory(nil)
                    }
                    .padding(.top, AppTheme.spacingXL)
                } else {
                    LazyVStack(spacing: AppTheme.spacingM) {
                        ForEach(viewModel.posts, id: \.id) { post in
                            GratitudePostCard(
                                post: post,
                                showAuthor: true,
                                onHeart: { viewModel.heartPost(post) },
                                onShare: {
                                    shareText = "\(post.displayAuthor) is grateful for: \(post.content)\n\n-- Shared from Appreciate"
                                    showShareSheet = true
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
        .onAppear { viewModel.loadPosts() }
        .refreshable { viewModel.loadPosts() }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(text: shareText)
                .presentationDetents([.medium])
        }
    }
}

// MARK: - Feed Empty State

struct FeedEmptyState: View {
    let hasFilter: Bool
    let clearFilter: () -> Void

    var body: some View {
        VStack(spacing: AppTheme.spacingM) {
            Text("💛")
                .font(.system(size: 60))

            if hasFilter {
                Text("No posts in this category yet")
                    .font(AppTheme.title3)
                    .foregroundStyle(AppTheme.textPrimary)

                Text("Be the first to share gratitude here!")
                    .font(AppTheme.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)

                Button("Show all categories") {
                    clearFilter()
                }
                .font(AppTheme.headline)
                .foregroundStyle(AppTheme.warmGold)
            } else {
                Text("The feed is quiet")
                    .font(AppTheme.title3)
                    .foregroundStyle(AppTheme.textPrimary)

                Text("Share a public gratitude post\nto get things started!")
                    .font(AppTheme.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(AppTheme.spacingXL)
    }
}
