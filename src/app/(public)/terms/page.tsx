import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MeetZone',
  description: 'MeetZone terms of service. Read about the terms and conditions governing use of our time zone conversion tools.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Terms of Service</h1>
        <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using MeetZone (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          MeetZone provides free online tools for time zone conversion, world clock display, and meeting planning.
          The Service is provided &quot;as is&quot; without warranties of any kind.
        </p>

        <h2>3. Accuracy</h2>
        <p>
          While we strive for accuracy in all time zone conversions, we cannot guarantee that all information is error-free.
          Time zone rules change periodically, and there may be brief periods where our data is not fully up to date.
          Users should verify critical time conversions independently.
        </p>

        <h2>4. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to the Service or its systems</li>
          <li>Use automated systems to scrape or extract data at scale</li>
          <li>Interfere with or disrupt the Service</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          The Service&apos;s content, features, and functionality are owned by MeetZone and are protected by international copyright, trademark, and other intellectual property laws.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          MeetZone shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
          This includes but is not limited to damages arising from missed meetings, incorrect time conversions, or scheduling errors.
        </p>

        <h2>7. Modifications</h2>
        <p>
          We reserve the right to modify or discontinue the Service at any time without notice. We may also update these Terms from time to time.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions about these Terms, please contact us at <a href="mailto:support@meetzone.es">support@meetzone.es</a>.
        </p>
      </div>
    </main>
  );
}
