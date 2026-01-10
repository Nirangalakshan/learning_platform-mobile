import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { quickChat } from "../../lib/apila";
import { supabase } from "../../lib/supabase";

interface DashboardStats {
  quizzes: number;
  studyPlans: number;
  studyTime: string;
  notes: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
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

  // Chat State
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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
      setUserName(
        session.user.user_metadata?.full_name ||
          session.user.email.split("@")[0]
      );
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const [quizzes, plans, notes] = await Promise.all([
        supabase.from("ai_quizzes").select("*", { count: "exact", head: true }),
        supabase
          .from("user_study_plans")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("user_short_notes")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        quizzes: quizzes.count || 0,
        studyPlans: plans.count || 0,
        studyTime: "12.5h",
        notes: notes.count || 0,
      });
    } catch (error) {
      console.log("Error fetching stats:", error);
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

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const response = await quickChat(chatMessage);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      Alert.alert("Error", "Failed to get AI response. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

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
    <View className="w-[48%] mb-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <View
        className={`w-10 h-10 ${bgColor} rounded-2xl items-center justify-center mb-3`}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-black text-gray-900 dark:text-white mb-1">
        {value}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#050505]" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Header Section */}
        <View className="px-6 py-8">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-[2px] mb-1">
                {getGreeting()}
              </Text>
              <Text className="text-3xl font-black text-gray-900 dark:text-white capitalize tracking-tighter">
                {userName}
              </Text>
            </View>
            <TouchableOpacity className="w-12 h-12 bg-gray-50 dark:bg-[#111] items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-800">
              <Ionicons
                name="notifications-outline"
                size={22}
                color={Platform.OS === "ios" ? "#000" : "#888"}
              />
            </TouchableOpacity>
          </View>

          {/* Featured/Motivation Card */}
          <View className="bg-indigo-600 rounded-[32px] p-8 overflow-hidden relative shadow-2xl shadow-indigo-200 dark:shadow-none">
            <View className="z-10">
              <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3 backdrop-blur-lg">
                <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                  Daily Goal
                </Text>
              </View>
              <Text className="text-white text-2xl font-black mb-4 leading-tight tracking-tight">
                Youre on a 3-day{"\n"}streak! Keep it up 🔥
              </Text>
              <TouchableOpacity className="bg-white px-6 py-3 rounded-2xl self-start">
                <Text className="text-indigo-600 font-bold text-sm">
                  Continue Learning
                </Text>
              </TouchableOpacity>
            </View>
            <View className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full" />
            <View className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/30 rounded-full" />
            <Ionicons
              name="rocket"
              size={120}
              color="rgba(255,255,255,0.1)"
              style={{
                position: "absolute",
                right: -20,
                top: 40,
                transform: [{ rotate: "-15deg" }],
              }}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-black text-gray-900 dark:text-white mb-5 tracking-tighter">
            Activity Overview
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              title="Quizzes"
              value={stats.quizzes}
              icon="help-buoy"
              color="#6366F1"
              bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            />
            <StatCard
              title="Study Plans"
              value={stats.studyPlans}
              icon="calendar"
              color="#10B981"
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <StatCard
              title="Focus Time"
              value={stats.studyTime}
              icon="timer"
              color="#F59E0B"
              bgColor="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatCard
              title="Short Notes"
              value={stats.notes}
              icon="document-text"
              color="#F472B6"
              bgColor="bg-pink-50 dark:bg-pink-900/20"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6">
          <Text className="text-xl font-black text-gray-900 dark:text-white mb-5 tracking-tighter">
            Instant Tools
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/quizzes")}
            className="flex-row items-center bg-gray-50 dark:bg-[#111] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 mb-4 shadow-sm"
          >
            <View className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl items-center justify-center mr-5">
              <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                AI Quiz Master
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Custom tests for any subject
              </Text>
            </View>
            <View className="bg-white dark:bg-[#222] p-2 rounded-xl border border-gray-100 dark:border-gray-800">
              <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/ai")}
            className="flex-row items-center bg-gray-50 dark:bg-[#111] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mr-5">
              <Ionicons name="book" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Study Planner
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Visualize your learning path
              </Text>
            </View>
            <View className="bg-white dark:bg-[#222] p-2 rounded-xl border border-gray-100 dark:border-gray-800">
              <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity
        onPress={() => setChatVisible(true)}
        className="absolute bottom-28 right-6 w-16 h-16 bg-indigo-600 rounded-3xl items-center justify-center shadow-2xl shadow-indigo-400 border-4 border-white dark:border-[#111]"
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
        <View className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white dark:border-[#111] items-center justify-center">
          <View className="w-1.5 h-1.5 bg-white rounded-full" />
        </View>
      </TouchableOpacity>

      {/* Quick Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={chatVisible}
        onRequestClose={() => setChatVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="bg-white dark:bg-[#0f0f0f] rounded-t-[40px] h-[80%] flex-col overflow-hidden"
          >
            <View className="px-6 pt-6 pb-4 flex-row justify-between items-center border-b border-gray-100 dark:border-gray-900">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl items-center justify-center mr-3">
                  <Octicons name="dependabot" size={20} color="#4F46E5" />
                </View>
                <View>
                  <Text className="font-black text-gray-900 dark:text-white text-lg tracking-tighter">
                    AI Assistant
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Active Now
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setChatVisible(false)}
                className="bg-gray-100 dark:bg-[#222] p-2 rounded-full"
              >
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-6 pt-6"
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.length === 0 && (
                <View className="items-center justify-center py-20 opacity-30">
                  <Ionicons name="chatbubbles-outline" size={80} color="#888" />
                  <Text className="text-gray-500 font-bold mt-4 text-center px-10">
                    Ask me anything about your studies!
                  </Text>
                </View>
              )}
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  className={`mb-6 max-w-[85%] ${msg.sender === "user" ? "self-end" : "self-start"}`}
                >
                  <View
                    className={`p-4 rounded-[24px] ${
                      msg.sender === "user"
                        ? "bg-indigo-600 rounded-tr-none"
                        : "bg-gray-50 dark:bg-[#1a1a1a] rounded-tl-none border border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <Text
                      className={`text-base leading-6 ${msg.sender === "user" ? "text-white" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {msg.text}
                    </Text>
                  </View>
                  <Text
                    className={`text-[10px] mt-2 font-bold text-gray-400 uppercase tracking-widest ${msg.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
              {chatLoading && (
                <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-3xl self-start rounded-tl-none mb-6">
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text className="ml-3 text-gray-400 font-medium">
                    Thinking...
                  </Text>
                </View>
              )}
            </ScrollView>

            <View className="p-6 bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-gray-900 pb-10">
              <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-[24px] px-2 py-2 border border-gray-200 dark:border-gray-800">
                <TextInput
                  className="flex-1 px-4 py-2 text-gray-900 dark:text-white text-base"
                  placeholder="Type your question..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={chatMessage}
                  onChangeText={setChatMessage}
                />
                <TouchableOpacity
                  onPress={handleSendChat}
                  disabled={!chatMessage.trim() || chatLoading}
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${chatMessage.trim() ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-800"}`}
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
