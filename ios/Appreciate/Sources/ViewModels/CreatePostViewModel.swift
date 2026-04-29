import Foundation
import PhotosUI
import SwiftUI
import UIKit

@Observable
final class CreatePostViewModel {
    // Step 1: Category
    var selectedCategory: GratitudeCategory = .smallJoys

    // Step 2: Content
    var content = ""
    var feeling = ""
    var selectedPhotoItem: PhotosPickerItem?
    var photoData: Data?

    // Step 3: Card Designer
    var selectedTemplate: CardTemplate = .default
    var backgroundSource: CardBackgroundSource = .template
    var aiImageUrl: URL?
    var isGeneratingAI = false

    // Step 4: Visibility
    var visibility: PostVisibility = .privatePost

    // UI State
    var currentStep = 1
    var isSubmitting = false
    var showConfirmation = false
    var confirmationMessage = ""
    var errorMessage: String?

    private let postService: PostService
    private let streakService: StreakService

    let totalSteps = 4

    init(postService: PostService, streakService: StreakService) {
        self.postService = postService
        self.streakService = streakService
    }

    var canProceedFromStep1: Bool {
        true // Category is always selected
    }

    var canProceedFromStep2: Bool {
        !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var canProceedFromCurrentStep: Bool {
        switch currentStep {
        case 1: return canProceedFromStep1
        case 2: return canProceedFromStep2
        default: return true
        }
    }

    var hasPhoto: Bool {
        photoData != nil
    }

    /// The resolved card template ID to save with the post
    var resolvedCardTemplateId: String? {
        switch backgroundSource {
        case .photo:
            return hasPhoto ? CardTemplate.photoTemplateId : nil
        case .ai:
            if let url = aiImageUrl {
                return "ai:\(url.absoluteString)"
            }
            return selectedTemplate.id
        case .template:
            return selectedTemplate.id
        }
    }

    var progressPercentage: Double {
        Double(currentStep) / Double(totalSteps)
    }

    func nextStep() {
        if currentStep < totalSteps {
            HapticManager.selection()
            currentStep += 1
        }
    }

    func previousStep() {
        if currentStep > 1 {
            currentStep -= 1
        }
    }

    func submitPost(authorId: String, authorName: String) {
        guard canProceedFromStep2 else { return }
        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                let _ = try await postService.createPost(
                    content: content.trimmingCharacters(in: .whitespacesAndNewlines),
                    feeling: feeling.trimmingCharacters(in: .whitespacesAndNewlines),
                    category: selectedCategory,
                    visibility: visibility,
                    photoData: photoData,
                    cardTemplateId: resolvedCardTemplateId,
                    authorId: authorId,
                    authorName: authorName
                )

                await MainActor.run {
                    self.confirmationMessage = self.randomConfirmation
                    self.isSubmitting = false
                    self.showConfirmation = true
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isSubmitting = false
                }
            }
        }
    }

    func reset() {
        content = ""
        feeling = ""
        selectedPhotoItem = nil
        photoData = nil
        selectedCategory = .smallJoys
        selectedTemplate = .default
        backgroundSource = .template
        aiImageUrl = nil
        isGeneratingAI = false
        visibility = .privatePost
        currentStep = 1
        isSubmitting = false
        showConfirmation = false
        confirmationMessage = ""
        errorMessage = nil
    }

    @MainActor
    func loadPhoto() async {
        guard let item = selectedPhotoItem else { return }
        photoData = try? await item.loadTransferable(type: Data.self)
        // Auto-switch to photo background when photo is added
        if photoData != nil {
            backgroundSource = .photo
        }
    }

    /// Load photo from PhotosPickerItem
    @MainActor
    static func loadPhotoData(from item: PhotosPickerItem?) async -> Data? {
        guard let item = item else { return nil }
        return try? await item.loadTransferable(type: Data.self)
    }

    /// Generate an AI image for the card background
    @MainActor
    func generateAIImage() async {
        guard !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        isGeneratingAI = true
        defer { isGeneratingAI = false }

        do {
            let url = try await AIService.generateImage(content: content, feeling: feeling)
            self.aiImageUrl = url
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }

    private var randomConfirmation: String {
        let messages = [
            "Beautiful! You just shared light 💫",
            "The world is brighter because of you ✨",
            "Gratitude looks good on you 🌟",
            "What a wonderful reflection 🙏",
            "You're building a beautiful habit 🌱",
            "Your appreciation matters more than you know 💛",
            "Sending good vibes into the universe 🌈",
            "That's the spirit of gratitude! 🦋",
        ]
        return messages.randomElement() ?? messages[0]
    }
}
