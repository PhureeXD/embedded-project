"use client"

import { useState, useEffect } from "react"
import { useFirebaseData } from "@/context/FirebaseProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { initializeGeminiApi, generateGeminiResponse } from "@/gemini/geminiApi"
import Markdown from "react-markdown"

export function GeminiAnalysis() {
  const {
    currentLDRState,
    currentDistState,
    currentMotionState,
    currentSmokeState,
    currentTimeStampState,
  } = useFirebaseData()

  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<string>("")
  const [isApiInitialized, setIsApiInitialized] = useState<boolean>(false)

  useEffect(() => {
    const storedApiKey = localStorage.getItem("geminiApiKey")
    if (storedApiKey) {
      setApiKey(storedApiKey)
      initializeGeminiApi(storedApiKey)
      setIsApiInitialized(true)
    }
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
        LDR (Light): ${currentLDRState} lux
        Distance: ${currentDistState} cm
        Motion: ${currentMotionState}
        Smoke: ${currentSmokeState} ppm
        Timestamp: ${new Date(currentTimeStampState).toLocaleString()}
        
        Please provide a brief analysis of the current state of the environment based on these sensor readings. 
        Include any potential issues or anomalies, and suggest any actions that might need to be taken.`

      const result = await generateGeminiResponse(prompt)
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing sensor data:", error)
      setAnalysis("Error occurred while analyzing the data.")
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
      <CardContent className="text-center">
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
