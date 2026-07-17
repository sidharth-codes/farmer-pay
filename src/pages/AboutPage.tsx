import { motion } from 'framer-motion';
import { Target, Heart, Users, Sprout, Truck, Store, Globe2 } from 'lucide-react';
import { Card, CardContent, Badge } from '../components/ui';
import { APP_NAME, APP_TAGLINE } from '../constants';

const VALUES = [
  {
    Icon: Target,
    title: 'Provenance over promises',
    description: 'Trust is earned by verifiable records, not marketing. The chain is the source of truth.',
  },
  {
    Icon: Heart,
    title: 'Farmer-first economics',
    description: 'Instant settlement means farmers are paid for value, not for waiting.',
  },
  {
    Icon: Globe2,
    title: 'Open infrastructure',
    description: 'Built on Stellar so any participant — anywhere — can plug in without permission.',
  },
];

const ROLES = [
  { Icon: Sprout, label: 'Farmers', description: 'Register harvests and get paid instantly.' },
  { Icon: Truck, label: 'Wholesalers', description: 'Move bulk batches with verified provenance.' },
  { Icon: Store, label: 'Retailers', description: 'Receive batches and offer consumer scans.' },
  { Icon: Users, label: 'Admins', description: 'Govern the network and resolve disputes.' },
];

export function AboutPage() {
  return (
    <div>
      <section className="relative border-b border-border bg-hero-radial py-20 md:py-28">
        <div className="container">
          <Badge variant="secondary" className="mb-4">About</Badge>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            We are rebuilding the trust layer of the agricultural economy.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {APP_NAME} was founded on a simple conviction: {APP_TAGLINE.replace(/\.$/, '')}.
            Today, supply chains are opaque, payments are slow, and provenance is a claim.
            We make all three verifiable — on-chain, in seconds.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-4 text-muted-foreground">
              Give every farmer, wholesaler, and retailer a shared, tamper-evident record of
              custody — and settle the trade the moment custody changes hands.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Our vision</h2>
            <p className="mt-4 text-muted-foreground">
              A global agricultural economy where a consumer in one hemisphere can verify the
              origin of produce from another, and the farmer who grew it is already paid.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-20 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Values</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              What we stand on
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <v.Icon size={22} />
                    </div>
                    <h3 className="mt-5 font-display text-base font-semibold">{v.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Who we serve</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for every link in the chain
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <Card key={r.label}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <r.Icon size={24} />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold">{r.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
