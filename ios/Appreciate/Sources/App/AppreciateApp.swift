import SwiftUI
import SwiftData

@main
struct AppreciateApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: [GratitudePost.self, UserProfile.self])
    }
}
