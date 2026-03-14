import SwiftUI

struct ConfirmationOverlay: View {
    let message: String
    let onDismiss: () -> Void

    @State private var scale: CGFloat = 0.5
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: AppTheme.spacingL) {
                // Animated checkmark
                ZStack {
                    Circle()
                        .fill(AppTheme.primaryGradient)
                        .frame(width: 80, height: 80)

                    Image(systemName: "heart.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(.white)
                }
                .scaleEffect(scale)

                Text(message)
                    .font(AppTheme.title3)
                    .foregroundStyle(AppTheme.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Button {
                    onDismiss()
                } label: {
                    Text("Continue")
                        .font(AppTheme.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(AppTheme.primaryGradient)
                        .clipShape(Capsule())
                }
                .padding(.horizontal, AppTheme.spacingXL)
            }
            .padding(AppTheme.spacingXL)
            .background {
                RoundedRectangle(cornerRadius: AppTheme.cornerRadiusXL)
                    .fill(AppTheme.cardBackground)
            }
            .padding(AppTheme.spacingXL)
            .opacity(opacity)
        }
        .onAppear {
            HapticManager.notification(.success)
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scale = 1.0
                opacity = 1.0
            }
        }
    }
}
