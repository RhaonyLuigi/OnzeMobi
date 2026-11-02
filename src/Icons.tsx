import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export function BellIcon({
  size = 22,
  color = "#0a192f",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M12 2V1" />
    </Svg>
  );
}
export function BoltIcon({
  size = 22,
  color = "#00a2ff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />
    </Svg>
  );
}
export function LocateIcon({
  size = 20,
  color = "#0a192f",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
    >
      <Circle cx={12} cy={12} r={7} />
      <Circle cx={12} cy={12} r={2} />
      <Path d="M12 1v5M12 18v5M1 12h5M18 12h5" />
    </Svg>
  );
}
