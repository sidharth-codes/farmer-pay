import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react';
import { Card, CardContent, Badge, Button, Input, Label, FormError } from '../components/ui';
import { sleep } from '../utils';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  organization: z.string().optional(),
  message: z.string().min(10, 'Tell us a bit more (min 10 characters)'),
});

type FormValues = z.infer<typeof schema>;

const CHANNELS = [
  { Icon: Mail, label: 'Email', value: 'hello@farmerpay.io' },
  { Icon: Phone, label: 'Phone', value: '+1 (415) 555-0142' },
  { Icon: MapPin, label: 'Office', value: 'Remote-first · Global' },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await sleep(800);
    void values;
    setSubmitted(true);
    reset();
  };

  return (
    <div>
      <section className="relative border-b border-border bg-hero-radial py-20 md:py-28">
        <div className="container">
          <Badge variant="secondary" className="mb-4">Contact</Badge>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Let's talk traceability.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Whether you run a cooperative, a wholesale operation, or a retail chain, we'd love to
            understand your supply chain.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-3">
          <div className="space-y-4">
            {CHANNELS.map((c) => (
              <Card key={c.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                    <p className="text-sm font-medium">{c.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <motion.div
                    className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                      <MessageSquare size={28} />
                    </div>
                    <h3 className="font-display text-xl font-semibold">Message received</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Thanks for reaching out. Our team will get back to you within one business day.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
                      Send another
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" invalid={!!errors.name} {...register('name')} />
                        <FormError>{errors.name?.message}</FormError>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@company.com" invalid={!!errors.email} {...register('email')} />
                        <FormError>{errors.email?.message}</FormError>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="organization">Organization (optional)</Label>
                      <Input id="organization" placeholder="Company or cooperative" {...register('organization')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us about your supply chain…"
                        className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50"
                        {...register('message')}
                      />
                      <FormError>{errors.message?.message}</FormError>
                    </div>
                    <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
                      <Send size={16} />
                      Send message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
