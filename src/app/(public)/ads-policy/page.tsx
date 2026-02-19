import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertising Policy | MeetZone',
  description: 'Learn about how MeetZone displays advertisements and works with advertising partners.',
  alternates: { canonical: '/ads-policy' },
};

export default function AdsPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Advertising Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>

        <h2>How We Use Advertising</h2>
        <p>
          MeetZone is a free service supported by advertising. Ads help us keep our time zone tools free for everyone.
        </p>

        <h2>Advertising Partners</h2>
        <p>We may work with the following advertising networks:</p>
        <ul>
          <li><strong>Google AdSense</strong> – Contextual and personalized advertising</li>
          <li><strong>Other Networks</strong> – Additional advertising partners as needed</li>
        </ul>

        <h2>Ad Placement</h2>
        <p>
          We place ads in designated areas of our pages. We strive to ensure that ads do not interfere with the usability of our tools.
          Ad placements may include:
        </p>
        <ul>
          <li>Banner ads in the header or sidebar</li>
          <li>In-content ads between sections</li>
          <li>Footer ads</li>
        </ul>

        <h2>Personalized Advertising</h2>
        <p>
          Some of our advertising partners may use cookies and similar technologies to display personalized ads based on your browsing history.
          You can opt out of personalized advertising through:
        </p>
        <ul>
          <li><a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
          <li><a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance Opt-Out</a></li>
          <li>Your browser&apos;s cookie settings</li>
        </ul>

        <h2>Contact</h2>
        <p>
          For questions about our advertising practices, please contact us at <a href="mailto:support@meetzone.es">support@meetzone.es</a>.
        </p>
      </div>
    </main>
  );
}
