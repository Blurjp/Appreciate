import Foundation

@Observable
final class FeedViewModel {
    var posts: [GratitudePost] = []
    var selectedCategory: GratitudeCategory?
    var isLoading = false
    var todayCount: Int = 0
    var errorMessage: String?

    private let postService: PostService

    init(postService: PostService) {
        self.postService = postService
    }

    func loadPosts() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let fetched = try await postService.fetchPublicFeed(category: selectedCategory)
                await MainActor.run {
                    self.posts = fetched
                    self.todayCount = fetched.filter { Calendar.current.isDateInToday($0.createdAt) }.count
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

    func selectCategory(_ category: GratitudeCategory?) {
        selectedCategory = category
        loadPosts()
    }

    func heartPost(_ post: GratitudePost) {
        Task {
            do {
                try await postService.toggleHeart(post.id)
                // Reload to get updated heart count
                loadPosts()
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }

    var dateHeader: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d, yyyy"
        return formatter.string(from: Date())
    }
}
