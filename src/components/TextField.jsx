// Labelled input used on the register screen (shadcn-style input from Figma).
// `icon` is a lucide-react component, e.g. `icon={User}`.
export default function TextField({ label, icon: Icon, placeholder, value, onChange, type = 'text', onEnter }) {
  return (
    <label className="text-field">
      <span className="tf-label">{label}</span>
      <span className="tf-input">
        {Icon && <Icon size={14} strokeWidth={1.75} className="tf-icon" />}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter?.();
          }}
        />
      </span>
    </label>
  );
}
