import { GoogleGenerativeAI } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null

export async function initializeGeminiApi(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey)
}

export async function generateGeminiResponse(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error(
      "Gemini API not initialized. Call initializeGeminiApi first.",
    )
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}
