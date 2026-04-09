export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <a href="/" className="text-indigo-600 text-sm hover:underline">← Back to Life Planner</a>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Effective date: April 9, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Life Planner (&quot;the app&quot;), you agree to be bound by these Terms
              of Service. If you do not agree, please do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Description of Service</h2>
            <p>
              Life Planner is a personal productivity application that helps you plan your day, manage
              tasks, track goals, and optionally integrate with Google Calendar. The service is
              provided as-is for personal use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Account Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must have a valid Google account to sign in.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You agree not to use the app for any unlawful purpose.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Google Calendar Integration</h2>
            <p>
              When you connect Google Calendar, you grant Life Planner permission to read and write
              calendar events on your behalf. You may revoke this permission at any time via your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-indigo-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Account settings
              </a>
              . Revoking access will disconnect the calendar integration but will not affect your
              other app data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Your Data</h2>
            <p>
              You retain ownership of all content you create in the app — tasks, goals, notes, and
              plans. We do not claim any intellectual property rights over your data. See our{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a> for
              details on how your data is stored and handled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Attempt to gain unauthorized access to any part of the service or its infrastructure</li>
              <li>Use the app in any way that could damage, disable, or impair the service</li>
              <li>Use automated tools to scrape or extract data from the app</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Availability & Modifications</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the app at any time without
              notice. We will make reasonable efforts to maintain availability but do not guarantee
              uninterrupted access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Disclaimer of Warranties</h2>
            <p>
              Life Planner is provided &quot;as is&quot; without warranties of any kind, express or implied.
              We do not warrant that the app will be error-free, secure, or available at all times.
              Use the app at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Life Planner and its operators shall not be
              liable for any indirect, incidental, special, or consequential damages arising out of
              your use of the app, including loss of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the app after changes
              are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Contact</h2>
            <p>
              Questions about these terms? Contact us at:{' '}
              <a href="mailto:garypope@gmail.com" className="text-indigo-600 hover:underline">
                garypope@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
