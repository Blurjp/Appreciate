import SwiftUI
import PhotosUI

struct CreatePostView: View {
    @Bindable var viewModel: CreatePostViewModel
    let userId: String
    let userName: String
    let onDismiss: () -> Void

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Progress bar
                    ProgressView(value: viewModel.progressPercentage)
                        .tint(AppTheme.warmGold)
                        .padding(.horizontal)

                    // Step indicator
                    HStack {
                        Text("Step \(viewModel.currentStep) of \(viewModel.totalSteps)")
                            .font(AppTheme.caption)
                            .foregroundStyle(AppTheme.textSecondary)
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, AppTheme.spacingS)

                    // Content
                    TabView(selection: $viewModel.currentStep) {
                        Step1CategoryView(viewModel: viewModel)
                            .tag(1)
                        Step2ContentView(viewModel: viewModel)
                            .tag(2)
                        Step3CardDesignerView(viewModel: viewModel, userName: userName)
                            .tag(3)
                        Step4VisibilityView(viewModel: viewModel)
                            .tag(4)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .animation(.easeInOut, value: viewModel.currentStep)

                    // Navigation buttons
                    HStack(spacing: AppTheme.spacingM) {
                        if viewModel.currentStep > 1 {
                            Button {
                                viewModel.previousStep()
                            } label: {
                                HStack {
                                    Image(systemName: "chevron.left")
                                    Text("Back")
                                }
                                .font(AppTheme.headline)
                                .foregroundStyle(AppTheme.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(AppTheme.lightGray)
                                .clipShape(Capsule())
                            }
                        }

                        if viewModel.currentStep < viewModel.totalSteps {
                            Button {
                                viewModel.nextStep()
                            } label: {
                                HStack {
                                    Text("Next")
                                    Image(systemName: "chevron.right")
                                }
                                .font(AppTheme.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(
                                    viewModel.canProceedFromCurrentStep
                                        ? AppTheme.primaryGradient
                                        : LinearGradient(colors: [AppTheme.mediumGray], startPoint: .leading, endPoint: .trailing)
                                )
                                .clipShape(Capsule())
                            }
                            .disabled(!viewModel.canProceedFromCurrentStep)
                        } else {
                            Button {
                                viewModel.submitPost(authorId: userId, authorName: userName)
                            } label: {
                                HStack {
                                    Image(systemName: "paperplane.fill")
                                    Text("Share Gratitude")
                                }
                                .font(AppTheme.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(AppTheme.primaryGradient)
                                .clipShape(Capsule())
                            }
                            .disabled(viewModel.isSubmitting)
                        }
                    }
                    .padding(.horizontal, AppTheme.spacingL)
                    .padding(.bottom, AppTheme.spacingL)
                }

                // Confirmation overlay
                if viewModel.showConfirmation {
                    ConfirmationOverlay(message: viewModel.confirmationMessage) {
                        viewModel.reset()
                        onDismiss()
                    }
                    .transition(.opacity)
                }
            }
            .navigationTitle("New Gratitude")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { onDismiss() }
                        .foregroundStyle(AppTheme.textSecondary)
                }
            }
        }
    }
}

// MARK: - Step 1: Category

struct Step1CategoryView: View {
    @Bindable var viewModel: CreatePostViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.spacingL) {
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("What are you grateful for?")
                        .font(AppTheme.title2)
                        .foregroundStyle(AppTheme.textPrimary)

                    Text("Choose a category to organize your gratitude.")
                        .font(AppTheme.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: AppTheme.spacingM) {
                    ForEach(GratitudeCategory.allCases) { category in
                        CategorySelectionCard(
                            category: category,
                            isSelected: viewModel.selectedCategory == category
                        ) {
                            viewModel.selectedCategory = category
                            HapticManager.selection()
                        }
                    }
                }
            }
            .padding(AppTheme.spacingL)
        }
    }
}

// MARK: - Step 2: Content

