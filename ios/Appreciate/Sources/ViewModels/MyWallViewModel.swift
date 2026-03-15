import Foundation

@Observable
final class MyWallViewModel {
    var posts: [GratitudePost] = []
    var streakData: StreakData = .empty
    var selectedFilter: PostVisibility?
    var isLoading = false
    var errorMessage: String?

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
        errorMessage = nil

        Task {
            do {
                async let fetchedPosts = postService.fetchMyPosts()
                async let fetchedStreak = streakService.fetchStreak(for: userId)

                let (p, s) = try await (fetchedPosts, fetchedStreak)

                await MainActor.run {
                    self.posts = p
                    self.streakData = s
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }

    func deletePost(_ post: GratitudePost) {
        Task {
            do {
                try await postService.deletePost(post.id)
                await MainActor.run {
                    self.posts.removeAll { $0.id == post.id }
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }

    func toggleVisibility(_ post: GratitudePost) {
        let newVisibility: PostVisibility = post.visibility == .privatePost ? .publicPost : .privatePost
        Task {
            do {
                try await postService.updatePost(post.id, visibility: newVisibility)
                await MainActor.run {
                    post.visibility = newVisibility
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
}
