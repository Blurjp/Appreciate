import SwiftUI

/// A preview of a gratitude card with gradient or photo background
struct CardPreviewView: View {
    let content: String
    let authorName: String
    let template: CardTemplate
    let photoUrl: URL?
    let photoData: Data?
    let backgroundSource: CardBackgroundSource
    let category: GratitudeCategory

    init(
        content: String,
        authorName: String,
        template: CardTemplate,
        photoUrl: URL? = nil,
        photoData: Data? = nil,
        backgroundSource: CardBackgroundSource,
        category: GratitudeCategory
    ) {
        self.content = content
        self.authorName = authorName
        self.template = template
        self.photoUrl = photoUrl
        self.photoData = photoData
        self.backgroundSource = backgroundSource
        self.category = category
    }

    var body: some View {
        GeometryReader { geometry in
            let cardWidth = min(geometry.size.width - 32, 360)
            let cardHeight = cardWidth * 1.4

            ZStack {
                // Background
                switch backgroundSource {
                case .template:
                    template.gradient
                case .photo:
                    if let data = photoData, let uiImage = UIImage(data: data) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } else if let url = photoUrl {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            case .failure, .empty:
                                template.gradient
                            @unknown default:
                                template.gradient
                            }
                        }
                    } else {
                        template.gradient
                    }
                case .ai:
                    if let url = photoUrl {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            case .failure, .empty:
                                template.gradient
                            @unknown default:
                                template.gradient
                            }
                        }
                    } else {
                        template.gradient
                    }
                }
            }
            .overlay {
                // Dark overlay for photo backgrounds
                if backgroundSource != .template {
                    Color.black.opacity(0.35)
                }
            }
            .overlay {
                // Decorative circles for template backgrounds
                if backgroundSource == .template {
                    ZStack {
                        Circle()
                            .fill(Color(hex: template.accentColor).opacity(0.2))
                            .frame(width: 144, height: 144)
                            .offset(x: cardWidth * 0.35, y: -cardHeight * 0.25)

                        Circle()
                            .fill(Color(hex: template.accentColor).opacity(0.2))
                            .frame(width: 112, height: 112)
                            .offset(x: -cardWidth * 0.35, y: cardHeight * 0.3)
                    }
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 30))
            .overlay {
                RoundedRectangle(cornerRadius: 30)
                    .strokeBorder(Color.white.opacity(0.4), lineWidth: 1)
            }
            .shadow(color: Color.black.opacity(0.16), radius: 28, x: 0, y: 16)

            // Content overlay
            VStack {
                // Header
                HStack {
                    HStack(spacing: 8) {
                        Text("✨")
                            .font(.title2)
                        Text("Gratitude")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(0.3)
                    }
                    .foregroundColor(Color(hex: template.textColor).opacity(0.7))
                    .shadow(color: .black.opacity(0.25), radius: 2, x: 0, y: 1)

                    Spacer()

                    Text(backgroundLabel)
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(0.2)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(
                            backgroundSource == .template
                                ? Color.black.opacity(0.2)
                                : Color.black.opacity(0.25)
                        )
                        .foregroundColor(Color(hex: template.textColor))
                        .clipShape(Capsule())
                        .overlay {
                            Capsule()
                                .strokeBorder(Color.white.opacity(0.2), lineWidth: 1)
                        }
                }
                .padding(.top, 28)
                .padding(.horizontal, 28)

                Spacer()

                // Quote content
                VStack(alignment: .leading, spacing: 0) {
                    Text("\"\(content.isEmpty ? "Your appreciation message will appear here." : content)\"")
                        .font(.system(size: content.count > 100 ? 22 : 28, weight: .semibold, design: .rounded))
                        .foregroundColor(Color(hex: template.textColor))
                        .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 1)
                        .lineSpacing(6)
                        .multilineTextAlignment(.leading)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 28)

                Spacer()

                // Footer with author
                HStack {
                    HStack(spacing: 12) {
                        // Avatar
                        Circle()
                            .fill(
                                backgroundSource == .template
                                    ? Color(hex: template.accentColor)
                                    : Color.white.opacity(0.2)
                            )
                            .frame(width: 40, height: 40)
                            .overlay {
                                Text(String(authorName.prefix(1)).uppercased())
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(authorName)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(Color(hex: template.textColor))
                                .shadow(color: .black.opacity(0.25), radius: 2, x: 0, y: 1)

                            Text("appreciate.live")
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: template.textColor).opacity(0.8))
                                .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
                        }
                    }

                    Spacer()

                    Text("🙏")
                        .font(.title)
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 28)
            }
            .frame(width: cardWidth, height: cardHeight)
            .frame(maxWidth: .infinity)
        }
    }

    private var backgroundLabel: String {
        switch backgroundSource {
        case .template:
            return template.name
        case .photo:
            return "Your Photo"
        case .ai:
            return "AI Remix"
        }
    }
}

#Preview {
    VStack {
        CardPreviewView(
            content: "Grateful for the warm sunshine this morning",
            authorName: "Jane",
            template: .default,
            photoUrl: nil,
            backgroundSource: .template,
            category: .smallJoys
        )
        .frame(height: 500)

        CardPreviewView(
            content: "Family dinner was amazing",
            authorName: "John",
            template: CardTemplate.find(byId: "sunset"),
            photoUrl: nil,
            backgroundSource: .template,
            category: .family
        )
        .frame(height: 500)
    }
}
