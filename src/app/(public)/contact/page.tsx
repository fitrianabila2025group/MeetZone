import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | TimeWise',
  description: 'Get in touch with the TimeWise team. Send us feedback, report bugs, or ask questions about our time zone tools.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Contact Us</h1>
        <p>
          We&apos;d love to hear from you! Whether you have feedback, feature requests, or found a bug, please reach out.
        </p>

        <h2>Get in Touch</h2>
        <p>
          Send us an email at: <a href="mailto:support@timewise.online">support@timewise.online</a>
        </p>

        <h2>Report a Bug</h2>
        <p>
          If you&apos;ve found a time zone conversion error or any other issue, please let us know with:
        </p>
        <ul>
          <li>The cities or time zones involved</li>
          <li>The date and time you were converting</li>
          <li>What you expected vs. what you saw</li>
          <li>Your browser and device</li>
        </ul>

        <h2>Feature Requests</h2>
        <p>
          Have an idea for a feature? We&apos;re always looking to improve TimeWise. Send your suggestions to our email above.
        </p>
      </div>
    </main>
  );
}
