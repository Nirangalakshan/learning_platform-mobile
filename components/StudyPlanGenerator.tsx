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

import { supabase } from "@/lib/supabase";
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

      // Save plan to database
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const planData = {
          user_id: user.id,
          subject,
          topics: topic,
          total_weeks: duration,
          study_plan: response,
          resources: [], // Fixes not-null constraint error
        };

        const { error: dbError } = await supabase
          .from("user_study_plans")
          .insert([planData]);

        if (dbError) {
          console.error("Database save error:", dbError);
        }
      }
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
        className="bg-purple-600 rounded-xl py-4 items-center active:opacity-90 mt-4"
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
        <View className="mt-8 bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl shadow-indigo-100 dark:shadow-none">
          <View className="bg-indigo-600 px-5 py-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-lg mr-3">
                <Ionicons name="sparkles" size={18} color="white" />
              </View>
              <Text className="font-bold text-white text-lg">
                Your Study Plan
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setResult(null)}
              className="bg-white/10 p-1.5 rounded-full"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="p-6">
            <Text className="text-gray-800 dark:text-gray-200 leading-7 text-base mb-6">
              {result}
            </Text>

            <View className="flex-row space-x-3 gap-3">
              <TouchableOpacity
                onPress={() => {
                  import("react-native").then(({ Clipboard }) => {
                    Clipboard.setString(result);
                    Alert.alert("Success", "Plan copied to clipboard!");
                  });
                }}
                className="flex-1 flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <Ionicons name="copy-outline" size={18} color="#4F46E5" />
                <Text className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400">
                  Copy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  import("react-native").then(({ Share }) => {
                    Share.share({ message: result });
                  });
                }}
                className="flex-1 flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <Ionicons name="share-outline" size={18} color="#4F46E5" />
                <Text className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400">
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