struct Step2ContentView: View {
    @Bindable var viewModel: CreatePostViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.spacingL) {
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Share your gratitude")
                        .font(AppTheme.title2)
                        .foregroundStyle(AppTheme.textPrimary)

                    Text("Take a moment to reflect on something good.")
                        .font(AppTheme.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                // Main text input
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    TextField("What happened? What made you smile?", text: $viewModel.content, axis: .vertical)
                        .font(AppTheme.body)
                        .lineLimit(3...8)
                        .padding()
                        .background(AppTheme.lightGray.opacity(0.5))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))

                    Text("\(viewModel.content.count) characters")
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.mediumGray)
                }

                // Feeling input
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("How did it make you feel?")
                        .font(AppTheme.headline)
                        .foregroundStyle(AppTheme.textPrimary)

                    TextField("Grateful, warm, connected...", text: $viewModel.feeling)
                        .font(AppTheme.body)
                        .padding()
                        .background(AppTheme.lightGray.opacity(0.5))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
                }

                // Photo picker
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Add a photo (optional)")
                        .font(AppTheme.headline)
                        .foregroundStyle(AppTheme.textPrimary)

                    PhotosPicker(selection: $viewModel.selectedPhotoItem, matching: .images) {
                        if let photoData = viewModel.photoData,
                           let uiImage = UIImage(data: photoData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 150)
                                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
                                .overlay(alignment: .topTrailing) {
                                    Button {
                                        viewModel.photoData = nil
                                        viewModel.selectedPhotoItem = nil
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.title3)
                                            .foregroundStyle(.white)
                                            .shadow(radius: 2)
                                    }
                                    .padding(8)
                                }
                        } else {
                            HStack {
                                Image(systemName: "photo.badge.plus")
                                    .font(.title3)
                                Text("Choose Photo")
                                    .font(AppTheme.subheadline)
                            }
                            .foregroundStyle(AppTheme.warmGold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppTheme.spacingL)
                            .background(AppTheme.warmGold.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
                            .overlay {
                                RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM)
                                    .strokeBorder(AppTheme.warmGold.opacity(0.3), style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                            }
                        }
                    }
                    .onChange(of: viewModel.selectedPhotoItem) {
                        Task { await viewModel.loadPhoto() }
                    }
                }
            }
            .padding(AppTheme.spacingL)
        }
    }
}

// MARK: - Step 3: Card Designer

