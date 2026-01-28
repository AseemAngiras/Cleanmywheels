import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Svg, { Line, Polygon, Circle } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export const HomeBackground = () => {
  return (
    <View style={styles.container}>
      <Svg height={height} width={width} style={styles.svg}>
        <Line
          x1={width * 0.5}
          y1={0}
          x2={width}
          y2={height * 0.25}
          stroke="#C8F000"
          strokeWidth="2"
        />
        <Line
          x1={width * 0.8}
          y1={0}
          x2={width * 0.5}
          y2={height * 0.15}
          stroke="#C8F000"
          strokeWidth="2"
        />

        <Polygon
          points={`${width},0 ${width},${height * 0.15} ${width * 0.7},0`}
          fill="#F7FEE7"
        />

        <Line
          x1={width * 0.6}
          y1={0}
          x2={width}
          y2={height * 0.2}
          stroke="#C8F000"
          strokeWidth="1"
        />
        <Line
          x1={width * 0.9}
          y1={0}
          x2={width * 0.6}
          y2={height * 0.15}
          stroke="#C8F000"
          strokeWidth="1"
        />
        <Line
          x1={width * 0.65}
          y1={height * 0.05}
          x2={width}
          y2={height * 0.22}
          stroke="#C8F000"
          strokeWidth="1"
        />

        {/* Crossing Lines */}
        <Line
          x1={width * 0.4}
          y1={height * 0.1}
          x2={width}
          y2={height * 0.4}
          stroke="#C8F000"
          strokeWidth="1.5"
        />
        <Line
          x1={width}
          y1={height * 0.2}
          x2={width * 0.6}
          y2={height * 0.4}
          stroke="#C8F000"
          strokeWidth="2"
        />

        {/* Connecting webs */}
        <Line
          x1={width * 0.5}
          y1={height * 0.15}
          x2={width * 0.6}
          y2={height * 0.25}
          stroke="#C8F000"
          strokeWidth="1"
        />
        <Line
          x1={width * 0.8}
          y1={height * 0.3}
          x2={width * 0.9}
          y2={height * 0.2}
          stroke="#C8F000"
          strokeWidth="1"
        />

        {/* Decorative Circle */}
        <Circle cx={width * 0.9} cy={height * 0.1} r="4" fill="#C8F000" />
        <Circle cx={width * 0.75} cy={height * 0.05} r="2" fill="#D9F99D" />

        {/* === BOTTOM LEFT PATTERN === */}
        <Line
          x1={0}
          y1={height * 0.65}
          x2={width * 0.4}
          y2={height * 0.85}
          stroke="#C8F000"
          strokeWidth="2"
        />
        <Line
          x1={0}
          y1={height * 0.75}
          x2={width * 0.5}
          y2={height}
          stroke="#C8F000"
          strokeWidth="2"
        />

        {/* Parallel fillers */}
        <Line
          x1={0}
          y1={height * 0.7}
          x2={width * 0.45}
          y2={height * 0.9}
          stroke="#C8F000"
          strokeWidth="1"
        />
        <Line
          x1={0}
          y1={height * 0.8}
          x2={width * 0.35}
          y2={height * 0.95}
          stroke="#C8F000"
          strokeWidth="1"
        />

        {/* Filled Accent */}
        <Polygon
          points={`0,${height} 0,${height * 0.8} ${width * 0.2},${height}`}
          fill="#F7FEE7"
        />

        <Line
          x1={width * 0.2}
          y1={height * 0.9}
          x2={0}
          y2={height * 0.95}
          stroke="#C8F000"
          strokeWidth="1.5"
        />

        {/* Extra crossing filler */}
        <Line
          x1={width * 0.1}
          y1={height * 0.6}
          x2={width * 0.3}
          y2={height * 0.9}
          stroke="#C8F000"
          strokeWidth="1"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: -1,
  },
  svg: {
    opacity: 1,
  },
});
