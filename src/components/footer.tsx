import Link from 'next/link';
import { Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 md:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-bold">TimeWise</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free time zone converter and meeting planner for global teams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/time" className="hover:text-foreground">Time Converter</Link></li>
              <li><Link href="/meeting-planner" className="hover:text-foreground">Meeting Planner</Link></li>
              <li><Link href="/world-clock" className="hover:text-foreground">World Clock</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cities" className="hover:text-foreground">Cities</Link></li>
              <li><Link href="/timezones" className="hover:text-foreground">Timezones</Link></li>
              <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-foreground">Cookie Policy</Link></li>
              <li><Link href="/ads-policy" className="hover:text-foreground">Ads Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TimeWise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
