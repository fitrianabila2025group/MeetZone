'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/time', label: 'Time Converter' },
  { href: '/meeting-planner', label: 'Meeting Planner' },
  { href: '/world-clock', label: 'World Clock' },
  { href: '/cities', label: 'Cities' },
  { href: '/timezones', label: 'Timezones' },
  { href: '/blog', label: 'Blog' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close menu on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">MeetZone</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Mobile menu */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {open && (
            <nav className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-background p-4 shadow-lg z-50 flex flex-col space-y-3">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
