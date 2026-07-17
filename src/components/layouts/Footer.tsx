import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ROUTES, APP_NAME, APP_TAGLINE } from '../../constants';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: ROUTES.FEATURES },
      { label: 'How It Works', to: ROUTES.HOW_IT_WORKS },
      { label: 'Verify a Batch', to: '/verify/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: ROUTES.ABOUT },
      { label: 'Contact', to: ROUTES.CONTACT },
      { label: 'Get Started', to: ROUTES.REGISTER },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '#' },
      { label: 'Terms', to: '#' },
      { label: 'Security', to: '#' },
    ],
  },
];

const SOCIALS = [
  { label: 'Twitter', Icon: Twitter, href: '#' },
  { label: 'LinkedIn', Icon: Linkedin, href: '#' },
  { label: 'GitHub', Icon: Github, href: '#' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {APP_TAGLINE} {APP_NAME} traces every harvest from farm to consumer and settles
              payments instantly on the Stellar network.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-sm font-semibold">{section.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME}, Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built on
            <span className="font-medium text-foreground">Stellar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
