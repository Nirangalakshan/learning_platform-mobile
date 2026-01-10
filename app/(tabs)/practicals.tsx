import { Ionicons } from "@expo/vector-icons";
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
import FlowchartGenerator from "../../components/FlowchartGenerator";
import MindmapGenerator from "../../components/MindmapGenerator";

type PracticalMode = "mindmap" | "flowchart";

export default function PracticalsScreen() {
  const [mode, setMode] = useState<PracticalMode>("mindmap");

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0a0a0a]">
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
            <Text className="text-3xl font-semibold text-gray-900 dark:text-white">
              Visual Learning
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              Create AI-powered mindmaps and flowcharts
            </Text>
          </View>

          {/* Mode Switcher */}
          <View className="flex-row bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-2xl mb-6">
            <TouchableOpacity
              onPress={() => setMode("mindmap")}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center flex-row ${
                mode === "mindmap" ? "bg-white dark:bg-gray-800" : ""
              }`}
            >
              <Ionicons
                name="git-network-outline"
                size={18}
                color={mode === "mindmap" ? "#9333ea" : "#9CA3AF"}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`font-bold ${
                  mode === "mindmap"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Mindmap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("flowchart")}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center flex-row ${
                mode === "flowchart" ? "bg-white dark:bg-gray-800" : ""
              }`}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={mode === "flowchart" ? "#9333ea" : "#9CA3AF"}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`font-bold ${
                  mode === "flowchart"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Flowchart
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View className="flex-1">
            {mode === "mindmap" ? <MindmapGenerator /> : <FlowchartGenerator />}
          </View>

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
