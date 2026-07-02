import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { Line, Polygon, Circle } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export const HomeBackground = () => {
  return (
    <View className="absolute inset-0 bg-[#121212] -z-10">
      <Svg height={height} width={width} className="opacity-100">
        {/* Background Base */}
        <Polygon
          points={`0,0 ${width},0 ${width},${height} 0,${height}`}
          fill="#121212"
        />

        {/* Top Gradient/Mesh Effect - Yellow Accents */}
        <Line
          x1={width * 0.5}
          y1={0}
          x2={width}
          y2={height * 0.25}
          stroke="#C8F000"
          strokeWidth="1"
          strokeOpacity="0.1"
        />
        <Line
          x1={width * 0.8}
          y1={0}
          x2={width * 0.5}
          y2={height * 0.15}
          stroke="#C8F000"
          strokeWidth="1"
          strokeOpacity="0.1"
        />

        {/* Subtle Polygon Accent */}
        <Polygon
          points={`${width},0 ${width},${height * 0.15} ${width * 0.7},0`}
          fill="#C8F000"
          fillOpacity="0.05"
        />

        {/* Tech Lines */}
        <Line
          x1={width * 0.6}
          y1={0}
          x2={width}
          y2={height * 0.2}
          stroke="#C8F000"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />
        <Line
          x1={width * 0.9}
          y1={0}
          x2={width * 0.6}
          y2={height * 0.15}
          stroke="#C8F000"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />

        {/* Decorative Circles */}
        <Circle
          cx={width * 0.9}
          cy={height * 0.1}
          r="3"
          fill="#C8F000"
          fillOpacity="0.4"
        />

        {/* Bottom mesh */}
        <Line
          x1={0}
          y1={height * 0.75}
          x2={width * 0.5}
          y2={height}
          stroke="#C8F000"
          strokeWidth="1"
          strokeOpacity="0.05"
        />
      </Svg>
    </View>
  );
};
