"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { useFirebaseData } from "@/context/FirebaseProvider"
import {
  options,
  ldrOptions,
  distOptions,
  smkOptions,
  motionOptions,
  loudnessOptions, // Import loudnessOptions
} from "@/constant/options"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const LineChart = () => {
  const { ledState, logState } = useFirebaseData()

  // const ledData = Object.values(ledState).map(({ ledStatus, date }) => ({
  //   ledStatus: ledStatus ? 1 : 0,
  //   date: new Date(date).toLocaleTimeString(),
  // }))

  const distData: number[] = [],
    ldrData: number[] = [],
    motionData: number[] = [],
    smkData: number[] = [],
    loudnessData: number[] = [], // Add loudnessData array
    dateDate: string[] = []

  Object.values(logState).map(
    ({ dist, ldr, motion, smk, loudness, timestamp }) => {
      distData.push(dist)
      ldrData.push(ldr)
      motionData.push(motion)
      smkData.push(smk)
      loudnessData.push(loudness) // Push loudness data
      dateDate.push(new Date(timestamp).toLocaleTimeString())
    },
  )

  const distDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "Distance",
        data: distData,
        borderColor: "#42b883",
        backgroundColor: "rgba(66, 184, 131, 0.2)",
        fill: "origin",
      },
    ],
  }

  const ldrDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "LDR",
        data: ldrData,
        borderColor: "#ffc93c",
        backgroundColor: "rgba(255, 201, 60, 0.2)",
        fill: "origin",
      },
    ],
  }

  const motionDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "Motion",
        data: motionData,
        borderColor: "#f38181",
        backgroundColor: "rgba(243, 129, 129, 0.2)",
        fill: "origin",
      },
    ],
  }

  const smkDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "Smoke",
        data: smkData,
        borderColor: "#5f6769",
        backgroundColor: "rgba(95, 103, 105, 0.2)",
        fill: "origin",
      },
    ],
  }

  const loudnessDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "Loudness",
        data: loudnessData,
        borderColor: "#7c73e6",
        backgroundColor: "#c4c1e0",
        fill: "origin",
      },
    ],
  }

  const allDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "Distance",
        data: distData,
        borderColor: "#42b883",
        backgroundColor: "rgba(66, 184, 131, 0.2)",
        fill: false,
      },
      {
        label: "LDR",
        data: ldrData,
        borderColor: "#ffc93c",
        backgroundColor: "rgba(255, 201, 60, 0.2)",
        fill: false,
      },
      {
        label: "Loudness",
        data: loudnessData,
        borderColor: "#7c73e6",
        backgroundColor: "#c4c1e0",
        fill: false,
      },
      {
        label: "Motion",
        data: motionData,
        borderColor: "#f38181",
        backgroundColor: "rgba(243, 129, 129, 0.2)",
        fill: false,
      },
      {
        label: "Smoke",
        data: smkData,
        borderColor: "#5f6769",
        backgroundColor: "rgba(95, 103, 105, 0.2)",
        fill: false,
      },
    ],
  }

  const allOptions = {
    responsive: true,
    plugins: {
      filler: {
        propagate: true,
      },
      title: {
        display: true,
        text: "Sensors Data Over Time",
        font: {
          size: 18, // Increase the size as needed
        },
      },
    },
    scales: {
      ...(options.scales ?? {}),
      y: {
        ...(options.scales?.y ?? {}),
        title: {
          ...(options.scales?.y?.title ?? {}),
          text: "Value",
        },
      },
    },
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sensor Data Charts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="ldr">LDR</TabsTrigger>
            <TabsTrigger value="loudness">Loudness</TabsTrigger>
            <TabsTrigger value="motion">Motion</TabsTrigger>
            <TabsTrigger value="smoke">Smoke</TabsTrigger>
          </TabsList>
          <div className="p-4 bg-secondary rounded-lg">
            <TabsContent value="all">
              <Line options={allOptions} data={allDataset} />
            </TabsContent>
            <TabsContent value="distance">
              <Line options={distOptions} data={distDataset} />
            </TabsContent>
            <TabsContent value="ldr">
              <Line options={ldrOptions} data={ldrDataset} />
            </TabsContent>
            <TabsContent value="loudness">
              <Line options={loudnessOptions} data={loudnessDataset} />
            </TabsContent>
            <TabsContent value="motion">
              <Line options={motionOptions} data={motionDataset} />
            </TabsContent>
            <TabsContent value="smoke">
              <Line options={smkOptions} data={smkDataset} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default LineChart
