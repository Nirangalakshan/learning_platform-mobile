import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { generateStudyPlan } from "../lib/apila";

export default function StudyPlanGenerator() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generatePlan = async () => {
    if (!subject.trim() || !topic.trim() || !duration.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await generateStudyPlan(subject, topic, duration);
      setResult(response);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.message || "Failed to generate plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="space-y-4">
      {/* Subject Input */}
      <View>
        <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
          Subject
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 focus:border-indigo-500">
          <Ionicons name="book-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="e.g. Mathematics, Science"
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
          />
        </View>
      </View>

      {/* Topic Input */}
      <View>
        <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
          Lesson / Topic
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 focus:border-indigo-500">
          <Ionicons name="bookmark-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="e.g. Integration, Photosynthesis"
            placeholderTextColor="#9CA3AF"
            value={topic}
            onChangeText={setTopic}
          />
        </View>
      </View>

      {/* Duration Input */}
      <View>
        <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
          Duration
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 focus:border-indigo-500">
          <Ionicons name="time-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="e.g. 2 hours, 1 week"
            placeholderTextColor="#9CA3AF"
            value={duration}
            onChangeText={setDuration}
          />
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        onPress={generatePlan}
        disabled={loading}
        className="bg-indigo-600 rounded-xl py-4 items-center active:opacity-90 mt-4"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View className="flex-row items-center">
            <Ionicons
              name="sparkles"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-bold text-lg">Generate Plan</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Results Area */}
      {result && (
        <View className="mt-8 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <View className="flex-row justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <Text className="font-bold text-lg text-gray-900 dark:text-white">
              Generated Study Plan
            </Text>
            <TouchableOpacity onPress={() => setResult(null)}>
              <Ionicons name="close-circle" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-800 dark:text-gray-200 leading-6">
            {result}
          </Text>
        </View>
      )}
    </View>
  );
}
