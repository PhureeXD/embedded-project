import { ChartOptions } from "chart.js"

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

const distOptions: ChartOptions<"line"> = {
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
      text: "Distance Over Time",
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
        text: "Distance",
      },
    },
  },
}

const ldrOptions: ChartOptions<"line"> = {
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
      text: "LDR Over Time",
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
        text: "LDR",
      },
    },
  },
}

const motionOptions: ChartOptions<"line"> = {
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
      text: "Motion Over Time",
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
        text: "Motion",
      },
    },
  },
}

const smkOptions: ChartOptions<"line"> = {
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
      text: "Smoke Over Time",
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
        text: "Smoke",
      },
    },
  },
}

export { options, distOptions, ldrOptions, motionOptions, smkOptions }
