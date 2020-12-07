import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Snapchat, { stories } from "./Snapchat";
import StoryComp from "./Story";
import { SnapchatRoutes } from "./Model";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";

export const assets = stories
  .map((story) => [story.avatar, story.source])
  .flat();

const Stack = createSharedElementStackNavigator<SnapchatRoutes>();
const Navigator = () => (
  <Stack.Navigator
    screenOptions={{
      gestureEnabled: true,
      headerShown: false,
      cardOverlayEnabled: true,
      cardStyle: { backgroundColor: "transparent" },
    }}
    mode="modal"
  >
    <Stack.Screen name="Snapchat" component={Snapchat} />
    <Stack.Screen
      name="Story"
      component={StoryComp}
      sharedElements={(route) => {
        return [route.params.story.id];
      }}
    />
  </Stack.Navigator>
);

export default Navigator;
