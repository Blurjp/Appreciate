import SwiftUI
import UIKit

/// Service for exporting gratitude cards as images for sharing
enum CardExportService {
    /// Renders a SwiftUI view to a UIImage at 2x resolution
    @MainActor
    static func renderView<Content: View>(_ view: Content, size: CGSize = CGSize(width: 360, height: 504)) -> UIImage? {
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2.0  // 2x for high quality
        renderer.proposedSize = .init(width: size.width, height: size.height)

        guard let uiImage = renderer.uiImage else {
            return nil
        }

        return uiImage
    }

    /// Renders a card view and returns a UIImage
    @MainActor
    static func renderCard(
        content: String,
        authorName: String,
        template: CardTemplate,
        photoUrl: URL?,
        photoData: Data?,
        backgroundSource: CardBackgroundSource,
        category: GratitudeCategory,
        size: CGSize = CGSize(width: 360, height: 504)
    ) -> UIImage? {
        let cardView = CardPreviewView(
            content: content,
            authorName: authorName,
            template: template,
            photoUrl: photoUrl,
            photoData: photoData,
            backgroundSource: backgroundSource,
            category: category
        )
        .frame(width: size.width, height: size.height)

        return renderView(cardView, size: size)
    }

    /// Saves a UIImage to the photo library
    @MainActor
    static func saveToPhotos(_ image: UIImage) async throws {
        try await withCheckedThrowingContinuation { continuation in
            let saver = PhotoSaveDelegate(continuation: continuation)
            UIImageWriteToSavedPhotosAlbum(image, saver, #selector(PhotoSaveDelegate.saveDidComplete), nil)
        }
    }

    /// Shares content using the system share sheet
    @MainActor
    static func shareCard(
        content: String,
        authorName: String,
        template: CardTemplate,
        photoUrl: URL?,
        photoData: Data?,
        backgroundSource: CardBackgroundSource,
        category: GratitudeCategory,
        in viewController: UIViewController?,
        sourceRect: CGRect = .zero
    ) async throws {
        guard let image = renderCard(
            content: content,
            authorName: authorName,
            template: template,
            photoUrl: photoUrl,
            photoData: photoData,
            backgroundSource: backgroundSource,
            category: category
        ) else {
            throw CardExportError.renderFailed
        }

        let activityVC = UIActivityViewController(
            activityItems: [image, "My gratitude: \(content)"],
            applicationActivities: nil
        )

        if let popover = activityVC.popoverPresentationController {
            if sourceRect != .zero {
                popover.sourceRect = sourceRect
                popover.sourceView = viewController?.view
            } else {
                popover.sourceRect = CGRect(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height / 2, width: 0, height: 0)
                popover.sourceView = viewController?.view
            }
        }

        viewController?.present(activityVC, animated: true)
    }
}

// MARK: - Errors

enum CardExportError: LocalizedError {
    case renderFailed
    case saveFailed

    var errorDescription: String? {
        switch self {
        case .renderFailed:
            return "Failed to render card image"
        case .saveFailed:
            return "Failed to save to photos"
        }
    }
}

// MARK: - Photo Save Delegate

private class PhotoSaveDelegate: NSObject {
    private let continuation: CheckedContinuation<Void, Error>
    private var resumed = false

    init(continuation: CheckedContinuation<Void, Error>) {
        self.continuation = continuation
    }

    @objc func saveDidComplete(_ target: NSObject, didFinishSavingWithError error: NSError?, contextInfo: UnsafeRawPointer) {
        guard !resumed else { return }
        resumed = true
        if let error = error {
            continuation.resume(throwing: error)
        } else {
            continuation.resume()
        }
    }
}
