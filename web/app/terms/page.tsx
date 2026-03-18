export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-1">Legal</p>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Effective date: March 18, 2026</p>

      <div className="space-y-8 text-gray-700 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">1. Agreement</h2>
          <p>By accessing or using Appreciate ("the App"), you agree to be bound by these Terms of Service. The App is operated by Pathvana LLC. If you do not agree to these terms, do not use the App.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">2. Use of the App</h2>
          <p>You must be at least 13 years old to use the App. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree not to use the App for any unlawful purpose or in any way that could harm Pathvana LLC or other users.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">3. User Content</h2>
          <p>You retain ownership of content you post. By posting content, you grant Pathvana LLC a non-exclusive, royalty-free license to store and display that content solely for the purpose of operating the App. You are solely responsible for content you create.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">4. Privacy</h2>
          <p>Your use of the App is also governed by our <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>, which is incorporated into these Terms.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">5. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time from the Settings page.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">6. Disclaimers</h2>
          <p>The App is provided "as is" without warranties of any kind. Pathvana LLC is not liable for any indirect, incidental, or consequential damages arising from your use of the App.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">7. Changes</h2>
          <p>We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-900 mb-3">8. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:support@aitrove.ai" className="underline underline-offset-2">support@aitrove.ai</a>.</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-[11px] tracking-widest uppercase text-gray-400">
        Pathvana LLC · <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
      </div>
    </div>
  )
}
