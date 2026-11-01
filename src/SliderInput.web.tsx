import type { SliderInputProps } from "./SliderInput";
export default function SliderInput({
  label,
  min,
  max,
  value,
  onChange,
  onStart,
}: SliderInputProps) {
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={1}
      value={value}
      onPointerDown={onStart}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: 28,
        margin: 0,
        opacity: 0.01,
        cursor: "pointer",
      }}
    />
  );
}
