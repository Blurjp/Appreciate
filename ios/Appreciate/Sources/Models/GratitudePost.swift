import Foundation
import SwiftData

/// The visibility setting for a gratitude post
enum PostVisibility: String, Codable, CaseIterable {
    case privatePost = "private"
    case publicPost = "public"
    case anonymousPublic = "anonymous"

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

/// Categories for gratitude posts
enum GratitudeCategory: String, Codable, CaseIterable, Identifiable {
    case family = "Family"
    case work = "Work"
    case smallJoys = "Small Joys"
    case nature = "Nature"
    case health = "Health"
    case other = "Other"

    var id: String { rawValue }

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

@Model
final class GratitudePost {
    var id: UUID
    var content: String
    var feeling: String
    var category: GratitudeCategory
    var visibility: PostVisibility
    var photoData: Data?
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