struct Step3CardDesignerView: View {
    @Bindable var viewModel: CreatePostViewModel
    let userName: String

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.spacingL) {
                // Header
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Design your card")
                        .font(AppTheme.title2)
                        .foregroundStyle(AppTheme.textPrimary)

                    Text("Choose a background style for your gratitude card.")
                        .font(AppTheme.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppTheme.spacingL)

                // Background source picker
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Background Source")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.28)
                        .foregroundStyle(AppTheme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppTheme.spacingL)

                VStack(spacing: AppTheme.spacingS) {
                    ForEach(backgroundSourceOptions, id: \.id) { option in
                        BackgroundSourceOptionCard(
                            option: option,
                            isSelected: viewModel.backgroundSource == option.id,
                            action: {
                                if option.disabled { return }
                                viewModel.backgroundSource = option.id
                                HapticManager.selection()
                            }
                        )
                    }
                }
                .padding(.horizontal, AppTheme.spacingL)

                // Live preview
                VStack(spacing: AppTheme.spacingS) {
                    Text("Live Preview")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.24)
                        .foregroundStyle(AppTheme.textSecondary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill(Color.clear)
                                .overlay {
                                    Capsule()
                                        .strokeBorder(AppTheme.lightGray, lineWidth: 1)
                                }
                        )

                    CardPreviewView(
                        content: viewModel.content,
                        authorName: userName,
                        template: viewModel.selectedTemplate,
                        photoData: viewModel.photoData,
                        backgroundSource: viewModel.backgroundSource,
                        category: viewModel.selectedCategory
                    )
                    .frame(height: 380)
                }
                .padding(.horizontal, AppTheme.spacingL)

                // Template picker (when template source is selected)
                if viewModel.backgroundSource == .template {
                    VStack(alignment: .leading, spacing: AppTheme.spacingM) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Template Library")
                                    .font(.system(size: 10, weight: .semibold))
                                    .tracking(0.28)
                                    .foregroundStyle(AppTheme.textSecondary)

                                Text("Select a polished look for your card.")
                                    .font(AppTheme.subheadline)
                                    .foregroundStyle(AppTheme.textSecondary)
                            }

                            Spacer()

                            Text(viewModel.selectedTemplate.name)
                                .font(.system(size: 10, weight: .semibold))
                                .tracking(0.2)
                                .foregroundStyle(AppTheme.textSecondary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 4)
                                .background(
                                    Capsule()
                                        .strokeBorder(AppTheme.lightGray, lineWidth: 1)
                                )
                        }

                        TemplatePickerView(selectedTemplate: $viewModel.selectedTemplate, columns: 4)
                    }
                    .padding(AppTheme.spacingM)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(AppTheme.cardBackground)
                            .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
                    )
                    .padding(.horizontal, AppTheme.spacingL)
                }

                // Photo preview (when photo source is selected)
                if viewModel.backgroundSource == .photo && viewModel.hasPhoto {
                    VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                        Text("Your Photo")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(0.28)
                            .foregroundStyle(AppTheme.textSecondary)

                        Text("Your uploaded photo becomes the full card background with a readability overlay applied automatically.")
                            .font(AppTheme.subheadline)
                            .foregroundStyle(AppTheme.textSecondary)

                        if let photoData = viewModel.photoData,
                           let uiImage = UIImage(data: photoData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(height: 150)
                                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusL))
                        }
                    }
                    .padding(AppTheme.spacingM)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(AppTheme.cardBackground)
                            .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
                    )
                    .padding(.horizontal, AppTheme.spacingL)
                }

                // AI generation (when AI source is selected)
                if viewModel.backgroundSource == .ai {
                    VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("AI Remix")
                                    .font(.system(size: 10, weight: .semibold))
                                    .tracking(0.28)
                                    .foregroundStyle(AppTheme.textSecondary)

                                Text("Generate a fresh background from your words.")
                                    .font(AppTheme.subheadline)
                                    .foregroundStyle(AppTheme.textSecondary)
                            }
                        }

                        Button {
                            Task { await viewModel.generateAIImage() }
                        } label: {
                            HStack(spacing: 8) {
                                if viewModel.isGeneratingAI {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "sparkles")
                                }

                                Text(viewModel.isGeneratingAI ? "Generating..." : viewModel.aiImageUrl == nil ? "Generate Background" : "Regenerate Background")
                            }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(AppTheme.primaryGradient)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusL))
                        }
                        .disabled(viewModel.isGeneratingAI || viewModel.content.isEmpty)
                    }
                    .padding(AppTheme.spacingM)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(AppTheme.cardBackground)
                            .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
                    )
                    .padding(.horizontal, AppTheme.spacingL)
                }
            }
            .padding(.vertical, AppTheme.spacingL)
        }
    }

    var backgroundSourceOptions: [BackgroundSourceOption] {
        [
            BackgroundSourceOption(
                id: .photo,
                title: "Use Uploaded Photo",
                description: viewModel.hasPhoto
                    ? "Your photo becomes the card background."
                    : "Add a photo first to unlock this option.",
                disabled: !viewModel.hasPhoto
            ),
            BackgroundSourceOption(
                id: .template,
                title: "Choose a Template",
                description: "Pick a polished art direction with predictable contrast.",
                disabled: false
            ),
            BackgroundSourceOption(
                id: .ai,
                title: "AI Remix",
                description: "Generate a new background from your words.",
                badge: "Pro",
                disabled: false
            ),
        ]
    }
}

struct BackgroundSourceOption: Identifiable {
    let id: CardBackgroundSource
    let title: String
    let description: String
    var badge: String?
    var disabled: Bool = false
}

