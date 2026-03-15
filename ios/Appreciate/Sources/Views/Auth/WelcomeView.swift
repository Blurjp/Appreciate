import SwiftUI
import AuthenticationServices

struct WelcomeView: View {
    let authVM: AuthViewModel

    @State private var currentPage = 0
    @State private var showSignIn = false

    private let onboardingPages = [
        OnboardingPage(
            emoji: "🙏",
            title: "Welcome to Appreciate",
            subtitle: "Making the world a more appreciative place, one note at a time.",
            color: Color(hex: "F5A623")
        ),
        OnboardingPage(
            emoji: "📝",
            title: "Log Your Gratitude",
            subtitle: "Build a daily habit of gratitude. Track your streaks and watch your appreciation grow.",
            color: Color(hex: "FF6F61")
        ),
        OnboardingPage(
            emoji: "🌍",
            title: "Share or Keep Private",
            subtitle: "You control who sees your posts. Share publicly, anonymously, or keep them just for you.",
            color: Color(hex: "7BC67E")
        ),
    ]

    var body: some View {
        ZStack {
            AppTheme.warmGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Onboarding pages
                TabView(selection: $currentPage) {
                    ForEach(0..<onboardingPages.count, id: \.self) { index in
                        OnboardingPageView(page: onboardingPages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))
                .frame(height: 400)

                Spacer()

                // Sign in buttons
                VStack(spacing: AppTheme.spacingM) {
                    SignInWithAppleButton(.signIn) { request in
                        request.requestedScopes = [.fullName, .email]
                    } onCompletion: { result in
                        authVM.handleSignInWithApple(result)
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))

                    Button {
                        authVM.signInAsGuest()
                    } label: {
                        Text("Continue as Guest")
                            .font(AppTheme.headline)
                            .foregroundStyle(AppTheme.textSecondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(AppTheme.lightGray)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusM))
                    }

                    Text("Your data stays on your device")
                        .font(AppTheme.caption)
                        .foregroundStyle(AppTheme.mediumGray)
                }
                .padding(.horizontal, AppTheme.spacingL)
                .padding(.bottom, AppTheme.spacingXL)
            }
        }
        .alert("Sign In Error", isPresented: .init(
            get: { authVM.showError },
            set: { authVM.showError = $0 }
        )) {
            Button("OK") { authVM.showError = false }
        } message: {
            Text(authVM.errorMessage)
        }
    }
}

// MARK: - Onboarding Page

struct OnboardingPage {
    let emoji: String
    let title: String
    let subtitle: String
    let color: Color
}

struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: AppTheme.spacingL) {
            Text(page.emoji)
                .font(.system(size: 80))

            Text(page.title)
                .font(AppTheme.title)
                .foregroundStyle(AppTheme.textPrimary)
                .multilineTextAlignment(.center)

            Text(page.subtitle)
                .font(AppTheme.body)
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppTheme.spacingXL)
        }
        .padding()
    }
}
