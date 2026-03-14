import Foundation
import AuthenticationServices

@Observable
final class AuthViewModel {
    var isAuthenticated = false
    var currentUser: UserProfile?
    var showError = false
    var errorMessage = ""

    private let authService: AuthService

    init(authService: AuthService) {
        self.authService = authService
        self.isAuthenticated = authService.isAuthenticated
        self.currentUser = authService.currentUser
    }

    func handleSignInWithApple(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            authService.handleSignInWithApple(authorization)
            isAuthenticated = authService.isAuthenticated
            currentUser = authService.currentUser
        case .failure(let error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func signInAsGuest() {
        authService.signInAsGuest()
        isAuthenticated = authService.isAuthenticated
        currentUser = authService.currentUser
    }

    func signOut() {
        authService.signOut()
        isAuthenticated = false
        currentUser = nil
    }

    func updateDisplayName(_ name: String) {
        authService.updateDisplayName(name)
        currentUser = authService.currentUser
    }
}
