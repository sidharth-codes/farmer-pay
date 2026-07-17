import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import type { BatchImage } from '../../types';
import { cn } from '../../utils';

interface ImageGalleryProps {
  images: BatchImage[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-xl border border-dashed border-border py-12', className)}>
        <div className="text-center">
          <ImageIcon size={28} className="mx-auto text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">No images</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('grid gap-3', images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3', className)}>
        {images.map((img, i) => (
          <motion.button
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            onClick={() => setActiveIndex(i)}
            className="group relative overflow-hidden rounded-xl border border-border aspect-square"
          >
            <img
              src={img.url}
              alt={img.caption || `Batch image ${i + 1}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white truncate">{img.caption}</p>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
            onClick={() => setActiveIndex(null)}
          >
            <button
              className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => setActiveIndex(null)}
            >
              <X size={24} />
            </button>
            {activeIndex > 0 && (
              <button
                className="absolute left-4 rounded-full p-2 bg-card/80 hover:bg-card border border-border"
                onClick={(e) => { e.stopPropagation(); setActiveIndex(activeIndex - 1); }}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-3xl max-h-[80vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[activeIndex].url}
                alt={images[activeIndex].caption || `Image ${activeIndex + 1}`}
                className="max-w-full max-h-[80vh] rounded-xl object-contain"
              />
              {images[activeIndex].caption && (
                <p className="mt-3 text-center text-sm text-muted-foreground">{images[activeIndex].caption}</p>
              )}
            </motion.div>
            {activeIndex < images.length - 1 && (
              <button
                className="absolute right-4 rounded-full p-2 bg-card/80 hover:bg-card border border-border"
                onClick={(e) => { e.stopPropagation(); setActiveIndex(activeIndex + 1); }}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
