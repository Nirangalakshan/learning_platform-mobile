export const APILAGE_API_URL = process.env.EXPO_PUBLIC_APILAGE_AI_API_URL || "";
export const APILAGE_API_KEY = process.env.EXPO_PUBLIC_APILAGE_AI_API_KEY || "";

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Generic function to call Apila AI (or similar LLM API).
 * Adjust the payload structure based on the actual API docs.
 */
async function callApilaAI({
  systemPrompt,
  userPrompt,
}: GenerateOptions): Promise<string> {
  if (!APILAGE_API_KEY) {
    throw new Error(
      "Missing API Key. Please ensure EXPO_PUBLIC_APILAGE_AI_API_KEY is set in .env.local and the server is restarted."
    );
  }

  try {
    // Apilage AI specific endpoint structure
    const response = await fetch(`${APILAGE_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APILAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "APILAGEAI-FREE",
        message: `${systemPrompt}\n\nUser Request: ${userPrompt}`,
        enableGoogleSearch: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const result = await response.json();
    return result.response || "";
  } catch (error) {
    console.error("Apilage AI Error:", error);
    throw error;
  }
}

export async function generateStudyPlan(
  subject: string,
  topic: string,
  duration: string
): Promise<string> {
  const systemPrompt =
    "You are an expert personalized tutor. Create detailed structured study plans.";
  const userPrompt = `Create a study plan for ${topic} in ${subject} that spans ${duration}. 
  Format it with clear sections, time allocations, and key objectives.`;

  return callApilaAI({ systemPrompt, userPrompt });
}

export async function generateShortNotes(
  subject: string,
  topic: string,
  language: string
): Promise<string> {
  const systemPrompt =
    "You are an expert academic summarizer. Create clear, concise short notes.";
  const userPrompt = `Create short notes for the topic '${topic}' in the subject '${subject}'. 
  Language: ${language}.
  Include:
  1. Key Concepts
  2. Important Definitions
  3. Summary Points
  Ensure the content is accurate and easy to understand.`;

  return callApilaAI({ systemPrompt, userPrompt });
}

export async function generateQuiz(
  subject: string,
  lesson: string,
  language: string,
  questionType: string,
  questionCount: number,
  difficulty: string
): Promise<string> {
  const systemPrompt = `You are an expert quiz creator. Generate a quiz based on the user's requirements. 
  Return the quiz as a valid JSON object.
  
  Supported Question Types: MCQ, Short Answers, Essays, Fill Blanks, Mixed, Multiple Choices.
  
  JSON Structure:
  {
    "title": "Quiz Title",
    "questions": [
      {
        "id": 1,
        "type": "MCQ", // or "Short Answers", "Essays", "Fill Blanks", "Multiple Choices"
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"], // Empty for Short Answers/Essays
        "correctAnswer": 0, // Index for MCQ, or the answer string/array for others
        "explanation": "Detailed explanation of the answer"
      }
    ]
  }

  Guidelines:
  - For "Short Answers", "Essays", "Fill Blanks", leave "options" as an empty array [] and "correctAnswer" as a string or list of key points.
  - For "Multiple Choices" (Multiple Select), "correctAnswer" should be an array of indices.
  - For "Mixed", vary the types within the questions array.
  - Use ${language} for all content.
  - Ensure the difficulty is ${difficulty}.
  - Return ONLY the JSON object.`;

  const userPrompt = `Generate a ${difficulty} difficulty quiz for:
  Subject: ${subject}
  Lesson: ${lesson}
  Language: ${language}
  Question Type: ${questionType} (Include ${questionCount} questions total)`;

  return callApilaAI({ systemPrompt, userPrompt });
}
