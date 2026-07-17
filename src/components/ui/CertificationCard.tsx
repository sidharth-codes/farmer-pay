import { motion } from 'framer-motion';
import { Award, ShieldCheck, FileText, Download } from 'lucide-react';
import type { Certification } from '../../types';
import { Badge } from './Badge';
import { formatDate } from '../../utils';

interface CertificationCardProps {
  certification: Certification;
  index?: number;
}

export function CertificationCard({ certification, index = 0 }: CertificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-glow hover:border-primary/30"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
          <Award size={20} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold truncate">{certification.name}</h4>
            <Badge variant="success" className="shrink-0">
              <ShieldCheck size={10} />
              Verified
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Issued by {certification.issuedBy}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Issued: {formatDate(certification.issueDate)}</span>
            {certification.expiryDate && (
              <span>Expires: {formatDate(certification.expiryDate)}</span>
            )}
          </div>
          {certification.documentUrl && (
            <a
              href={certification.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <FileText size={12} />
              View document
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
