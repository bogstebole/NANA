import { motion } from 'framer-motion';

export default function Button({
  variant = 'primary',
  size,
  full,
  iconOnly,
  children,
  ...props
}) {
  const classes = [
    'btn',
    variant,
    size === 'lg' ? 'lg' : '',
    full ? 'full' : '',
    iconOnly ? 'icon-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button whileTap={{ scale: 0.97 }} className={classes} {...props}>
      {children}
    </motion.button>
  );
}
