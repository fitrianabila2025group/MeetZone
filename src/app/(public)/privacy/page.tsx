import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MeetZone',
  description: 'MeetZone privacy policy. Learn how we collect, use, and protect your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>

        <h2>1. Information We Collect</h2>
        <p>
          MeetZone collects minimal information to provide our services:
        </p>
        <ul>
          <li><strong>Usage Data</strong> – We may collect anonymous usage statistics such as pages viewed, features used, and general geographic region.</li>
          <li><strong>Cookies</strong> – We use essential cookies for site functionality and optional cookies for analytics and advertising. See our <a href="/cookie-policy">Cookie Policy</a> for details.</li>
          <li><strong>Meeting Data</strong> – When you create a shareable meeting, we store the meeting details (title, date, cities) to generate the shareable link. No personal information is required.</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>To provide and improve our time zone conversion services</li>
          <li>To generate shareable meeting links</li>
          <li>To analyze usage patterns and improve user experience</li>
          <li>To display relevant advertisements</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>We may use the following third-party services:</p>
        <ul>
          <li><strong>Google Analytics</strong> – For website analytics</li>
          <li><strong>Google AdSense</strong> – For displaying advertisements</li>
          <li>Other advertising networks as configured by our administrators</li>
        </ul>
        <p>These services may collect data according to their own privacy policies.</p>

        <h2>4. Data Storage</h2>
        <p>
          We store data on secure servers. Meeting share data is stored indefinitely but may be purged after extended periods of inactivity.
        </p>

        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the data we hold about you</li>
          <li>Request deletion of your data</li>
          <li>Opt out of analytics cookies</li>
          <li>Use our services without creating an account</li>
        </ul>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          Our services are not directed at children under 13. We do not knowingly collect personal information from children.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy-related questions, please contact us at <a href="mailto:support@meetzone.es">support@meetzone.es</a>.
        </p>
      </div>
    </main>
  );
}
