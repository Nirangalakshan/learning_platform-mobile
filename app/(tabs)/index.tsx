import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { supabase } from "../../lib/supabase";

interface DashboardStats {
  quizzes: number;
  studyPlans: number;
  studyTime: string;
  notes: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>("Learner");
  const [stats, setStats] = useState<DashboardStats>({
    quizzes: 0,
    studyPlans: 0,
    studyTime: "0h",
    notes: 0,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const checkUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/(auth)/sign-in");
      return;
    }
    if (session?.user?.email) {
      // Try to get a display name, fallback to email part
      setUserName(
        session.user.user_metadata?.full_name ||
          session.user.email.split("@")[0]
      );
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      // Mocking parallel fetching for performance.
      // In a real scenario, ensure these tables exist in your Supabase project.
      const [quizzes, plans, notes] = await Promise.all([
        supabase.from("ai_quizzes").select("*", { count: "exact", head: true }),
        supabase
          .from("user_study_plans")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("user_short_notes")
          .select("*", { count: "exact", head: true }),
      ]);

      // Calculate study time (Mock implementation for demo as it requires session tracking logic)
      setStats({
        quizzes: quizzes.count || 0,
        studyPlans: plans.count || 0,
        studyTime: "12.5h",
        notes: notes.count || 0,
      });
    } catch (error) {
      console.log("Error fetching stats:", error);
      // Don't block UI on error, just log it
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([checkUser(), fetchStats()]);
    setRefreshing(false);
  }, [checkUser, fetchStats]);

  useEffect(() => {
    checkUser();
    fetchStats();
  }, [checkUser, fetchStats]);

  const StatCard = ({
    title,
    value,
    icon,
    color,
    bgColor,
  }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
  }) => (
    <View className="w-[48%] mb-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
      <View
        className={`w-10 h-10 ${bgColor} rounded-full items-center justify-center mb-3`}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Header Section */}
        <View className="px-6 py-6 mb-2">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-base text-gray-500 dark:text-gray-400 font-medium">
                {getGreeting()},
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1 capitalize">
                {userName}
              </Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white dark:bg-[#1a1a1a] items-center justify-center rounded-full border border-gray-200 dark:border-gray-800">
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          {/* Featured/Motivation Card */}
          <View className="bg-indigo-600 rounded-2xl p-6 overflow-hidden relative">
            <View className="z-10">
              <Text className="text-indigo-100 font-medium mb-1">
                Daily Goal
              </Text>
              <Text className="text-white text-xl font-bold mb-4">
                Youre on a 3-day streak! Keep it up 🔥
              </Text>
              <TouchableOpacity className="bg-white/20 self-start px-4 py-2 rounded-lg backdrop-blur-md">
                <Text className="text-white font-semibold text-sm">
                  Continue Learning
                </Text>
              </TouchableOpacity>
            </View>
            {/* Decorative background circle */}
            <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/30 rounded-full" />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Overview
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              title="Quizzes"
              value={stats.quizzes}
              icon="help-buoy"
              color="#4F46E5" // indigo-600
              bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            />
            <StatCard
              title="Study Plans"
              value={stats.studyPlans}
              icon="calendar"
              color="#059669" // emerald-600
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <StatCard
              title="Focus Time"
              value={stats.studyTime}
              icon="timer"
              color="#D97706" // amber-600
              bgColor="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatCard
              title="Short Notes"
              value={stats.notes}
              icon="document-text"
              color="#EC4899" // pink-600
              bgColor="bg-pink-50 dark:bg-pink-900/20"
            />
          </View>
        </View>

        {/* Quick Actions / Recent */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </Text>
          <TouchableOpacity className="flex-row items-center bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 mb-3">
            <View className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-full items-center justify-center mr-4">
              <Ionicons name="sparkles" size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Generate New Quiz
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Test your knowledge with AI
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full items-center justify-center mr-4">
              <Ionicons name="book" size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Create Study Plan
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Optimize your learning path
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
