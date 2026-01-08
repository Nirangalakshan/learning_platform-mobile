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
