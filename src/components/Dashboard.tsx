"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebaseData } from "@/context/FirebaseProvider"
import {
  ArrowRight,
  Lightbulb,
  AlarmSmokeIcon as Smoke,
  Wind,
} from "lucide-react"
import { GeminiAnalysis } from "./GeminiAnalysis"
import { useEffect, useState } from "react"
import { formatValue } from "@/lib/utils"
import moment from "moment-timezone"

const Dashboard = () => {
  const {
    currentLDRState,
    currentDistState,
    currentMotionState,
    currentSmokeState,
    currentTimeStampState,
  } = useFirebaseData()

  const [clientTimeStamp, setClientTimeStamp] = useState<string | null>(null)

  useEffect(() => {
    if (currentTimeStampState) {
      setClientTimeStamp(moment(currentTimeStampState).format("LLL"))
    }
  }, [currentTimeStampState])

  const cards = [
    {
      title: "Distance",
      value: formatValue(currentDistState),
      icon: ArrowRight,
      color: "text-blue-500",
    },
    {
      title: "LDR",
      value: formatValue(currentLDRState),
      icon: Lightbulb,
      color: "text-yellow-500",
    },
    {
      title: "Smoke",
      value: formatValue(currentSmokeState),
      icon: Smoke,
      color: "text-red-500",
    },
    {
      title: "Motion",
      value: currentMotionState ? "Detected" : "Not Detected",
      icon: Wind,
      color: "text-green-500",
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Sensor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {clientTimeStamp && clientTimeStamp.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <GeminiAnalysis />
    </div>
  )
}

export default Dashboard
