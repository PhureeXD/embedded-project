"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebaseData } from "@/context/FirebaseProvider"
import {
  ArrowRight,
  Droplet,
  Lightbulb,
  AlarmSmokeIcon as Smoke,
  Wind,
} from "lucide-react"

const Dashboard = () => {
  const {
    currentLDRState,
    currentDistState,
    currentMotionState,
    currentSmokeState,
    currentTimeStampState,
  } = useFirebaseData()

  const formatValue = (value: number | null | undefined, unit: string) => {
    return value !== null && value !== undefined ? `${value} ${unit}` : "N/A"
  }

  const cards = [
    {
      title: "Distance",
      value: formatValue(currentDistState, "cm"),
      icon: ArrowRight,
      color: "text-blue-500",
    },
    {
      title: "LDR",
      value: formatValue(currentLDRState, "lux"),
      icon: Lightbulb,
      color: "text-yellow-500",
    },
    {
      title: "Smoke",
      value: formatValue(currentSmokeState, "ppm"),
      icon: Smoke,
      color: "text-red-500",
    },
    {
      title: "Motion",
      value: currentMotionState ?? "N/A",
      icon: Wind,
      color: "text-green-500",
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sensor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(currentTimeStampState ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
