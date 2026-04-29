import Foundation

enum AIServiceError: LocalizedError {
    case notAuthenticated
    case invalidResponse
    case generationFailed(String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated: "You must be signed in"
        case .invalidResponse: "Invalid response from server"
        case .generationFailed(let msg): msg
        }
    }
}

enum AIService {
    @MainActor
    static func generateImage(content: String, feeling: String = "") async throws -> URL {
        guard let accessToken = SupabaseService.shared.client.auth.currentSession?.accessToken else {
            throw AIServiceError.notAuthenticated
        }

        let baseURL = SupabaseConfig.apiBaseURL
        let url = baseURL.appendingPathComponent("api/ai/generate-image")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        let body: [String: String] = [
            "content": content,
            "feeling": feeling,
        ]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIServiceError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            throw AIServiceError.notAuthenticated
        }

        guard httpResponse.statusCode == 200 else {
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let error = json["error"] as? String {
                throw AIServiceError.generationFailed(error)
            }
            throw AIServiceError.generationFailed("Server error (\(httpResponse.statusCode))")
        }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let dataDict = json["data"] as? [String: Any],
              let imageURLString = dataDict["imageURL"] as? String,
              let imageURL = URL(string: imageURLString) else {
            throw AIServiceError.invalidResponse
        }

        return imageURL
    }
}
