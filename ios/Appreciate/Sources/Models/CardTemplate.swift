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
            accentColor: "#ff6b6b"
        ),
        CardTemplate(
            id: "sunset",
            name: "Sunset",
            backgroundColors: ["#ff9a9e", "#fecfef"],
            textColor: "#4a1942",
            accentColor: "#ff6b9d"
        ),
        CardTemplate(
            id: "ocean",
            name: "Ocean",
            backgroundColors: ["#667eea", "#764ba2"],
            textColor: "#ffffff",
            accentColor: "#ffd700"
        ),
        CardTemplate(
            id: "forest",
            name: "Forest",
            backgroundColors: ["#134e5e", "#71b280"],
            textColor: "#ffffff",
            accentColor: "#f0e68c"
        ),
        CardTemplate(
            id: "lavender",
            name: "Lavender",
            backgroundColors: ["#a18cd1", "#fbc2eb"],
            textColor: "#4a1942",
            accentColor: "#ff69b4"
        ),
        CardTemplate(
            id: "golden",
            name: "Golden",
            backgroundColors: ["#f093fb", "#f5576c"],
            textColor: "#ffffff",
            accentColor: "#ffd700"
        ),
        CardTemplate(
            id: "midnight",
            name: "Midnight",
            backgroundColors: ["#0f0c29", "#302b63", "#24243e"],
            textColor: "#ffffff",
            accentColor: "#00d4ff"
        ),
        CardTemplate(
            id: "peach",
            name: "Peach",
            backgroundColors: ["#ffecd2", "#fcb69f"],
            textColor: "#5d4e37",
            accentColor: "#ff6b6b"
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
