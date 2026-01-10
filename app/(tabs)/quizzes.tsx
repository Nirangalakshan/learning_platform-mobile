import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateQuiz } from "../../lib/apila";

const { width } = Dimensions.get("window");

interface Question {
  id: number;
  type?: string;
  question: string;
  options: string[];
  correctAnswer: any;
  explanation: string;
}

interface Quiz {
  title: string;
  questions: Question[];
}

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon: ComponentProps<typeof Ionicons>["name"];
}

const CustomDropdown = ({
  label,
  value,
  options,
  onSelect,
  icon,
  containerClassName,
}: DropdownProps & { containerClassName?: string }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className={containerClassName}>
      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center justify-between bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-4"
      >
        <View className="flex-row items-center">
          <Ionicons name={icon} size={20} color="#6366F1" />
          <Text className="ml-3 text-gray-900 dark:text-white text-base">
            {value}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          className="flex-1 justify-end bg-black/40"
        >
          <View className="bg-white dark:bg-[#121212] rounded-t-3xl p-6 pb-12 max-h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Select {label}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    setModalVisible(false);
                  }}
                  className={`py-4 px-4 rounded-xl mb-2 flex-row justify-between items-center ${
                    value === option
                      ? "bg-indigo-50 dark:bg-indigo-900/20"
                      : "bg-gray-50 dark:bg-[#1a1a1a]"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      value === option
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name="checkmark" size={20} color="#6366F1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function QuizzesScreen() {
  const [subject, setSubject] = useState("");
  const [lesson, setLesson] = useState("");
  const [language, setLanguage] = useState("English");
  const [questionType, setQuestionType] = useState("MCQ");
  const [questionCount, setQuestionCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const languages = ["English", "Sinhala", "Tamil", "French", "German"];
  const difficulties = ["Easy", "Medium", "Hard", "Expert"];
  const questionTypes = [
    "MCQ",
    "Short Answers",
    "Essays",
    "Fill Blanks",
    "Mixed",
    "Multiple Choices",
  ];

  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>(
    {}
  );
  const [showResults, setShowResults] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!subject.trim() || !lesson.trim()) {
      Alert.alert("Missing Fields", "Please fill in Subject and Lesson/Topic");
      return;
    }

    setLoading(true);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const response = await generateQuiz(
        subject,
        lesson,
        language,
        questionType,
        parseInt(questionCount) || 5,
        difficulty
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;

      const parsedQuiz: Quiz = JSON.parse(jsonString);
      setQuiz(parsedQuiz);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        "Failed to generate quiz. Please try again or check your API key."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, answer: any) => {
    if (showResults) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer,
    });
  };

  const nextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let score = 0;
    quiz.questions.forEach((q) => {
      const userAns = selectedAnswers[q.id];
      if (q.options && q.options.length > 0) {
        if (Array.isArray(q.correctAnswer)) {
          // Multiple Select
          const isCorrect =
            Array.isArray(userAns) &&
            userAns.length === q.correctAnswer.length &&
            userAns.every((v) => q.correctAnswer.includes(v));
          if (isCorrect) score++;
        } else if (userAns === q.correctAnswer) {
          score++;
        }
      } else {
        // Open ended - we can't really "auto-score" easily, but we'll show it as completed
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setQuiz(null);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  if (quiz && !showResults) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const isOptionsBased =
      currentQuestion.options && currentQuestion.options.length > 0;

    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black p-4 gap-2">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={resetQuiz} className="p-2">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text
            className="text-lg font-bold dark:text-white flex-1 text-center"
            numberOfLines={1}
          >
            {quiz.title}
          </Text>
          <View className="w-10" />
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
          <View
            className="h-full bg-indigo-600"
            style={{ width: `${progress}%` }}
          />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Text>
            {currentQuestion.type && (
              <View className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                <Text className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                  {currentQuestion.type}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-8">
            {currentQuestion.question}
          </Text>

          {isOptionsBased ? (
            <View className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const userAns = selectedAnswers[currentQuestion.id];
                const isSelected = Array.isArray(userAns)
                  ? userAns.includes(index)
                  : userAns === index;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (
                        currentQuestion.type === "Multiple Choice" ||
                        Array.isArray(currentQuestion.correctAnswer)
                      ) {
                        const newAns = Array.isArray(userAns)
                          ? [...userAns]
                          : [];
                        if (newAns.includes(index)) {
                          handleSelectAnswer(
                            currentQuestion.id,
                            newAns.filter((i) => i !== index)
                          );
                        } else {
                          handleSelectAnswer(currentQuestion.id, [
                            ...newAns,
                            index,
                          ]);
                        }
                      } else {
                        handleSelectAnswer(currentQuestion.id, index);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 mb-4 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                      <Text
                        className={`flex-1 text-lg ${
                          isSelected
                            ? "text-indigo-900 dark:text-indigo-100 font-semibold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View>
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="Type your answer here..."
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-lg min-h-[150px]"
                textAlignVertical="top"
                value={selectedAnswers[currentQuestion.id] || ""}
                onChangeText={(text) =>
                  handleSelectAnswer(currentQuestion.id, text)
                }
              />
              <Text className="text-gray-400 text-xs mt-2 italic px-1">
                Note: AI-generated open-ended questions are self-reviewed in the
                next step.
              </Text>
            </View>
          )}
        </ScrollView>

        <View className="flex-row space-x-4 mb-20 gap-2">
          <TouchableOpacity
            onPress={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-4 items-center rounded-xl ${
              currentQuestionIndex === 0
                ? "bg-gray-100 dark:bg-gray-800 opacity-50"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Text className="text-gray-700 dark:text-gray-300 font-bold">
              Previous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={nextQuestion}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            className={`flex-[2] py-4 items-center rounded-xl ${
              selectedAnswers[currentQuestion.id] === undefined
                ? "bg-indigo-400"
                : "bg-indigo-600"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {currentQuestionIndex === quiz.questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults && quiz) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black p-4">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center my-10">
            <View className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900/20 items-center justify-center mb-4">
              <Ionicons name="trophy" size={64} color="#4F46E5" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-lg">
              Well done on completing the {quiz.title}!
            </Text>

            <View className="mt-8 items-center">
              <Text className="text-5xl font-black text-indigo-600 mb-1">
                {percentage}%
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 font-medium text-center">
                Overall Accuracy & Completion
              </Text>
            </View>
          </View>

          <View className="space-y-6 px-2">
            <Text className="text-xl font-bold dark:text-white mb-4">
              Review Answers
            </Text>
            {quiz.questions.map((q, index) => {
              const userAns = selectedAnswers[q.id];
              const isOptionsBased = q.options && q.options.length > 0;
              let isCorrect = false;

              if (isOptionsBased) {
                if (Array.isArray(q.correctAnswer)) {
                  isCorrect =
                    Array.isArray(userAns) &&
                    userAns.length === q.correctAnswer.length &&
                    userAns.every((v) => q.correctAnswer.includes(v));
                } else {
                  isCorrect = userAns === q.correctAnswer;
                }
              } else {
                isCorrect = true; // For open ended we mark as "done"
              }

              return (
                <View
                  key={index}
                  className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-4"
                >
                  <View className="flex-row items-start mb-3">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center mr-3 mt-1 ${
                        isCorrect
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-red-100 dark:bg-red-900/40"
                      }`}
                    >
                      <Ionicons
                        name={
                          isOptionsBased
                            ? isCorrect
                              ? "checkmark"
                              : "close"
                            : "eye-outline"
                        }
                        size={16}
                        color={isCorrect ? "#10B981" : "#EF4444"}
                      />
                    </View>
                    <Text className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                      {q.question}
                    </Text>
                  </View>

                  <View className="pl-9">
                    {isOptionsBased ? (
                      <>
                        <Text className="text-gray-500 dark:text-gray-400 mb-1">
                          Your answer:{" "}
                          {Array.isArray(userAns)
                            ? userAns.map((i) => q.options[i]).join(", ")
                            : q.options[userAns]}
                        </Text>
                        {!isCorrect && (
                          <Text className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                            Correct answer:{" "}
                            {Array.isArray(q.correctAnswer)
                              ? q.correctAnswer
                                  .map((i) => q.options[i])
                                  .join(", ")
                              : q.options[q.correctAnswer]}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text className="text-gray-500 dark:text-gray-400 mb-2">
                        <Text className="font-bold">Your response:</Text>{" "}
                        {userAns}
                      </Text>
                    )}

                    <View className="mt-2 bg-white dark:bg-gray-800/50 p-3 rounded-xl">
                      {!isOptionsBased && (
                        <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1 uppercase">
                          Model Answer / Key Points
                        </Text>
                      )}
                      <Text className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {isOptionsBased ? (
                          <>
                            <Text className="font-bold not-italic">
                              Explanation:{" "}
                            </Text>
                            {q.explanation}
                          </>
                        ) : (
                          q.correctAnswer
                        )}
                      </Text>
                      {!isOptionsBased && q.explanation && (
                        <Text className="text-sm text-gray-500 dark:text-gray-500 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                          <Text className="font-bold">Pro Tip: </Text>
                          {q.explanation}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={resetQuiz}
          className="bg-indigo-600 py-4 items-center rounded-xl mb-10"
        >
          <Text className="text-white font-bold text-lg">Exit Quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black ">
      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="pb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Quiz Generator
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            Create custom quizzes based on any subject or topic
          </Text>
        </View>

        <View className="space-y-6">
          {/* Subject */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Subject
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-4">
              <Ionicons name="book-outline" size={20} color="#6366F1" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white text-base"
                placeholder="e.g. Science, Mathematics"
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>

          {/* Lesson */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Lesson / Topic
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-4">
              <Ionicons name="bookmark-outline" size={20} color="#6366F1" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white text-base"
                placeholder="e.g. Quantum Physics, Trigonometry"
                placeholderTextColor="#9CA3AF"
                value={lesson}
                onChangeText={setLesson}
              />
            </View>
          </View>

          <View className="flex-row space-x-4 mb-6 gap-2">
            <View className="flex-1">
              <CustomDropdown
                label="Language"
                value={language}
                options={languages}
                onSelect={setLanguage}
                icon="language-outline"
              />
            </View>
            <View className="flex-1">
              <CustomDropdown
                label="Difficulty"
                value={difficulty}
                options={difficulties}
                onSelect={setDifficulty}
                icon="stats-chart-outline"
              />
            </View>
          </View>

          <View className="flex-row space-x-4 mb-6 gap-2">
            <View className="flex-1">
              <CustomDropdown
                label="Question Type"
                value={questionType}
                options={questionTypes}
                onSelect={setQuestionType}
                icon="list-outline"
              />
            </View>
            <View className="w-1/3">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Count
              </Text>
              <View className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-[5px]">
                <TextInput
                  className="text-gray-900 dark:text-white text-base text-center"
                  keyboardType="numeric"
                  value={questionCount}
                  onChangeText={setQuestionCount}
                  maxLength={2}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleGenerateQuiz}
            disabled={loading}
            className={`bg-purple-600 rounded-2xl py-4 items-center active:opacity-90 mb-20 ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons
                  name="sparkles"
                  size={24}
                  color="white"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-white font-bold text-lg">
                  Generate Quiz
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
