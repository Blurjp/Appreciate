import SwiftUI

struct ToastView: View {
    let message: String
    let icon: String
    var isError: Bool = false

    var body: some View {
        HStack(spacing: AppTheme.spacingS) {
            Image(systemName: icon)
                .font(.body)
            Text(message)
                .font(AppTheme.subheadline)
        }
        .foregroundStyle(.white)
        .padding(.horizontal, AppTheme.spacingL)
        .padding(.vertical, AppTheme.spacingM)
        .background(
            Capsule()
                .fill(isError ? Color.red.opacity(0.9) : AppTheme.deepCharcoal.opacity(0.9))
        )
        .shadow(color: .black.opacity(0.15), radius: 10, y: 5)
    }
}

struct ToastModifier: ViewModifier {
    @Binding var isPresented: Bool
    let message: String
    var icon: String = "checkmark.circle.fill"
    var isError: Bool = false
    var duration: Double = 2.5

    func body(content: Content) -> some View {
        content
            .overlay(alignment: .top) {
                if isPresented {
                    ToastView(message: message, icon: icon, isError: isError)
                        .padding(.top, 8)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .onAppear {
                            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                                withAnimation(.easeOut(duration: 0.3)) {
                                    isPresented = false
                                }
                            }
                        }
                        .zIndex(100)
                }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: isPresented)
    }
}

extension View {
    func toast(isPresented: Binding<Bool>, message: String, icon: String = "checkmark.circle.fill", isError: Bool = false) -> some View {
        modifier(ToastModifier(isPresented: isPresented, message: message, icon: icon, isError: isError))
    }
}
