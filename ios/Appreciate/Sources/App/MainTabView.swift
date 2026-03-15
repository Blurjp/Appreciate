import SwiftUI
import SwiftData

struct MainTabView: View {
    let authVM: AuthViewModel
    let modelContext: ModelContext

    @State private var selectedTab = 0
    @State private var showCreatePost = false

    // Services (no longer need modelContext — they use Supabase)
    @State private var postService: PostService?
    @State private var streakService: StreakService?

    // ViewModels
    @State private var feedVM: FeedViewModel?
    @State private var myWallVM: MyWallViewModel?
    @State private var createPostVM: CreatePostViewModel?

    var body: some View {
        Group {
            if let feedVM, let myWallVM {
                TabView(selection: $selectedTab) {
                    // Feed Tab
                    NavigationStack {
                        FeedView(viewModel: feedVM)
                            .navigationBarTitleDisplayMode(.inline)
                            .toolbar {
                                ToolbarItem(placement: .principal) {
                                    HStack(spacing: 6) {
                                        Text("🙏")
                                        Text("Appreciate")
                                            .font(AppTheme.headline)
                                            .foregroundStyle(AppTheme.textPrimary)
                                    }
                                }
                            }
                    }
                    .tabItem {
                        Label("Feed", systemImage: "sparkles")
                    }
                    .tag(0)

                    // Create Post (placeholder tab that opens sheet)
                    Color.clear
                        .tabItem {
                            Label("Post", systemImage: "plus.circle.fill")
                        }
                        .tag(1)

                    // My Wall Tab
                    NavigationStack {
                        MyWallView(
                            viewModel: myWallVM,
                            userId: authVM.currentUser?.id ?? "",
                            postService: postService
                        )
                    }
                    .tabItem {
                        Label("My Wall", systemImage: "lock.fill")
                    }
                    .tag(2)

                    // Settings Tab
                    NavigationStack {
                        SettingsView(authVM: authVM)
                    }
                    .tabItem {
                        Label("Settings", systemImage: "gearshape.fill")
                    }
                    .tag(3)
                }
                .tint(AppTheme.warmGold)
                .onChange(of: selectedTab) { oldValue, newValue in
                    if newValue == 1 {
                        showCreatePost = true
                        selectedTab = oldValue
                    }
                }
                .sheet(isPresented: $showCreatePost) {
                    if let createPostVM {
                        CreatePostView(
                            viewModel: createPostVM,
                            userId: authVM.currentUser?.id ?? "",
                            userName: authVM.currentUser?.displayName ?? "Anonymous"
                        ) {
                            showCreatePost = false
                            // Refresh data after posting
                            feedVM.loadPosts()
                            myWallVM.loadData(userId: authVM.currentUser?.id ?? "")
                        }
                        .interactiveDismissDisabled(true)
                    }
                }
            } else {
                ProgressView()
            }
        }
        .onAppear {
            setupServices()
        }
    }

    private func setupServices() {
        let ps = PostService()
        let ss = StreakService()
        postService = ps
        streakService = ss

        feedVM = FeedViewModel(postService: ps)
        myWallVM = MyWallViewModel(postService: ps, streakService: ss)
        createPostVM = CreatePostViewModel(postService: ps, streakService: ss)
    }
}
