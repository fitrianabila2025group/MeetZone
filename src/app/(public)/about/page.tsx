import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About TimeWise – Your Time Zone & Meeting Planner Hub',
  description: 'Learn about TimeWise, the free online tool for time zone conversion, world clock, and meeting planning across time zones.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>About TimeWise</h1>
        <p>
          TimeWise is your go-to hub for all things related to time zones. Whether you&apos;re scheduling a meeting across continents,
          checking the current time in another city, or figuring out the best overlap window for your remote team, TimeWise has you covered.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe that time zone confusion shouldn&apos;t be a barrier to global collaboration. Our mission is to provide the most
          accurate, user-friendly, and comprehensive time zone tools on the web — completely free.
        </p>

        <h2>What We Offer</h2>
        <ul>
          <li><strong>Time Zone Converter</strong> – Convert times between any two cities with DST-aware accuracy</li>
          <li><strong>Meeting Planner</strong> – Find the best meeting times across multiple time zones</li>
          <li><strong>World Clock</strong> – Track current time in up to 12 cities simultaneously</li>
          <li><strong>City Directory</strong> – Browse 300+ cities with their time zone information</li>
          <li><strong>Shareable Meetings</strong> – Create and share meeting links that show times in each participant&apos;s zone</li>
        </ul>

        <h2>Accuracy</h2>
        <p>
          TimeWise uses the IANA Time Zone Database, the global standard maintained by the Internet Assigned Numbers Authority.
          All conversions account for Daylight Saving Time (DST) transitions automatically.
        </p>

        <h2>Contact</h2>
        <p>
          Have feedback, questions, or suggestions? Visit our <a href="/contact">contact page</a> to get in touch.
        </p>
      </div>
    </main>
  );
}
