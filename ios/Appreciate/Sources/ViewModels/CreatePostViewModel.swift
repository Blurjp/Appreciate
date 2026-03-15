import Foundation
import PhotosUI
import SwiftUI
import UIKit

@Observable
final class CreatePostViewModel {
    // Step 1: Content
    var content = ""
    var feeling = ""
    var selectedPhotoItem: PhotosPickerItem?
    var photoData: Data?

    // Step 2: Category
    var selectedCategory: GratitudeCategory = .smallJoys

    // Step 3: Visibility
    var visibility: PostVisibility = .privatePost

    // UI State
    var currentStep = 1
    var isSubmitting = false
    var showConfirmation = false
    var confirmationMessage = ""
    var errorMessage: String?

    private let postService: PostService
    private let streakService: StreakService

    let totalSteps = 3

    init(postService: PostService, streakService: StreakService) {
        self.postService = postService
        self.streakService = streakService
    }

    var canProceedFromStep1: Bool {
        !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
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
        guard canProceedFromStep1 else { return }
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
