export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Legal</p>
      <h1 className="text-title tracking-tight text-brand-text-primary mb-2">Privacy Policy</h1>
      <p className="text-footnote text-brand-text-muted mb-10">Effective date: March 18, 2026</p>

      <div className="space-y-8 text-brand-text-secondary text-body leading-relaxed">
        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">1. Overview</h2>
          <p>Pathvana LLC ("we", "us") operates the Appreciate app. This policy explains what data we collect, how we use it, and your rights regarding that data.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">2. Data We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="font-medium text-brand-text-primary">Account data:</span> Email address and display name when you sign up.</li>
            <li><span className="font-medium text-brand-text-primary">Content:</span> Gratitude posts, feelings, categories, and photos you choose to create.</li>
            <li><span className="font-medium text-brand-text-primary">Usage data:</span> Basic activity such as post dates used to calculate streaks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and operate the App.</li>
            <li>To display your posts and streak data to you.</li>
            <li>To show public posts on the community feed (only posts you mark as Public or Anonymous).</li>
          </ul>
          <p className="mt-3">We do not sell your data to third parties. We do not use your content to train AI models.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">4. Data Storage</h2>
          <p>Your data is stored securely using Supabase (cloud infrastructure). Photos are stored in a secure object storage bucket. All data is encrypted in transit and at rest.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">5. Post Visibility</h2>
          <p>Posts marked <strong>Private</strong> are only visible to you. Posts marked <strong>Public</strong> appear on the community feed with your display name. Posts marked <strong>Anonymous</strong> appear on the feed without identifying information.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">6. Your Rights</h2>
          <p>You may delete your posts at any time from My Wall. You may request deletion of your account and all associated data by emailing <a href="mailto:support@aitrove.ai" className="underline underline-offset-2 hover:text-brand-primary transition-colors">support@aitrove.ai</a>. We will process deletion requests within 30 days.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">7. Cookies</h2>
          <p>We use cookies solely to maintain your authentication session. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">8. Children</h2>
          <p>The App is not directed to children under 13. We do not knowingly collect data from children under 13.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">9. Changes</h2>
          <p>We may update this policy. We will notify users of significant changes via the App or email.</p>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold tracking-widest uppercase text-brand-text-primary mb-3">10. Contact</h2>
          <p>Questions about this policy: <a href="mailto:support@aitrove.ai" className="underline underline-offset-2 hover:text-brand-primary transition-colors">support@aitrove.ai</a></p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-brand-divider text-[11px] tracking-widest uppercase text-brand-text-muted">
        Pathvana LLC · <a href="/terms" className="hover:text-brand-primary transition-colors">Terms of Service</a>
      </div>
    </div>
  )
}
