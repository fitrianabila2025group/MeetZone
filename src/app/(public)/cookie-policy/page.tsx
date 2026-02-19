import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | MeetZone',
  description: 'Learn about how MeetZone uses cookies and similar technologies.',
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Cookie Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>

        <h2>What Are Cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.
        </p>

        <h2>How We Use Cookies</h2>

        <h3>Essential Cookies</h3>
        <p>These cookies are necessary for the website to function properly:</p>
        <ul>
          <li><strong>Session cookies</strong> – Required for authentication (admin area only)</li>
          <li><strong>Preference cookies</strong> – Remember your 12/24-hour time format preference</li>
        </ul>

        <h3>Analytics Cookies</h3>
        <p>We may use Google Analytics to understand how visitors use our site. These cookies collect anonymous information about:</p>
        <ul>
          <li>Pages visited and time spent</li>
          <li>How you arrived at our site</li>
          <li>General geographic location (country level)</li>
        </ul>

        <h3>Advertising Cookies</h3>
        <p>
          Our advertising partners may set cookies to display relevant ads. These may include cookies from Google AdSense and other advertising networks.
        </p>

        <h2>Managing Cookies</h2>
        <p>
          You can control and manage cookies through your browser settings. Most browsers allow you to:
        </p>
        <ul>
          <li>View what cookies are stored</li>
          <li>Delete individual or all cookies</li>
          <li>Block cookies from specific or all sites</li>
          <li>Block third-party cookies</li>
        </ul>
        <p>
          Please note that blocking essential cookies may affect the functionality of the Service.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about our use of cookies, please contact us at <a href="mailto:support@meetzone.es">support@meetzone.es</a>.
        </p>
      </div>
    </main>
  );
}
