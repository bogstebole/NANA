// 24px square indicator, letter or number inside.
// onWhite: sits on a white card (grey bg), otherwise white bg on grey surface.
export default function NumberIndicator({ children, selected, onWhite }) {
  const classes = [
    'number-indicator',
    selected ? 'selected' : '',
    !selected && onWhite ? 'on-white' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return <div className={classes}>{children}</div>;
}
