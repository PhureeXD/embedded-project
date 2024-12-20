"use client"

import { useState, useEffect } from "react"
import { useFirebaseData } from "@/context/FirebaseProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { initializeGeminiApi, generateGeminiResponse } from "@/gemini/geminiApi"
import Markdown from "react-markdown"
import moment from "moment-timezone"

export function GeminiAnalysis() {
  const {
    currentLDRState,
    currentDistState,
    currentLoudnessState,
    currentMotionState,
    currentSmokeState,
    currentTimeStampState,
  } = useFirebaseData()

  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  )
  const [isApiInitialized, setIsApiInitialized] = useState<boolean>(false)

  useEffect(() => {
    setApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
    initializeGeminiApi(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
    setIsApiInitialized(true)
  }, [])

  const handleApiKeySubmit = () => {
    localStorage.setItem("geminiApiKey", apiKey)
    initializeGeminiApi(apiKey)
    setIsApiInitialized(true)
  }

  const analyzeSensorData = async () => {
    setIsLoading(true)
    try {
      const prompt = `Analyze the following sensor data and provide insights:
        LDR (Light): ${currentLDRState} 
        Distance: ${currentDistState} 
        Loudness: ${currentLoudnessState}
        Motion: ${currentMotionState}
        Smoke: ${currentSmokeState} 
        Timestamp: ${moment(currentTimeStampState.current).toLocaleString()}
        (default value from sensors without knowing the units)
        Please provide a brief analysis of the current state of the environment based on these sensor readings. 
        you can use markdown text style too. Let the first line prompt the value of the sensor data.`

      const result = await generateGeminiResponse(prompt)
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing sensor data:", error)

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"

      setAnalysis(`Error occurred while analyzing the data.
        ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isApiInitialized) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gemini API Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={handleApiKeySubmit}>Initialize Gemini API</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-center">Gemini Sensor Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center">
          <Button onClick={analyzeSensorData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Sensor Data"
            )}
          </Button>
        </p>
        {analysis && (
          <div className="mt-4 p-4 bg-secondary rounded-md">
            <h3 className="font-bold underline mb-2">Analysis Results:</h3>
            <Markdown className="leading-8">{analysis}</Markdown>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
