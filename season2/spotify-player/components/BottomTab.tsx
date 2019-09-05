import React from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import {
  PanGestureHandler,
  RectButton,
  State
} from "react-native-gesture-handler";
import { onGestureEvent } from "react-native-redash";
import { getBottomSpace } from "react-native-iphone-x-helper";

import { timing, withSpring } from "./AnimatedHelpers";
import TabIcon from "./TabIcon";

const { height } = Dimensions.get("window");
const TABBAR_HEIGHT = getBottomSpace() + 50;
const MINIMIZED_PLAYER_HEIGHT = 42;
const SNAP_TOP = 0;
const SNAP_BOTTOM = height - TABBAR_HEIGHT - MINIMIZED_PLAYER_HEIGHT;
const config = {
  damping: 15,
  mass: 1,
  stiffness: 150,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};
const { Clock, Value, cond, useCode, set, block, not, clockRunning } = Animated;

const styles = StyleSheet.create({
  playerSheet: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "cyan"
  },
  container: {
    backgroundColor: "#272829",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TABBAR_HEIGHT,
    flexDirection: "row",
    borderTopColor: "black",
    borderWidth: 1
  }
});

export default () => {
  const translationY = new Value(0);
  const velocityY = new Value(0);
  const state = new Value(State.UNDETERMINED);
  const offset = new Value(SNAP_BOTTOM);
  const goUp = new Value(0);
  const goDown = new Value(0);
  const gestureHandler = onGestureEvent({
    state,
    translationY,
    velocityY
  });
  const translateY = withSpring({
    value: translationY,
    velocity: velocityY,
    offset,
    state,
    snapPoints: [SNAP_TOP, SNAP_BOTTOM],
    config
  });
  const clock = new Clock();
  useCode(
    block([
      cond(goUp, [
        set(
          offset,
          timing({
            clock,
            from: offset,
            to: SNAP_TOP
          })
        ),
        cond(not(clockRunning(clock)), [set(goUp, 0)])
      ]),
      cond(goDown, [
        set(
          offset,
          timing({
            clock,
            from: offset,
            to: SNAP_BOTTOM
          })
        ),
        cond(not(clockRunning(clock)), [set(goDown, 0)])
      ])
    ]),
    []
  );
  return (
    <>
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={[styles.playerSheet, { transform: [{ translateY }] }]}
        />
      </PanGestureHandler>
      <SafeAreaView style={styles.container}>
        <TabIcon name="home" label="Home" />
        <TabIcon name="search" label="Search" />
        <TabIcon
          name="chevron-up"
          label="Player"
          onPress={() => goUp.setValue(1)}
        />
      </SafeAreaView>
    </>
  );
};