struct BackgroundSourceOptionCard: View {
    let option: BackgroundSourceOption
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.spacingM) {
                Image(systemName: iconName)
                    .font(.title2)
                    .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.mediumGray)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 8) {
                        Text(option.title)
                            .font(AppTheme.headline)
                            .foregroundStyle(option.disabled ? AppTheme.mediumGray : AppTheme.textPrimary)

                        if let badge = option.badge {
                            Text(badge)
                                .font(.system(size: 8, weight: .semibold))
                                .tracking(0.2)
                                .foregroundStyle(AppTheme.textSecondary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(
                                    Capsule()
                                        .strokeBorder(AppTheme.lightGray, lineWidth: 1)
                                )
                        }
                    }

                    Text(option.description)
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.lightGray)
            }
            .padding(AppTheme.spacingM)
            .background(
                isSelected
                    ? AppTheme.warmGold.opacity(0.06)
                    : AppTheme.lightGray.opacity(0.5)
            )
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM)
                        .strokeBorder(AppTheme.warmGold.opacity(0.4), lineWidth: 1.5)
                }
            }
        }
        .buttonStyle(.plain)
        .disabled(option.disabled)
    }

    var iconName: String {
        switch option.id {
        case .photo: return "photo"
        case .template: return "square.grid.2x2"
        case .ai: return "sparkles"
        }
    }
}

// MARK: - Step 4: Visibility

struct Step4VisibilityView: View {
    @Bindable var viewModel: CreatePostViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.spacingL) {
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Who can see this?")
                        .font(AppTheme.title2)
                        .foregroundStyle(AppTheme.textPrimary)

                    Text("You can always change this later.")
                        .font(AppTheme.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                VStack(spacing: AppTheme.spacingM) {
                    ForEach(PostVisibility.allCases, id: \.self) { option in
                        VisibilityOptionCard(
                            visibility: option,
                            isSelected: viewModel.visibility == option
                        ) {
                            viewModel.visibility = option
                            HapticManager.selection()
                        }
                    }
                }

                // Preview
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Preview")
                        .font(AppTheme.headline)
                        .foregroundStyle(AppTheme.textSecondary)

                    HStack(spacing: AppTheme.spacingS) {
                        Image(systemName: viewModel.visibility.icon)
                            .foregroundStyle(AppTheme.warmGold)
                        Text(viewModel.visibility == .anonymousPublic ? "Anonymous" : "You")
                            .font(AppTheme.subheadline)
                            .fontWeight(.medium)
                        Text("·")
                        Text(viewModel.selectedCategory.emoji + " " + viewModel.selectedCategory.rawValue)
                            .font(AppTheme.caption)
                    }
                    .foregroundStyle(AppTheme.textSecondary)

                    Text(viewModel.content.isEmpty ? "Your gratitude will appear here..." : viewModel.content)
                        .font(AppTheme.body)
                        .foregroundStyle(viewModel.content.isEmpty ? AppTheme.mediumGray : AppTheme.textPrimary)
                        .lineLimit(3)
                }
                .padding(AppTheme.spacingM)
                .background(AppTheme.lightGray.opacity(0.5))
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
            }
            .padding(AppTheme.spacingL)
        }
    }
}

struct VisibilityOptionCard: View {
    let visibility: PostVisibility
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.spacingM) {
                Image(systemName: visibility.icon)
                    .font(.title2)
                    .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.mediumGray)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(visibility.label)
                        .font(AppTheme.headline)
                        .foregroundStyle(AppTheme.textPrimary)

                    Text(visibility.description)
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isSelected ? AppTheme.warmGold : AppTheme.lightGray)
            }
            .padding(AppTheme.spacingM)
            .background(isSelected ? AppTheme.warmGold.opacity(0.06) : AppTheme.lightGray.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM)
                        .strokeBorder(AppTheme.warmGold.opacity(0.4), lineWidth: 1.5)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Category Selection Card

struct CategorySelectionCard: View {
    let category: GratitudeCategory
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: AppTheme.spacingS) {
                Text(category.emoji)
                    .font(.system(size: 36))

                Text(category.displayName)
                    .font(AppTheme.headline)
                    .foregroundStyle(isSelected ? AppTheme.categoryColor(category) : AppTheme.textPrimary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.spacingL)
            .background(
                isSelected
                    ? AppTheme.categoryColor(category).opacity(0.1)
                    : AppTheme.lightGray.opacity(0.5)
            )
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusL))
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadiusL)
                        .strokeBorder(AppTheme.categoryColor(category), lineWidth: 2)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
