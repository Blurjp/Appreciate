import Foundation

@Observable
final class MyWallViewModel {
    var posts: [GratitudePost] = []
    var streakData: StreakData = .empty
    var selectedFilter: PostVisibility?
    var isLoading = false

    private let postService: PostService
    private let streakService: StreakService

    init(postService: PostService, streakService: StreakService) {
        self.postService = postService
        self.streakService = streakService
    }

    var filteredPosts: [GratitudePost] {
        guard let filter = selectedFilter else { return posts }
        return posts.filter { $0.visibility == filter }
    }

    var privatePosts: [GratitudePost] {
        posts.filter { $0.visibility == .privatePost }
    }

    var publicPosts: [GratitudePost] {
        posts.filter { $0.isPublic }
    }

    func loadData(userId: String) {
        isLoading = true
        posts = postService.fetchAllPosts(for: userId)
        streakData = streakService.calculateStreak(for: userId)
        isLoading = false
    }

    func deletePost(_ post: GratitudePost) {
        postService.deletePost(post)
        posts.removeAll { $0.id == post.id }
    }

    func toggleVisibility(_ post: GratitudePost) {
        let newVisibility: PostVisibility = post.visibility == .privatePost ? .publicPost : .privatePost
        postService.updatePost(post, visibility: newVisibility)
    }
}
