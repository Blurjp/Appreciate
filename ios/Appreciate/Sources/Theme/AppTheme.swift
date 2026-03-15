import SwiftUI

/// Central design system for Appreciate
enum AppTheme {
    // MARK: - Brand Colors

    static let warmGold = Color(hex: "F5A623")
    static let sunsetOrange = Color(hex: "F7786B")
    static let softCoral = Color(hex: "FF6F61")
    static let blushPink = Color(hex: "FFB5B5")
    static let lavender = Color(hex: "C3AED6")
    static let sageGreen = Color(hex: "A8D8B9")
    static let skyBlue = Color(hex: "87CEEB")
    static let cream = Color(hex: "FFF8F0")
    static let warmWhite = Color(hex: "FEFCF9")
    static let deepCharcoal = Color(hex: "2C2C2E")
    static let mediumGray = Color(hex: "8E8E93")
    static let lightGray = Color(hex: "F2F2F7")

    // MARK: - Semantic Colors

    static let primary = warmGold
    static let secondary = softCoral
    static let accent = lavender
    static let background = warmWhite
    static let cardBackground = Color.white
    static let textPrimary = deepCharcoal
    static let textSecondary = mediumGray

    // MARK: - Category Colors

    static func categoryColor(_ category: GratitudeCategory) -> Color {
        switch category {
        case .family: Color(hex: "FF6F61")
        case .work: Color(hex: "4A90D9")
        case .smallJoys: Color(hex: "F5A623")
        case .nature: Color(hex: "7BC67E")
        case .health: Color(hex: "E87CA0")
        case .other: Color(hex: "C3AED6")
        }
    }

    // MARK: - Gradients

    static let primaryGradient = LinearGradient(
        colors: [warmGold, sunsetOrange],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let warmGradient = LinearGradient(
        colors: [Color(hex: "FFF8F0"), Color(hex: "FFE8D6")],
        startPoint: .top,
        endPoint: .bottom
    )

    static let cardGradient = LinearGradient(
        colors: [.white, Color(hex: "FEFAF5")],
        startPoint: .top,
        endPoint: .bottom
    )

    // MARK: - Typography

    static let largeTitle = Font.system(size: 34, weight: .bold, design: .rounded)
    static let title = Font.system(size: 28, weight: .bold, design: .rounded)
    static let title2 = Font.system(size: 22, weight: .semibold, design: .rounded)
    static let title3 = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let headline = Font.system(size: 17, weight: .semibold, design: .rounded)
    static let body = Font.system(size: 17, weight: .regular, design: .rounded)
    static let callout = Font.system(size: 16, weight: .regular, design: .rounded)
    static let subheadline = Font.system(size: 15, weight: .regular, design: .rounded)
    static let footnote = Font.system(size: 13, weight: .regular, design: .rounded)
    static let caption = Font.system(size: 12, weight: .regular, design: .rounded)

    // MARK: - Spacing

    static let spacingXS: CGFloat = 4
    static let spacingS: CGFloat = 8
    static let spacingM: CGFloat = 16
    static let spacingL: CGFloat = 24
    static let spacingXL: CGFloat = 32
    static let spacingXXL: CGFloat = 48

    // MARK: - Corner Radius

    static let cornerRadiusS: CGFloat = 8
    static let cornerRadiusM: CGFloat = 12
    static let cornerRadiusL: CGFloat = 16
    static let cornerRadiusXL: CGFloat = 24

    // MARK: - Shadows

    static let cardShadow = ShadowStyle.drop(
        color: .black.opacity(0.06),
        radius: 12,
        x: 0,
        y: 4
    )
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
