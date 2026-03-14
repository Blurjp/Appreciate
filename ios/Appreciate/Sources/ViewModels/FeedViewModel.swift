import Foundation

@Observable
final class FeedViewModel {
    var posts: [GratitudePost] = []
    var selectedCategory: GratitudeCategory?
    var isLoading = false
    var todayCount: Int = 0

    private let postService: PostService

    init(postService: PostService) {
        self.postService = postService
    }

    func loadPosts() {
        isLoading = true
        posts = postService.fetchPublicPosts(category: selectedCategory)
        todayCount = posts.filter { Calendar.current.isDateInToday($0.createdAt) }.count
        isLoading = false
    }

    func selectCategory(_ category: GratitudeCategory?) {
        selectedCategory = category
        loadPosts()
    }

    func heartPost(_ post: GratitudePost) {
        postService.toggleHeart(post)
    }

    var dateHeader: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d, yyyy"
        return formatter.string(from: Date())
    }
}
