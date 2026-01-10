import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
    } else {
      // User signed in
      router.replace("/(tabs)");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-[#0a0a0a]"
    >
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-6"
      >
        <View className="items-center mb-10">
          <View className="">
            <Image
              source={require("../../assets/images/learnlk_logo.png")}
              className="h-28 w-28"
            />
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Welcome Back
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-2 text-base">
            Sign in to continue your learning journey
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
              Email
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 focus:border-indigo-500 transition-colors">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="hello@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
              Password
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 hover:border-indigo-500 mb-2">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-end mb-6">
            <TouchableOpacity>
              <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={signInWithEmail}
            disabled={loading}
            className="bg-indigo-600 rounded-xl py-4 items-center active:opacity-90"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 dark:text-gray-400">
            Dont have an account?{" "}
          </Text>
          {/* <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
