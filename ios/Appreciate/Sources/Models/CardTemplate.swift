import SwiftUI

// MARK: - Card Background Source

/// The source of the card's background visual
enum CardBackgroundSource: String, Codable {
    case template
    case photo
    case ai
}

// MARK: - Card Template

/// A predefined card design template with gradient background and color scheme
struct CardTemplate: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let backgroundColors: [String]  // Hex color strings for gradient
    let textColor: String
    let accentColor: String

    var textUIColor: Color { Color(hex: textColor) }
    var accentUIColor: Color { Color(hex: accentColor) }

    /// Creates a linear gradient from the background colors
    var gradient: LinearGradient {
        let colors = backgroundColors.map { Color(hex: $0) }
        return LinearGradient(
            colors: colors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

// MARK: - Predefined Templates

extension CardTemplate {
    /// All available card templates matching the web app
    static let allTemplates: [CardTemplate] = [
        CardTemplate(
            id: "minimal",
            name: "Minimal",
            backgroundColors: ["#ffffff", "#f5f5f5"],
            textColor: "#1a1a1a",
            accentColor: "#cc4444"
        ),
        CardTemplate(
            id: "sunset",
            name: "Sunset",
            backgroundColors: ["#e85d6f", "#d44a6a"],
            textColor: "#ffffff",
            accentColor: "#ffecd2"
        ),
        CardTemplate(
            id: "ocean",
            name: "Ocean",
            backgroundColors: ["#4a5ec7", "#5b3d8f"],
            textColor: "#ffffff",
            accentColor: "#ffd700"
        ),
        CardTemplate(
            id: "forest",
            name: "Forest",
            backgroundColors: ["#1a5c3a", "#2d7a4f"],
            textColor: "#ffffff",
            accentColor: "#f0e68c"
        ),
        CardTemplate(
            id: "lavender",
            name: "Lavender",
            backgroundColors: ["#7b5ea7", "#9b6fbf"],
            textColor: "#ffffff",
            accentColor: "#f0ddf8"
        ),
        CardTemplate(
            id: "golden",
            name: "Golden",
            backgroundColors: ["#c74b8a", "#a8365e"],
            textColor: "#ffffff",
            accentColor: "#ffd700"
        ),
        CardTemplate(
            id: "midnight",
            name: "Midnight",
            backgroundColors: ["#0f0c29", "#1a1650", "#12103a"],
            textColor: "#ffffff",
            accentColor: "#00d4ff"
        ),
        CardTemplate(
            id: "peach",
            name: "Peach",
            backgroundColors: ["#e89b6e", "#d4804f"],
            textColor: "#ffffff",
            accentColor: "#ffecd2"
        ),
    ]

    /// Default template (Minimal)
    static let `default` = allTemplates[0]

    /// Template ID used when the background is a user photo
    static let photoTemplateId = "photo"

    /// Find a template by ID, returns default if not found
    static func find(byId id: String?) -> CardTemplate {
        guard let id = id, id != photoTemplateId, !id.starts(with: "ai:") else {
            return .default
        }
        return allTemplates.first { $0.id == id } ?? .default
    }
}
