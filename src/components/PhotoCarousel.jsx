import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import photo1 from '../assets/photo1.jpg';
import photo2 from '../assets/photo2.jpg';
import photo3 from '../assets/photo3.jpg';
import photo4 from '../assets/photo4.jpg';

// Material 3 multi-browse carousel, auto-advancing.
// Slot widths come straight from the Figma layout (sum + 3×8px gap = 448px).
// An item enters small on the right, grows into the hero, then shrinks away left.
const SLOT_WIDTHS = [36.67, 126.67, 190, 70.67];
const HERO_WIDTH = 190;
const PHOTOS = [photo1, photo2, photo3, photo4];

export default function PhotoCarousel({ interval = 2800 }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setOffset((o) => o + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className="photo-carousel">
      <div className="rail">
        {/* keys are virtual positions, so the leftmost item exits while a new
            one is appended right — no element ever flies across the rail */}
        <AnimatePresence initial={false}>
          {SLOT_WIDTHS.map((width, i) => {
            const position = offset + i;
            return (
              <motion.div
                key={position}
                className="slot"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 190, damping: 28 }}
              >
                {/* fixed-width image, so narrowing the slot crops instead of squashing */}
                <img src={PHOTOS[position % PHOTOS.length]} alt="" style={{ width: HERO_WIDTH }} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
