import Foundation
import SwiftData

/// Manages CRUD operations for gratitude posts
@Observable
final class PostService {
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Create

    func createPost(
        content: String,
        feeling: String,
        category: GratitudeCategory,
        visibility: PostVisibility,
        photoData: Data?,
        authorId: String,
        authorName: String
    ) -> GratitudePost {
        let post = GratitudePost(
            content: content,
            feeling: feeling,
            category: category,
            visibility: visibility,
            photoData: photoData,
            authorId: authorId,
            authorName: authorName
        )
        modelContext.insert(post)
        try? modelContext.save()
        return post
    }

    // MARK: - Read

    func fetchAllPosts(for userId: String) -> [GratitudePost] {
        let descriptor = FetchDescriptor<GratitudePost>(
            predicate: #Predicate { $0.authorId == userId },
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    func fetchPublicPosts(category: GratitudeCategory? = nil) -> [GratitudePost] {
        let descriptor: FetchDescriptor<GratitudePost>
        if let category {
            let categoryRaw = category.rawValue
            descriptor = FetchDescriptor<GratitudePost>(
                predicate: #Predicate {
                    ($0.visibility.rawValue == "public" || $0.visibility.rawValue == "anonymous")
                    && $0.category.rawValue == categoryRaw
                },
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )
        } else {
            descriptor = FetchDescriptor<GratitudePost>(
                predicate: #Predicate {
                    $0.visibility.rawValue == "public" || $0.visibility.rawValue == "anonymous"
                },
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )
        }
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    func fetchTodayPosts(for userId: String) -> [GratitudePost] {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let descriptor = FetchDescriptor<GratitudePost>(
            predicate: #Predicate {
                $0.authorId == userId && $0.createdAt >= startOfDay
            },
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    // MARK: - Update

    func updatePost(_ post: GratitudePost, content: String? = nil, visibility: PostVisibility? = nil, category: GratitudeCategory? = nil) {
        if let content { post.content = content }
        if let visibility { post.visibility = visibility }
        if let category { post.category = category }
        post.updatedAt = Date()
        try? modelContext.save()
    }

    func toggleHeart(_ post: GratitudePost) {
        post.heartCount += 1
        try? modelContext.save()
    }

    // MARK: - Delete

    func deletePost(_ post: GratitudePost) {
        modelContext.delete(post)
        try? modelContext.save()
    }
}
