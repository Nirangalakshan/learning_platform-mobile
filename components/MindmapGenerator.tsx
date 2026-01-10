import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { generateMindmap } from "../lib/apila";
import MermaidRenderer from "./MermaidRenderer";

export default function MindmapGenerator() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [language] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showDiagram, setShowDiagram] = useState(true);

  const handleGenerate = async () => {
    if (!subject.trim() || !topic.trim()) {
      Alert.alert("Missing Fields", "Please fill in subject and topic");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await generateMindmap(subject, topic, language);
      setResult(response);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to generate mindmap");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await Clipboard.setStringAsync(result);
      Alert.alert("Success", "Mermaid code copied to clipboard!");
    }
  };

  const shareResult = async () => {
    if (result) {
      await Share.share({ message: result });
    }
  };

  return (
    <View className="space-y-4">
      {/* Subject Input */}
      <View>
        <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
          Subject
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-4 focus:border-purple-500">
          <Ionicons name="book-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="e.g. Biology, History"
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
          />
        </View>
      </View>

      {/* Topic Input */}
      <View>
        <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium ml-1">
          Complex Topic
        </Text>
        <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-4 focus:border-purple-500">
          <Ionicons name="git-network-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="e.g. Human Nervous System"
            placeholderTextColor="#9CA3AF"
            value={topic}
            onChangeText={setTopic}
          />
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        onPress={handleGenerate}
        disabled={loading}
        className="bg-purple-600 rounded-2xl h-12 justify-center items-center active:opacity-90 mt-2"
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
            <Text className="text-white font-bold text-lg">
              Generate Mindmap
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Results Area */}
      {result && (
        <View className="mt-8 bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <View className="bg-purple-600 px-5 py-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-lg mr-3">
                <Ionicons name="git-network" size={18} color="white" />
              </View>
              <Text className="font-bold text-white text-lg">
                Mindmap Structure
              </Text>
            </View>
            <View className="flex-row space-x-2 gap-2">
              <TouchableOpacity
                onPress={() => setShowDiagram(!showDiagram)}
                className="bg-white/20 p-2 rounded-lg"
              >
                <Ionicons
                  name={showDiagram ? "code-working" : "image-outline"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setResult(null)}
                className="bg-white/20 p-2 rounded-lg"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="p-4">
            {showDiagram ? (
              <MermaidRenderer mermaidCode={result} />
            ) : (
              <View className="bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                <Text className="text-gray-800 dark:text-gray-300 font-mono text-xs">
                  {result}
                </Text>
              </View>
            )}

            <View className="flex-row space-x-3 gap-3 mt-4">
              <TouchableOpacity
                onPress={copyToClipboard}
                className="flex-1 flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <Ionicons name="copy-outline" size={18} color="#9333ea" />
                <Text className="ml-2 font-semibold text-purple-600 dark:text-purple-400">
                  Copy Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={shareResult}
                className="flex-1 flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <Ionicons name="share-outline" size={18} color="#9333ea" />
                <Text className="ml-2 font-semibold text-purple-600 dark:text-purple-400">
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
