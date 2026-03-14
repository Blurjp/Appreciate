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
                        Step1ContentView(viewModel: viewModel)
                            .tag(1)
                        Step2CategoryView(viewModel: viewModel)
                            .tag(2)
                        Step3VisibilityView(viewModel: viewModel)
                            .tag(3)
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
                                    viewModel.canProceedFromStep1
                                        ? AppTheme.primaryGradient
                                        : LinearGradient(colors: [AppTheme.mediumGray], startPoint: .leading, endPoint: .trailing)
                                )
                                .clipShape(Capsule())
                            }
                            .disabled(!viewModel.canProceedFromStep1)
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

// MARK: - Step 1: Content

struct Step1ContentView: View {
    @Bindable var viewModel: CreatePostViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.spacingL) {
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("What are you grateful for today?")
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

// MARK: - Step 2: Category

struct Step2CategoryView: View {
    @Bindable var viewModel: CreatePostViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.spacingL) {
                VStack(alignment: .leading, spacing: AppTheme.spacingS) {
                    Text("Categorize your gratitude")
                        .font(AppTheme.title2)
                        .foregroundStyle(AppTheme.textPrimary)

                    Text("This helps you reflect on different areas of life.")
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
                        }
                    }
                }
            }
            .padding(AppTheme.spacingL)
        }
    }
}

struct CategorySelectionCard: View {
    let category: GratitudeCategory
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: AppTheme.spacingS) {
                Text(category.emoji)
                    .font(.system(size: 36))

                Text(category.rawValue)
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

// MARK: - Step 3: Visibility

struct Step3VisibilityView: View {
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
