import { Ionicons } from "@expo/vector-icons";

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

type HistoryType = "notes" | "plans" | "quizzes";

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<HistoryType>("notes");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let result;
      if (activeTab === "notes") {
        result = await supabase
          .from("user_short_notes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
      } else if (activeTab === "plans") {
        result = await supabase
          .from("user_study_plans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
      } else {
        result = await supabase
          .from("ai_quizzes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
      }

      if (result.error) throw result.error;
      setData(result.data || []);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      Alert.alert("Error", "Failed to load history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === "notes") {
      return (
        <TouchableOpacity
          className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800"
          onPress={() => Alert.alert(item.topic, item.note)}
        >
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                {item.subject}
              </Text>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {item.topic}
              </Text>
            </View>
            <View className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl">
              <Ionicons name="document-text" size={20} color="#6366F1" />
            </View>
          </View>
          <Text
            className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3"
            numberOfLines={3}
          >
            {item.note}
          </Text>
          <View className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex-row justify-between items-center">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      );
    }

    if (activeTab === "plans") {
      return (
        <TouchableOpacity
          className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800"
          onPress={() => Alert.alert("Study Plan", item.study_plan)}
        >
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                {item.subject}
              </Text>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {item.topics}
              </Text>
            </View>
            <View className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-xl">
              <Ionicons name="calendar" size={20} color="#10B981" />
            </View>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
              Duration: {item.total_weeks}
            </Text>
          </View>
          <View className="mt-2 pt-4 border-t border-gray-50 dark:border-gray-800 flex-row justify-between items-center">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800"
        onPress={() => Alert.alert("Quiz details coming soon")}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
              {item.subject}
            </Text>
            <Text
              className="text-xl font-bold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {Array.isArray(item.lessons)
                ? item.lessons.join(", ")
                : item.lessons}
            </Text>
          </View>
          <View className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-xl">
            <Ionicons name="help-circle" size={20} color="#8B5CF6" />
          </View>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800/50 self-start px-2 py-1 rounded-lg">
          <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
            {item.difficulty} Difficulty
          </Text>
        </View>
        <View className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex-row justify-between items-center">
          <Text className="text-gray-400 text-[10px] font-bold uppercase">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0a0a0a]" edges={["top"]}>
      <View className="px-6 py-6">
        <Text className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tighter">
          History
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your past learning achievements
        </Text>
      </View>

      {/* Segmented Tabs */}
      <View className="px-6 mb-6">
        <View className="flex-row bg-gray-50 dark:bg-[#111] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
          {(["notes", "plans", "quizzes"] as HistoryType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 items-center rounded-xl ${
                activeTab === tab ? "bg-white dark:bg-gray-800" : ""
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-widest ${
                  activeTab === tab
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View className="py-20 items-center justify-center opacity-30">
              <Ionicons
                name={
                  activeTab === "notes"
                    ? "document-text-outline"
                    : activeTab === "plans"
                      ? "calendar-outline"
                      : "help-buoy-outline"
                }
                size={80}
                color="#888"
              />
              <Text className="text-gray-500 font-bold mt-4 text-center">
                No {activeTab} found yet.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
