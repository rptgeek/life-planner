export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <a href="/" className="text-indigo-600 text-sm hover:underline">← Back to Life Planner</a>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Effective date: April 9, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Overview</h2>
            <p>
              Life Planner (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a personal productivity tool that helps you plan
              your day, track tasks, set goals, and connect your Google Calendar. We take your privacy
              seriously and collect only what is necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Google Account Information:</strong> When you sign in with Google, we receive
                your name, email address, and profile picture via OAuth. This is used solely to
                identify your account.
              </li>
              <li>
                <strong>Google Calendar Data:</strong> If you connect Google Calendar, we read and
                write calendar events on your behalf using a temporary access token. This token is
                stored only in your browser&apos;s session storage and is never sent to our servers.
              </li>
              <li>
                <strong>App Data:</strong> Tasks, goals, daily plans, and settings you create are
                stored in our database (Supabase) and are associated with your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the Life Planner service</li>
              <li>To sync your tasks and goals across devices</li>
              <li>To read and write Google Calendar events when you explicitly request it</li>
              <li>To authenticate you securely via Google OAuth</li>
            </ul>
            <p className="mt-3">
              We do not use your data for advertising, analytics sold to third parties, or any purpose
              beyond operating the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Google API Disclosure</h2>
            <p>
              Life Planner&apos;s use of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-indigo-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="mt-3">
              Specifically: Google Calendar data is used only to display your events alongside your
              planned tasks and to create/update/delete events when you take action in the app. This
              data is not stored on our servers, shared with third parties, or used for any secondary
              purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal data with any third parties, except as
              required by law or to operate the service (e.g., our database provider Supabase, which
              is bound by its own privacy policy and data processing agreement).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Data Retention & Deletion</h2>
            <p>
              Your data is retained as long as your account is active. You may request deletion of
              your account and all associated data at any time by contacting us at the email below.
              Google Calendar tokens are session-only and are automatically cleared when you close
              your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Security</h2>
            <p>
              Your app data is stored securely using Supabase with row-level security policies, meaning
              only you can access your own data. All communication is encrypted via HTTPS. Google
              Calendar tokens are never persisted beyond your browser session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Life Planner is not directed at children under the age of 13. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this
              page with an updated effective date. Continued use of the app after changes constitutes
              acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Contact</h2>
            <p>
              For questions about this privacy policy or to request data deletion, contact us at:{' '}
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
