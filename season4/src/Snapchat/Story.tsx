import { NavigationProp, RouteProp } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Dimensions, View, Image } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Video } from "expo-av";

import { SnapchatRoutes } from "./Model";
import { SharedElement } from "react-navigation-shared-element";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { snapPoint } from "react-native-redash";

interface StoryProps {
  navigation: NavigationProp<SnapchatRoutes, "Story">;
  route: RouteProp<SnapchatRoutes, "Story">;
}

const { height } = Dimensions.get("window");

const AnimatedVideo = Animated.createAnimatedComponent(Video);

const Story = ({ route, navigation }: StoryProps) => {
  const { story } = route.params;

  const isGestureActive = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const onGestureEvent = useAnimatedGestureHandler({
    onStart: () => {
      isGestureActive.value = true;
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX;
      translateY.value = translationY;
    },
    onEnd: ({ velocityX, velocityY }) => {
      const goBack =
        snapPoint(translateY.value, velocityY, [0, height]) === height;

      if (goBack) {
        navigation.goBack();
      } else {
        translateX.value = withSpring(0, { velocity: velocityX });
        translateY.value = withSpring(0, { velocity: velocityY });
      }

      isGestureActive.value = false;
    },
  });

  const style = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, height],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      flex: 1,
      transform: [
        { translateX: translateX.value * scale },
        { translateY: translateY.value * scale },
        { scale },
      ],
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderRadius: withTiming(isGestureActive.value ? 24 : 0),
    };
  });

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={style}>
        <SharedElement id={story.id} style={{ flex: 1 }}>
          {!story.video && (
            <Animated.Image
              source={story.source}
              style={[
                {
                  ...StyleSheet.absoluteFillObject,
                  width: undefined,
                  height: undefined,
                },
                borderStyle,
              ]}
            />
          )}
          {story.video && (
            <AnimatedVideo
              source={story.video}
              rate={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay
              isLooping
              style={[StyleSheet.absoluteFill, borderStyle]}
            />
          )}
        </SharedElement>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default Story;
