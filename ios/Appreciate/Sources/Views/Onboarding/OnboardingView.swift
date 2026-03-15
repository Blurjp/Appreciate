import SwiftUI

struct OnboardingView: View {
    @Binding var hasSeenOnboarding: Bool

    @State private var currentPage = 0

    private let pages: [OnboardingItem] = [
        OnboardingItem(
            emoji: "🙏",
            title: "Welcome to Appreciate",
            description: "A private space to practice gratitude daily and become more mindful of the good in your life.",
            color: AppTheme.warmGold
        ),
        OnboardingItem(
            emoji: "📝",
            title: "Write Daily Gratitude",
            description: "Capture what you're thankful for. Add photos, feelings, and categorize your moments of appreciation.",
            color: AppTheme.softCoral
        ),
        OnboardingItem(
            emoji: "🔥",
            title: "Build Your Streak",
            description: "Stay consistent and watch your gratitude habit grow. Track your daily posting streak.",
            color: AppTheme.sunsetOrange
        ),
        OnboardingItem(
            emoji: "🌍",
            title: "Share or Stay Private",
            description: "Keep your gratitude private, share it publicly, or post anonymously. You're always in control.",
            color: AppTheme.sageGreen
        ),
    ]

    var body: some View {
        ZStack {
            AppTheme.warmGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // Skip button
                HStack {
                    Spacer()
                    if currentPage < pages.count - 1 {
                        Button("Skip") {
                            withAnimation { hasSeenOnboarding = true }
                        }
                        .font(AppTheme.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                        .padding()
                    }
                }

                // Pages
                TabView(selection: $currentPage) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        OnboardingPageContent(item: pages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))

                // Bottom action
                VStack(spacing: AppTheme.spacingM) {
                    if currentPage == pages.count - 1 {
                        Button {
                            withAnimation(.spring) {
                                hasSeenOnboarding = true
                            }
                        } label: {
                            Text("Get Started")
                                .font(AppTheme.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(AppTheme.primaryGradient)
                                .clipShape(Capsule())
                        }
                    } else {
                        Button {
                            withAnimation { currentPage += 1 }
                        } label: {
                            Text("Next")
                                .font(AppTheme.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(AppTheme.primaryGradient)
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal, AppTheme.spacingXL)
                .padding(.bottom, AppTheme.spacingXL)
            }
        }
    }
}

struct OnboardingItem {
    let emoji: String
    let title: String
    let description: String
    let color: Color
}

struct OnboardingPageContent: View {
    let item: OnboardingItem

    @State private var isAnimated = false

    var body: some View {
        VStack(spacing: AppTheme.spacingL) {
            Spacer()

            Text(item.emoji)
                .font(.system(size: 80))
                .scaleEffect(isAnimated ? 1.0 : 0.5)
                .opacity(isAnimated ? 1.0 : 0)

            Text(item.title)
                .font(AppTheme.title)
                .foregroundStyle(AppTheme.textPrimary)
                .multilineTextAlignment(.center)

            Text(item.description)
                .font(AppTheme.body)
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppTheme.spacingXL)

            Spacer()
            Spacer()
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                isAnimated = true
            }
        }
        .onDisappear {
            isAnimated = false
        }
    }
}
