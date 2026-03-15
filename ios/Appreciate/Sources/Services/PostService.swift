import Foundation

/// Manages CRUD operations for gratitude posts via Supabase.
/// RLS policies on the gratitude_posts table handle authorization automatically —
/// the authenticated user's JWT is sent with every request.
@Observable
final class PostService {
    private let supabase = SupabaseService.shared.client

    // MARK: - Create

    func createPost(
        content: String,
        feeling: String,
        category: GratitudeCategory,
        visibility: PostVisibility,
        photoData: Data?,
        authorId: String,
        authorName: String
    ) async throws -> GratitudePost {
        guard let userId = UUID(uuidString: authorId) else {
            throw PostServiceError.invalidUserId
        }

        // Upload photo to Supabase Storage if provided
        var photoUrl: String? = nil
        if let data = photoData {
            let fileName = "\(userId.uuidString)/\(UUID().uuidString).jpg"
            try await supabase.storage
                .from("photos")
                .upload(fileName, data: data, options: .init(contentType: "image/jpeg"))
            photoUrl = supabase.storage
                .from("photos")
                .getPublicURL(path: fileName)
                .absoluteString
        }

        let dto = CreatePostDTO(
            content: content,
            feeling: feeling.isEmpty ? nil : feeling,
            category: category,
            visibility: visibility,
            photoUrl: photoUrl,
            authorId: userId
        )

        let response: SupabasePost = try await supabase
            .from("gratitude_posts")
            .insert(dto)
            .select("*, profiles(*)")
            .single()
            .execute()
            .value

        return response.toLocal()
    }

    // MARK: - Read

    /// Fetches public and anonymous posts, optionally filtered by category.
    func fetchPublicFeed(category: GratitudeCategory? = nil, limit: Int = 50, offset: Int = 0) async throws -> [GratitudePost] {
        var query = supabase
            .from("gratitude_posts")
            .select("*, profiles(*)")
            .or("visibility.eq.PUBLIC,visibility.eq.ANONYMOUS")
            .order("created_at", ascending: false)
            .range(from: offset, to: offset + limit - 1)

        if let category {
            query = query.eq("category", value: category.rawValue)
        }

        let posts: [SupabasePost] = try await query.execute().value
        return posts.map { $0.toLocal() }
    }

    /// Fetches all posts for the current user (RLS ensures only own posts are returned).
    func fetchMyPosts() async throws -> [GratitudePost] {
        let posts: [SupabasePost] = try await supabase
            .from("gratitude_posts")
            .select("*, profiles(*)")
            .order("created_at", ascending: false)
            .execute()
            .value

        // RLS returns own posts + public posts; filter to only own posts
        guard let currentUserId = SupabaseService.shared.currentUserId else {
            return []
        }
        return posts
            .filter { $0.authorId == currentUserId }
            .map { $0.toLocal() }
    }

    // MARK: - Update

    func updatePost(_ postId: UUID, content: String? = nil, visibility: PostVisibility? = nil, category: GratitudeCategory? = nil) async throws {
        let dto = UpdatePostDTO(content: content, category: category, visibility: visibility)
        try await supabase
            .from("gratitude_posts")
            .update(dto)
            .eq("id", value: postId)
            .execute()
    }

    /// Toggles a heart (like) on a post. Uses the hearts table with a unique constraint
    /// on (post_id, user_id) to prevent duplicates.
    func toggleHeart(_ postId: UUID) async throws {
        guard let userId = SupabaseService.shared.currentUserId else {
            throw PostServiceError.notAuthenticated
        }

        // Check if already hearted
        let existing: [HeartDTO] = try await supabase
            .from("hearts")
            .select()
            .eq("post_id", value: postId)
            .eq("user_id", value: userId)
            .execute()
            .value

        if existing.isEmpty {
            // Add heart
            try await supabase
                .from("hearts")
                .insert(InsertHeartDTO(postId: postId, userId: userId))
                .execute()
            // Increment heart_count on the post
            try await supabase.rpc("increment_heart_count", params: ["post_id_param": postId.uuidString]).execute()
        } else {
            // Remove heart
            try await supabase
                .from("hearts")
                .delete()
                .eq("post_id", value: postId)
                .eq("user_id", value: userId)
                .execute()
            // Decrement heart_count on the post
            try await supabase.rpc("decrement_heart_count", params: ["post_id_param": postId.uuidString]).execute()
        }
    }

    // MARK: - Delete

    func deletePost(_ postId: UUID) async throws {
        try await supabase
            .from("gratitude_posts")
            .delete()
            .eq("id", value: postId)
            .execute()
    }
}

// MARK: - Errors

enum PostServiceError: LocalizedError {
    case invalidUserId
    case notAuthenticated

    var errorDescription: String? {
        switch self {
        case .invalidUserId: "Invalid user ID"
        case .notAuthenticated: "You must be signed in"
        }
    }
}

// MARK: - Heart DTOs

private struct HeartDTO: Codable {
    let id: UUID
    let postId: UUID
    let userId: UUID

    enum CodingKeys: String, CodingKey {
        case id
        case postId = "post_id"
        case userId = "user_id"
    }
}

private struct InsertHeartDTO: Codable {
    let postId: UUID
    let userId: UUID

    enum CodingKeys: String, CodingKey {
        case postId = "post_id"
        case userId = "user_id"
    }
}
