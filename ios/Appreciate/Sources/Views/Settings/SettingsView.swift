import SwiftUI

struct SettingsView: View {
    let authVM: AuthViewModel

    @State private var editingName = false
    @State private var newName = ""

    var body: some View {
        List {
            // Profile section
            Section {
                HStack(spacing: AppTheme.spacingM) {
                    Circle()
                        .fill(AppTheme.primaryGradient)
                        .frame(width: 56, height: 56)
                        .overlay {
                            Text((authVM.currentUser?.displayName ?? "?").prefix(1).uppercased())
                                .font(AppTheme.title2)
                                .foregroundStyle(.white)
                        }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(authVM.currentUser?.displayName ?? "Guest")
                            .font(AppTheme.headline)
                            .foregroundStyle(AppTheme.textPrimary)

                        Text(authVM.currentUser?.email ?? "Guest account")
                            .font(AppTheme.caption)
                            .foregroundStyle(AppTheme.textSecondary)
                    }

                    Spacer()

                    Button {
                        newName = authVM.currentUser?.displayName ?? ""
                        editingName = true
                    } label: {
                        Image(systemName: "pencil.circle.fill")
                            .font(.title2)
                            .foregroundStyle(AppTheme.warmGold)
                    }
                }
                .padding(.vertical, 4)
            }

            // App info
            Section("About") {
                HStack {
                    Label("Version", systemImage: "info.circle")
                    Spacer()
                    Text("1.0.0 (MVP)")
                        .foregroundStyle(AppTheme.textSecondary)
                }

                HStack {
                    Label("Data Storage", systemImage: "iphone")
                    Spacer()
                    Text("On Device")
                        .foregroundStyle(AppTheme.textSecondary)
                }
            }

            // Sign out
            Section {
                Button(role: .destructive) {
                    authVM.signOut()
                } label: {
                    Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
        }
        .navigationTitle("Settings")
        .alert("Edit Display Name", isPresented: $editingName) {
            TextField("Your name", text: $newName)
            Button("Save") {
                if !newName.trimmingCharacters(in: .whitespaces).isEmpty {
                    authVM.updateDisplayName(newName)
                }
            }
            Button("Cancel", role: .cancel) { }
        }
    }
}
