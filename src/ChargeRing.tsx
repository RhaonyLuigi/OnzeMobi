import React, { useId } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
export function ChargeRing({
  value,
  size = 176,
  thickness = 16,
  track = "#ffffff",
  children,
}: React.PropsWithChildren<{
  value: number;
  size?: number;
  thickness?: number;
  track?: string;
}>) {
  const id = `charge${useId().replace(/[^a-z0-9]/gi, "")}`;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", left: 0, top: 0 }}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Defs>
          <LinearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00e58a" />
            <Stop offset="100%" stopColor="#00aeed" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={
            circumference * (1 - Math.min(100, Math.max(0, value)) / 100)
          }
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
