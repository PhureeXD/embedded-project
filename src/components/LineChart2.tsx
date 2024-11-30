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
  ChartOptions,
  Filler,
} from "chart.js"
import { useFirebaseData } from "@/context/FirebaseProvider"

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

const options: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    filler: {
      propagate: true,
    },
    legend: {
      position: "top",
      display: true,
    },
    title: {
      display: true,
      text: "LED Light Value Over Time",
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Time",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "LED Light Value",
      },
    },
  },
}

const LineChart = () => {
  const { ledState } = useFirebaseData()
  const data = Object.values(ledState).map(({ ledStatus, date }) => ({
    ledStatus: ledStatus ? 1 : 0,
    date,
  }))

  // const data = [
  //   {
  //     date: "2021-09-01T00:00:00Z",
  //     ledLightValue: Math.floor(Math.random() * 100),
  //   },
  //   {
  //     date: "2021-09-01T01:00:00Z",
  //     ledLightValue: 20,
  //   },
  //   {
  //     date: "2021-09-01T02:00:00Z",
  //     ledLightValue: Math.floor(Math.random() * 100),
  //   },
  //   {
  //     date: "2021-09-01T03:00:00Z",
  //     ledLightValue: Math.floor(Math.random() * 100),
  //   },
  //   {
  //     date: "2021-09-01T04:00:00Z",
  //     ledLightValue: Math.floor(Math.random() * 100),
  //   },
  //   {
  //     date: "2021-09-01T05:00:00Z",
  //     ledLightValue: Math.floor(Math.random() * 100),
  //   },
  //   {
  //     date: "2021-09-01T06:00:00Z",
  //     ledLightValue: Math.floor(Math.random() * 100),
  //   },
  // ]

  const data2 = {
    labels: data.map((d) => new Date(d.date).toLocaleTimeString()),
    datasets: [
      {
        label: "LED Light Value",
        data: data.map((d) => d.ledStatus),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: "origin",
      },
    ],
  }

  return (
    <div className="w-full mx-auto">
      <Line options={options} data={data2} />
    </div>
  )
}

export default LineChart
