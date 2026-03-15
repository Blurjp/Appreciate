import Foundation
import SwiftData

/// Maps to Supabase gratitude_category enum: FAMILY, WORK, SMALL_JOYS, NATURE, HEALTH, OTHER
enum GratitudeCategory: String, Codable, CaseIterable, Identifiable {
    case family = "FAMILY"
    case work = "WORK"
    case smallJoys = "SMALL_JOYS"
    case nature = "NATURE"
    case health = "HEALTH"
    case other = "OTHER"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .family: "Family"
        case .work: "Work"
        case .smallJoys: "Small Joys"
        case .nature: "Nature"
        case .health: "Health"
        case .other: "Other"
        }
    }

    var emoji: String {
        switch self {
        case .family: "👨‍👩‍👧‍👦"
        case .work: "💼"
        case .smallJoys: "✨"
        case .nature: "🌿"
        case .health: "💪"
        case .other: "💭"
        }
    }

    var color: String {
        switch self {
        case .family: "CategoryFamily"
        case .work: "CategoryWork"
        case .smallJoys: "CategorySmallJoys"
        case .nature: "CategoryNature"
        case .health: "CategoryHealth"
        case .other: "CategoryOther"
        }
    }
}

/// Maps to Supabase post_visibility enum: PRIVATE, PUBLIC, ANONYMOUS
enum PostVisibility: String, Codable, CaseIterable {
    case privatePost = "PRIVATE"
    case publicPost = "PUBLIC"
    case anonymousPublic = "ANONYMOUS"

    var label: String {
        switch self {
        case .privatePost: "Private"
        case .publicPost: "Public"
        case .anonymousPublic: "Anonymous"
        }
    }

    var icon: String {
        switch self {
        case .privatePost: "lock.fill"
        case .publicPost: "globe"
        case .anonymousPublic: "person.fill.questionmark"
        }
    }

    var description: String {
        switch self {
        case .privatePost: "Visible only to you"
        case .publicPost: "Visible to everyone"
        case .anonymousPublic: "Public but your name is hidden"
        }
    }
}

/// Local SwiftData model for offline caching. Mirrors the Supabase gratitude_posts table.
@Model
final class GratitudePost {
    var id: UUID
    var content: String
    var feeling: String
    var category: GratitudeCategory
    var visibility: PostVisibility
    var photoData: Data?
    var photoUrl: String?
    var authorId: String
    var authorName: String
    var createdAt: Date
    var updatedAt: Date
    var heartCount: Int
    var isBookmarked: Bool

    init(
        id: UUID = UUID(),
        content: String,
        feeling: String = "",
        category: GratitudeCategory = .smallJoys,
        visibility: PostVisibility = .privatePost,
        photoData: Data? = nil,
        photoUrl: String? = nil,
        authorId: String = "",
        authorName: String = "",
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        heartCount: Int = 0,
        isBookmarked: Bool = false
    ) {
        self.id = id
        self.content = content
        self.feeling = feeling
        self.category = category
        self.visibility = visibility
        self.photoData = photoData
        self.photoUrl = photoUrl
        self.authorId = authorId
        self.authorName = authorName
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.heartCount = heartCount
        self.isBookmarked = isBookmarked
    }

    var isPublic: Bool {
        visibility == .publicPost || visibility == .anonymousPublic
    }

    var displayAuthor: String {
        visibility == .anonymousPublic ? "Anonymous" : authorName
    }

    var timeAgoText: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
}

// MARK: - Supabase DTOs (Codable structs for Supabase communication)

/// Matches the Supabase gratitude_posts table for reading (includes joined author profile)
struct SupabasePost: Codable {
    let id: UUID
    let content: String
    let feeling: String?
    let category: GratitudeCategory
    let visibility: PostVisibility
    let photoUrl: String?
    let authorId: UUID
    let createdAt: String
    let updatedAt: String
    let heartCount: Int
    let isBookmarked: Bool
    let author: SupabaseAuthor?

    enum CodingKeys: String, CodingKey {
        case id, content, feeling, category, visibility
        case photoUrl = "photo_url"
        case authorId = "author_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case heartCount = "heart_count"
        case isBookmarked = "is_bookmarked"
        case author = "profiles"
    }

    func toLocal() -> GratitudePost {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return GratitudePost(
            id: id,
            content: content,
            feeling: feeling ?? "",
            category: category,
            visibility: visibility,
            photoUrl: photoUrl,
            authorId: authorId.uuidString,
            authorName: author?.name ?? "Unknown",
            createdAt: isoFormatter.date(from: createdAt) ?? Date(),
            updatedAt: isoFormatter.date(from: updatedAt) ?? Date(),
            heartCount: heartCount,
            isBookmarked: isBookmarked
        )
    }
}

struct SupabaseAuthor: Codable {
    let id: UUID
    let name: String
    let avatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id, name
        case avatarUrl = "avatar_url"
    }
}

/// For creating a new post via Supabase insert
struct CreatePostDTO: Codable {
    let content: String
    let feeling: String?
    let category: GratitudeCategory
    let visibility: PostVisibility
    let photoUrl: String?
    let authorId: UUID

    enum CodingKeys: String, CodingKey {
        case content, feeling, category, visibility
        case photoUrl = "photo_url"
        case authorId = "author_id"
    }
}

/// For updating an existing post
struct UpdatePostDTO: Codable {
    let content: String?
    let category: GratitudeCategory?
    let visibility: PostVisibility?

    enum CodingKeys: String, CodingKey {
        case content, category, visibility
    }
}
