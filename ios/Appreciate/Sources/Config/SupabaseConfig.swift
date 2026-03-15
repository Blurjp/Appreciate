import Foundation

/// Configuration for connecting to Supabase backend.
/// Values are loaded from Config.xcconfig (not committed to git)
enum SupabaseConfig {
    static let supabaseURL: URL = {
        guard let urlString = Bundle.main.infoDictionary?["SUPABASE_URL"] as? String,
              let url = URL(string: urlString) else {
            fatalError("SUPABASE_URL not found in Info.plist. Check Config.xcconfig")
        }
        return url
    }()

    static let supabaseAnonKey: String = {
        guard let key = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String else {
            fatalError("SUPABASE_ANON_KEY not found in Info.plist. Check Config.xcconfig")
        }
        return key
    }()
}
