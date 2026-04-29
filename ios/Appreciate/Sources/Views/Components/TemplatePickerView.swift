import SwiftUI

/// A grid picker for selecting card templates
struct TemplatePickerView: View {
    @Binding var selectedTemplate: CardTemplate
    let columns: [GridItem]

    init(selectedTemplate: Binding<CardTemplate>, columns: Int = 2) {
        self._selectedTemplate = selectedTemplate
        self.columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: columns)
    }

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(CardTemplate.allTemplates) { template in
                TemplateCard(
                    template: template,
                    isSelected: selectedTemplate.id == template.id
                ) {
                    selectedTemplate = template
                    HapticManager.selection()
                }
            }
        }
    }
}

/// Individual template card in the picker
struct TemplateCard: View {
    let template: CardTemplate
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                // Gradient preview
                RoundedRectangle(cornerRadius: 12)
                    .fill(template.gradient)
                    .frame(height: 60)
                    .overlay {
                        if isSelected {
                            RoundedRectangle(cornerRadius: 12)
                                .strokeBorder(AppTheme.warmGold, lineWidth: 2)
                        }
                    }
                    .shadow(color: template.accentUIColor.opacity(0.3), radius: 4, x: 0, y: 2)

                // Template name
                Text(template.name)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(isSelected ? AppTheme.warmGold : AppTheme.textPrimary)
            }
            .padding(8)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(isSelected ? AppTheme.warmGold.opacity(0.08) : Color.clear)
            )
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: 16)
                        .strokeBorder(AppTheme.warmGold.opacity(0.4), lineWidth: 1.5)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var selectedTemplate: CardTemplate = .default

        var body: some View {
            VStack {
                TemplatePickerView(selectedTemplate: $selectedTemplate)
                    .padding()

                Text("Selected: \(selectedTemplate.name)")
                    .font(.headline)
            }
            .background(AppTheme.background)
        }
    }

    return PreviewWrapper()
}
