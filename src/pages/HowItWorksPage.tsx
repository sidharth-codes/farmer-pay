import { motion } from 'framer-motion';
import { Sprout, Truck, Zap, QrCode, ArrowRight } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const STEPS = [
  {
    Icon: Sprout,
    step: '01',
    title: 'Register a harvest',
    description:
      'A farmer registers a harvest with origin, crop, quantity, and certifications. The platform mints a batch and issues a QR identity.',
  },
  {
    Icon: Truck,
    step: '02',
    title: 'Transfer custody',
    description:
      'Wholesalers and retailers take ownership. Each transfer is signed by both parties and recorded immutably on the Stellar ledger.',
  },
  {
    Icon: Zap,
    step: '03',
    title: 'Settle instantly',
    description:
      'The moment custody changes, payment settles on Stellar in seconds. The farmer is paid before the truck finishes unloading.',
  },
  {
    Icon: QrCode,
    step: '04',
    title: 'Verify at the shelf',
    description:
      'A consumer scans the QR code and sees the full custody chain — origin, transfers, certifications, and timestamps.',
  },
];

export function HowItWorksPage() {
  return (
    <div>
      <section className="relative border-b border-border bg-hero-radial py-20 md:py-28">
        <div className="container">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            From harvest to verified shelf in four steps.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A single loop that mints, transfers, settles, and verifies — without intermediaries.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container">
          <div className="relative grid gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative"
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.Icon size={22} />
                      </div>
                      <span className="font-display text-2xl font-bold text-primary/15">{s.step}</span>
                    </div>
                    <h3 className="mt-5 font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  </CardContent>
                </Card>
                {i < STEPS.length - 1 ? (
                  <ArrowRight
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-primary/30 lg:block"
                    size={20}
                    aria-hidden="true"
                  />
                ) : null}
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Button size="lg" asChild>
              <Link to={ROUTES.REGISTER}>
                Start tracing your harvest
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
