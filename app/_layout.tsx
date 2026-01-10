import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AnimatedSplashScreen } from "../components/AnimatedSplashScreen";
import "../global.css";
import { supabase } from "../lib/supabase";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const prepare = async () => {
      try {
        // 1. Check Initial Auth Status
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        // 2. Listen for Auth changes (Sign In / Sign Out)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setIsAuthenticated(!!session);
        });

        // 3. Small artificial delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 100));

        return () => subscription.unsubscribe();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    // If we're done with animations and readiness, handle the routing
    if (appReady && splashAnimationFinished && isAuthenticated !== null) {
      const inAuthGroup = segments[0] === "(auth)";

      if (!isAuthenticated && !inAuthGroup) {
        // Force sign-in if not authenticated
        router.replace("/(auth)/sign-in");
      } else if (isAuthenticated && inAuthGroup) {
        // Go to dashboard if already authenticated
        router.replace("/(tabs)");
      }
    }
  }, [appReady, splashAnimationFinished, isAuthenticated, segments, router]);

  if (!appReady || !splashAnimationFinished || !fontsLoaded) {
    return (
      <AnimatedSplashScreen
        onAnimationFinish={() => setSplashAnimationFinished(true)}
      />
    );
  }

  return (
    <>
      {/* Force a solid white background and dark icons (so they are visible) */}
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <Stack
        screenOptions={{
          headerShown: false,
          // This sets the default behavior for all screens
          statusBarStyle: "dark",
          statusBarBackgroundColor: "#ffffff",
          statusBarTranslucent: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
