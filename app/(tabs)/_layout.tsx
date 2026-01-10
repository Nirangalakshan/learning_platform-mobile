import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";

// Animated icon component for bounce effect
const AnimatedIcon = ({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (focused) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.1,
            useNativeDriver: true,
            friction: 20,
            tension: 10,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 2,
            tension: 100,
          }),
        ])
      );
      anim.start();

      return () => anim.stop();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 2,
        tension: 100,
      }).start();
    }
  }, [focused, scale]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons size={focused ? 25 : 26} name={name} color={color} />
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb", // blue-600
        tabBarInactiveTintColor: "#64748b", // slate-500
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 5,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: "#ffffff",
            borderRadius: 15,
            height: 60,
            borderTopWidth: 0,
          },
          android: {
            paddingTop: 5,
            position: "absolute",

            bottom: 30,
            marginHorizontal: 20,
            elevation: 0,
            backgroundColor: "#ffffff",
            borderRadius: 30,
            height: 55,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderLeftColor: "#e5e7eb",
            borderRightColor: "#e5e7eb",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI Assistant",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: "Quizzes",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name={focused ? "document-text" : "document-text-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practicals"
        options={{
          title: "Visuals",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name={focused ? "git-network" : "git-network-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
