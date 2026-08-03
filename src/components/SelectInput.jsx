import { useRef, useState } from 'react';
import NumberIndicator from './NumberIndicator';

// Free-text answer row inside a question card (letter + label + input).
export default function SelectInput({ letter, label, placeholder, value, onChange, onEnter, inputRef }) {
  const [focused, setFocused] = useState(false);
  const localRef = useRef(null);
  const ref = inputRef || localRef;

  return (
    <div
      className={`select-input${focused ? ' focused' : ''}`}
      onClick={() => ref.current?.focus()}
    >
      <NumberIndicator selected={focused}>{letter}</NumberIndicator>
      <div className="si-content">
        <div className="si-label">{label}</div>
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter?.();
          }}
        />
      </div>
    </div>
  );
}
