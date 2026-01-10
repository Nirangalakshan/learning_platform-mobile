import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export function AnimatedSplashScreen({
  onAnimationFinish,
}: AnimatedSplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Start with visibility at 1 for debugging and immediate feedback
  const textScale = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const textBounceY = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  useEffect(() => {
    // Force native splash to hide immediately when this renders
    SplashScreen.hideAsync().catch(() => {});

    // Start the heavy bounce immediately
    textBounceY.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 600, easing: Easing.in(Easing.bounce) })
      ),
      -1, // Loop until finished
      false
    );

    // Fade out everything after exactly 5 seconds
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        {
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(onAnimationFinish)();
          }
        }
      );
    }, 5000);

    return () => clearTimeout(timeout);
  }, [
    onAnimationFinish,
    containerOpacity,
    logoOpacity,
    textBounceY,
    textOpacity,
    textScale,
  ]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }, { translateY: textBounceY.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    backgroundColor: isDark ? "#0f172a" : "#ffffff", // Deep dark or Pure white
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Background Aesthetic - High Contrast */}
      <View style={styles.backgroundCircles}>
        <View
          style={[
            styles.circle,
            styles.circle1,
            { backgroundColor: isDark ? "#1e293b" : "#eff6ff" },
          ]}
        />
        <View
          style={[
            styles.circle,
            styles.circle2,
            { backgroundColor: isDark ? "#1e1b4b" : "#f5f3ff" },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Your New Logo */}
        <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
          <Image
            source={require("../assets/images/learnlk_logo.png")}
            style={styles.smallLogo}
            contentFit="contain"
            priority="high"
          />
        </Animated.View>

        {/* The Main Bouncing "LearnLK" Text */}
        {/* <Animated.View style={animatedTextStyle}>
          <Text
            style={[styles.title, { color: isDark ? "#60a5fa" : "#2563eb" }]}
          >
            Learn
            <Text style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>LK</Text>
          </Text>
        </Animated.View> */}

        {/* Modern Loader Area */}
        <View style={styles.loaderContainer}>
          <View style={styles.dotContainer}>
            <LoadingDot delay={0} />
            <LoadingDot delay={200} />
            <LoadingDot delay={400} />
          </View>
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? "#94a3b8" : "#64748b" },
            ]}
          >
            Bringing your classroom to life...
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>POWERED BY LEARN LK AI</Text>
      </View>
    </Animated.View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opac = useSharedValue(0.3);
  useEffect(() => {
    opac.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        true
      )
    );
  }, [delay, opac]);
  const style = useAnimatedStyle(() => ({ opacity: opac.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999, // Ensure it's on top
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoWrapper: {
    marginBottom: 30,
  },
  smallLogo: {
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 72, // Extra large for visibility
    fontWeight: "900",
    letterSpacing: -4,
    textAlign: "center",
  },
  loaderContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  dotContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  backgroundCircles: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.8,
    right: -width * 0.5,
  },
  circle2: {
    width: width,
    height: width,
    bottom: -width * 0.5,
    left: -width * 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 60,
  },
  footerBrand: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 5,
  },
});
