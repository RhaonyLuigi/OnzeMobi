import Slider from "@react-native-community/slider";
import { StyleSheet } from "react-native";
export type SliderInputProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  onStart?: () => void;
};
export default function SliderInput({
  label,
  min,
  max,
  value,
  onChange,
  onStart,
}: SliderInputProps) {
  return (
    <Slider
      accessibilityLabel={label}
      minimumValue={min}
      maximumValue={max}
      step={1}
      value={value}
      onValueChange={onChange}
      onSlidingStart={onStart}
      style={[StyleSheet.absoluteFill, { opacity: 0.01 }]}
    />
  );
}
