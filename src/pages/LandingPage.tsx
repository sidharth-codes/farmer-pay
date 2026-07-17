import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Sprout,
  Truck,
  QrCode,
  Zap,
  LineChart,
  Leaf,
  Globe2,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { ROUTES, APP_NAME, APP_TAGLINE } from '../constants';

const STATS = [
  { value: '12k+', label: 'Batches traced' },
  { value: '4.2s', label: 'Avg settlement' },
  { value: '38', label: 'Regions live' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const FEATURES = [
  {
    Icon: QrCode,
    title: 'Farm-to-shelf traceability',
    description:
      'Every batch carries a verifiable QR identity. Consumers scan to see the full custody chain in seconds.',
  },
  {
    Icon: Zap,
    title: 'Instant settlement',
    description:
      'Payments settle on the Stellar network in seconds, not days — no correspondent banks, no holds.',
  },
  {
    Icon: ShieldCheck,
    title: 'Cryptographic provenance',
    description:
      'Ownership transitions are signed and anchored on-chain, producing tamper-evident audit trails.',
  },
  {
    Icon: LineChart,
    title: 'Live margin visibility',
    description:
      'Farmers and wholesalers see real-time pricing and margin splits across every batch they touch.',
  },
  {
    Icon: Globe2,
    title: 'Cross-border ready',
    description:
      'Stellar rails make international wholesale settlements as cheap as local ones — no FX friction.',
  },
  {
    Icon: Leaf,
    title: 'Sustainability ledger',
    description:
      'Provenance doubles as an ESG record: certifications, harvest conditions, and custody integrity.',
  },
];

const STEPS = [
  {
    Icon: Sprout,
    title: 'Farmer registers a harvest',
    description: 'A batch is minted with origin, crop, and certifications — a QR identity is issued.',
  },
  {
    Icon: Truck,
    title: 'Custody transfers on-chain',
    description:
      'Wholesalers and retailers take ownership. Each transfer is signed and recorded immutably.',
  },
  {
    Icon: Zap,
    title: 'Payment settles instantly',
    description: 'Stellar settles the trade in seconds. The farmer is paid before the truck unloads.',
  },
  {
    Icon: QrCode,
    title: 'Consumer verifies the journey',
    description: 'A scan at the shelf reveals every custody change, timestamp, and certification.',
  },
];

const BENEFITS = [
  'No more disputed provenance — the chain is the source of truth',
  'Farmers get paid in seconds, not after 30-day invoice terms',
  'Retailers can prove freshness and origin to any consumer',
  'Admins get a real-time map of every active batch',
];

const TESTIMONIALS = [
  {
    quote:
      'We cut our reconciliation cycle from 21 days to under a minute. Our farmers trust the payment, not the promise.',
    name: 'Amara Okafor',
    role: 'Cooperative Lead, GreenSavanna',
    rating: 5,
  },
  {
    quote:
      'Every box we ship now carries a story the consumer can verify. Returns dropped, and shelf velocity went up.',
    name: 'Daniel Pereira',
    role: 'Operations, Mercado Norte',
    rating: 5,
  },
  {
    quote:
      'FarmerPay is the first traceability layer that did not ask us to change our entire ERP. It sat on top.',
    name: 'Lena Hofmann',
    role: 'CTO, AgriLogix',
    rating: 4,
  },
];

const FAQS = [
  {
    q: 'Do consumers need an account?',
    a: 'No. Consumers verify any batch by scanning its QR code or visiting the public verify page — no login required.',
  },
  {
    q: 'Which blockchain does FarmerPay use?',
    a: 'FarmerPay settles payments and anchors provenance on the Stellar network. Phase 1 ships the foundation; blockchain integration lands in Phase 2.',
  },
  {
    q: 'What roles are supported?',
    a: 'Farmer, Wholesaler, Retailer, Admin, and Consumer. The first four authenticate; consumers verify anonymously.',
  },
  {
    q: 'Can I integrate my existing ERP?',
    a: 'Yes. The backend exposes a typed REST surface designed for ERP-side webhook and pull integration in later phases.',
  },
];

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:32px_32px] opacity-[0.35] [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="container py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Badge variant="default" className="mb-5 px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Series A backed · Built on Stellar
              </Badge>
            </motion.div>
            <motion.h1
              className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              {APP_TAGLINE.replace(/\.$/, '')}
              <span className="text-gradient"> Trust every harvest.</span>
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {APP_NAME} traces agricultural products from farmer to consumer and settles payments
              instantly on the Stellar blockchain — one verifiable chain of custody for the whole
              supply chain.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Button size="lg" asChild>
                <Link to={ROUTES.REGISTER}>
                  Get Started
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.HOW_IT_WORKS}>View Demo</Link>
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {STATS.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-5">
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <Section
        eyebrow="Features"
        title="A trust layer for the entire supply chain"
        subtitle="Six pillars that turn an opaque supply chain into a verifiable, instantly-settled marketplace."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="group h-full transition-shadow hover:shadow-glow">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.Icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section
        eyebrow="How it works"
        title="Four steps from harvest to verified shelf"
        subtitle="A single loop that mints, transfers, settles, and verifies — without a single intermediary."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="relative h-full">
                <CardContent className="p-6">
                  <span className="absolute right-5 top-5 font-display text-3xl font-bold text-primary/10">
                    {i + 1}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.Icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Benefits */}
      <section className="border-y border-border bg-secondary/30 py-20 md:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4">
              Benefits
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Why supply-chain operators choose {APP_NAME}
            </h2>
            <p className="mt-4 text-muted-foreground">
              The current system asks farmers to wait, retailers to trust, and consumers to guess.
              We replace all three with a verifiable, instant, on-chain record.
            </p>
            <Button className="mt-8" asChild>
              <Link to={ROUTES.REGISTER}>
                Start building with {APP_NAME}
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
          <ul className="space-y-4">
            {BENEFITS.map((benefit, i) => (
              <motion.li
                key={benefit}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={22} />
                <span className="text-foreground">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <Section
        eyebrow="Testimonials"
        title="Trusted by operators across the supply chain"
        subtitle="From cooperatives to retail chains, the story is the same: less friction, more trust."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={16}
                        className={s < t.rating ? 'fill-warning text-warning' : 'text-muted-foreground/40'}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Questions, answered" subtitle="">
        <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {faq.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-14 text-center text-primary-foreground shadow-glow md:px-16">
            <div
              className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-20"
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to trust every harvest?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Join the operators building a verifiable, instantly-settled agricultural supply
                chain on Stellar.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="glass" asChild>
                  <Link to={ROUTES.REGISTER}>
                    Get Started
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  asChild
                >
                  <Link to={ROUTES.CONTACT}>Talk to us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            {eyebrow}
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
