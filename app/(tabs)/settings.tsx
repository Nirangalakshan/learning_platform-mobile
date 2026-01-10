import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDestructive?: boolean;
  rightElement?: React.ReactNode;
}

const SettingItem = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  isDestructive = false,
  rightElement,
}: SettingItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
  >
    <View className="flex-row items-center flex-1">
      <View
        className={`h-10 w-10 rounded-xl items-center justify-center ${
          isDestructive
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-gray-50 dark:bg-gray-800"
        }`}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isDestructive ? "#EF4444" : "#4F46E5"}
        />
      </View>
      <View className="ml-4 flex-1">
        <Text
          className={`text-base font-medium ${
            isDestructive ? "text-red-500" : "text-gray-900 dark:text-white"
          }`}
        >
          {label}
        </Text>
        {value && (
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {value}
          </Text>
        )}
      </View>
    </View>
    <View className="flex-row items-center">
      {rightElement}
      {showChevron && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            router.replace("/(auth)/sign-in");
          }
        },
      },
    ]);
  }

  const userInitial = user?.email?.[0].toUpperCase() || "U";

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0a0a0a]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-semibold text-gray-900 dark:text-white">
            Settings
          </Text>
        </View>

        {/* Profile Section */}
        <View className="px-6 mb-8 pt-4">
          <View className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-6 flex-row items-center">
            <View className="h-20 w-20 bg-indigo-600 rounded-full items-center justify-center">
              <Text className="text-white text-3xl font-bold">
                {userInitial}
              </Text>
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name || "User"}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {user?.email}
              </Text>
              <TouchableOpacity className="mt-2">
                <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="px-6">
          <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Account Preferences
          </Text>
          <View className="mb-8">
            <SettingItem
              icon="notifications-outline"
              label="Notifications"
              showChevron={false}
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#818CF8" }}
                  thumbColor={
                    Platform.OS === "ios"
                      ? "#FFFFFF"
                      : notifications
                        ? "#4F46E5"
                        : "#F3F4F6"
                  }
                />
              }
            />
            <SettingItem
              icon="moon-outline"
              label="Dark Mode"
              showChevron={false}
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: "#D1D5DB", true: "#818CF8" }}
                  thumbColor={
                    Platform.OS === "ios"
                      ? "#FFFFFF"
                      : darkMode
                        ? "#4F46E5"
                        : "#F3F4F6"
                  }
                />
              }
            />
            <SettingItem
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              onPress={() => {}}
            />
          </View>

          <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Support & Info
          </Text>
          <View className="mb-8">
            <SettingItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <SettingItem
              icon="information-circle-outline"
              label="About Us"
              onPress={() => {}}
            />
            <SettingItem
              icon="star-outline"
              label="Rate the App"
              onPress={() => {}}
            />
          </View>

          <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Actions
          </Text>
          <View>
            <SettingItem
              icon="log-out-outline"
              label="Sign Out"
              isDestructive
              showChevron={false}
              onPress={handleSignOut}
            />
          </View>
        </View>

        {/* Version */}
        <View className="mt-10 items-center">
          <Text className="text-gray-400 dark:text-gray-600 text-xs">
            Learning Platform v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
