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

  const ledData = Object.values(ledState).map(({ ledStatus, date }) => ({
    ledStatus: ledStatus ? 1 : 0,
    date: new Date(date).toLocaleTimeString(),
  }))

  const distData: number[] = [],
    ldrData: number[] = [],
    motionData: number[] = [],
    smkData: number[] = [],
    dateDate: string[] = []

  Object.values(logState).map(({ dist, ldr, motion, smk, timestamp }) => {
    distData.push(dist)
    ldrData.push(ldr)
    motionData.push(motion)
    smkData.push(smk)
    dateDate.push(new Date(timestamp).toLocaleTimeString())
  })

  const ledDataset = {
    labels: ledData.map((d) => d.date),
    datasets: [
      {
        label: "LED Light Value",
        data: ledData.map((d) => d.ledStatus),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: "origin",
      },
    ],
  }

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

  const allDataset = {
    labels: dateDate,
    datasets: [
      {
        label: "LED Light Value",
        data: ledData.map((d) => d.ledStatus),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
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
    ...options,
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
            <TabsTrigger value="led">LED Light</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="ldr">LDR</TabsTrigger>
            <TabsTrigger value="motion">Motion</TabsTrigger>
            <TabsTrigger value="smoke">Smoke</TabsTrigger>
          </TabsList>
          <div className="p-4 bg-secondary rounded-lg">
            <TabsContent value="all">
              <Line options={allOptions} data={allDataset} />
            </TabsContent>
            <TabsContent value="led">
              <Line options={options} data={ledDataset} />
            </TabsContent>
            <TabsContent value="distance">
              <Line options={distOptions} data={distDataset} />
            </TabsContent>
            <TabsContent value="ldr">
              <Line options={ldrOptions} data={ldrDataset} />
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
