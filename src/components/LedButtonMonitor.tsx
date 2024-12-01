"use client"

import { database, ref, set, push } from "@/firebase/config"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Laptop, Cpu } from "lucide-react"
import { startDiscordBot } from "@/discord/discord-bot"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import LightBulb from "./LightBulb"
import { useFirebaseData } from "@/context/FirebaseProvider"

export default function LedButtonMonitor() {
  const { buttonState, currentLedState } = useFirebaseData()

  const toggleLedState = async () => {
    const newLedState = !currentLedState?.ledStatus
    const dateBase = new Date()
    const date = dateBase.toISOString()

    await set(ref(database, "currentLedState"), {
      ledStatus: newLedState,
      date: date,
    })

    await push(ref(database, "ledStateLog"), {
      ledStatus: newLedState,
      date: date,
    })

    startDiscordBot("ledStatus", newLedState ? 1 : 0, dateBase)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            System Monitor
          </CardTitle>
          <CardDescription className="text-center">
            Real-time & Useful Innovation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full h-[200px]">
              <Canvas camera={{ position: [0, 0, 5], fov: 35 }}>
                <color attach="background" args={["#9f0937"]} />
                <OrbitControls />
                <LightBulb isOn={currentLedState?.ledStatus} />
              </Canvas>
            </div>
            {/* <div className="flex items-center justify-between w-full p-4 border-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Laptop className="w-6 h-6" />
                <span className="text-lg font-medium">Light Bulb Status</span>
              </div>
              <Badge
                variant={currentLedState?.ledStatus ? "default" : "destructive"}
                className="text-xs font-semibold"
              >
                {currentLedState?.ledStatus ? "ON" : "OFF"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Cpu className="w-6 h-6" />
              <span className="text-lg font-medium">Button Status</span>
            </div>
            <Badge
              variant={buttonState ? "default" : "destructive"}
              className="text-xs font-semibold"
            >
              {buttonState ? "PRESSED" : "RELEASED"}
            </Badge>*/}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">Toggle Light</span>
            <Switch
              checked={currentLedState?.ledStatus}
              onCheckedChange={toggleLedState}
              aria-label="Toggle LED"
            />
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
