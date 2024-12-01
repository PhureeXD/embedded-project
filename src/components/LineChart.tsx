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

// Mock data
// const generateMockData = () => {
//   const data = []
//   const now = new Date()
//   for (let i = 0; i < 24; i++) {
//     data.push({
//       datetime: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
//       ledLightValue: Math.floor(Math.random() * 100),
//     })
//   }
//   return data.reverse()
// }

// const mockData = generateMockData()

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
        backgroundColor: "#e0ffcd",
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
        backgroundColor: "#fdffcd",
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
        backgroundColor: "#ffebeb",
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
        backgroundColor: "#ececec",
        fill: "origin",
      },
    ],
  }

  return (
    <div className="w-full mx-auto space-y-5">
      <Line options={options} data={ledDataset} />
      <Line options={distOptions} data={distDataset} />
      <Line options={ldrOptions} data={ldrDataset} />
      <Line options={motionOptions} data={motionDataset} />
      <Line options={smkOptions} data={smkDataset} />
    </div>
  )
}

export default LineChart
