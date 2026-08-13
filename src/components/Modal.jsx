import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// A dialog for the things that are done rather than read. The client's page is
// an overview — what is agreed, what was visited, what has passed between them
// — and a form sitting open in the middle of it makes the page look like it is
// waiting for something, every time it is opened.
export default function Modal({ title, eyebrow, wide, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Rendered into the body. The pages that open this animate themselves, and a
  // transform anywhere above a `position: fixed` element makes it fixed to that
  // ancestor instead of the viewport — a dialog that lands half off-screen for
  // reasons nothing about the dialog explains.
  return createPortal(
    <motion.div
      className="modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className={`modal${wide ? ' is-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <button type="button" className="ci-btn modal-close" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={1.75} />
        </button>

        <div className="modal-title">
          {eyebrow && <p className="doc-eyebrow">{eyebrow}</p>}
          <p className="doc-title">{title}</p>
        </div>

        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}
