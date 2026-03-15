import SwiftUI
import SwiftData

struct RootView: View {
    @Environment(\.modelContext) private var modelContext

    @State private var authService: AuthService?
    @State private var authVM: AuthViewModel?
    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false

    var body: some View {
        Group {
            if !hasSeenOnboarding {
                OnboardingView(hasSeenOnboarding: $hasSeenOnboarding)
            } else if let authVM {
                if authVM.isAuthenticated {
                    MainTabView(authVM: authVM, modelContext: modelContext)
                } else {
                    WelcomeView(authVM: authVM)
                }
            } else {
                // Loading state
                ZStack {
                    AppTheme.warmGradient.ignoresSafeArea()
                    VStack(spacing: AppTheme.spacingM) {
                        Text("🙏")
                            .font(.system(size: 64))
                        Text("Appreciate")
                            .font(AppTheme.largeTitle)
                            .foregroundStyle(AppTheme.textPrimary)
                    }
                }
            }
        }
        .onAppear {
            let service = AuthService(modelContext: modelContext)
            authService = service
            authVM = AuthViewModel(authService: service)
        }
    }
}
