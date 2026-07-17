import { motion } from 'framer-motion';
import {
  QrCode,
  Zap,
  ShieldCheck,
  LineChart,
  Globe2,
  Leaf,
  Wallet,
  FileCheck2,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const FEATURES = [
  {
    Icon: QrCode,
    title: 'QR-anchored identity',
    description:
      'Every batch is minted with a unique QR identity that carries its full custody history.',
  },
  {
    Icon: Zap,
    title: 'Instant settlement',
    description: 'Stellar settles trades in seconds, eliminating 30-day invoice cycles.',
  },
  {
    Icon: ShieldCheck,
    title: 'Tamper-evident provenance',
    description: 'Each ownership transfer is cryptographically signed and anchored on-chain.',
  },
  {
    Icon: Wallet,
    title: 'Built-in wallets',
    description: 'Every participant gets a Stellar wallet managed transparently by the platform.',
  },
  {
    Icon: LineChart,
    title: 'Real-time margin tracking',
    description: 'See pricing and margin splits across every batch as custody changes.',
  },
  {
    Icon: Globe2,
    title: 'Cross-border by default',
    description: 'Stellar rails make international settlements as cheap as local ones.',
  },
  {
    Icon: Leaf,
    title: 'Sustainability ledger',
    description: 'Certifications and harvest conditions become a verifiable ESG record.',
  },
  {
    Icon: FileCheck2,
    title: 'Audit-ready exports',
    description: 'Export any batch custody chain as a signed, auditable record in one click.',
  },
];

export function FeaturesPage() {
  return (
    <div>
      <section className="relative border-b border-border bg-hero-radial py-20 md:py-28">
        <div className="container">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything the supply chain needs to be verifiable.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A complete traceability and payments platform — from harvest registration to consumer
            verification — built on the Stellar blockchain.
          </p>
          <Button className="mt-8" asChild>
            <Link to={ROUTES.REGISTER}>Get Started</Link>
          </Button>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Card className="h-full transition-shadow hover:shadow-glow">
                  <CardContent className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.Icon size={22} />
                    </div>
                    <h3 className="mt-5 font-display text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
