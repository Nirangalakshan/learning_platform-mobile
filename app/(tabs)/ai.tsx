import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ShortNotesGenerator from "../../components/ShortNotesGenerator";
import StudyPlanGenerator from "../../components/StudyPlanGenerator";

type AIPageMode = "plan" | "note";

export default function AIScreen() {
  const [mode, setMode] = useState<AIPageMode>("plan");

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0a0a0a]">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-4"
        >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Assistant
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              Create study plans and summaries instantly
            </Text>
          </View>

          {/* Mode Switcher */}
          <View className="flex-row bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-xl mb-6">
            <TouchableOpacity
              onPress={() => setMode("plan")}
              className={`flex-1 py-3 rounded-lg items-center justify-center ${
                mode === "plan" ? "bg-white dark:bg-gray-800" : ""
              }`}
            >
              <Text
                className={`font-semibold ${
                  mode === "plan"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Study Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("note")}
              className={`flex-1 py-3 rounded-lg items-center justify-center ${
                mode === "note" ? "bg-white dark:bg-gray-800" : ""
              }`}
            >
              <Text
                className={`font-semibold ${
                  mode === "note"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Short Notes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View className="flex-1">
            {mode === "plan" ? <StudyPlanGenerator /> : <ShortNotesGenerator />}
          </View>

          {/* Empty Space for scrolling */}
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
