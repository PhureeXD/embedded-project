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
      font: {
        size: 18, // Increase the size as needed
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        align: "end",
        text: "Time",
        font: {
          size: 14,
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "LED Light Value",
        font: {
          size: 14,
        },
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
      font: {
        size: 18, // Increase the size as needed
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        align: "end",
        text: "Time",
        font: {
          size: 14,
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Distance",
        font: {
          size: 14,
        },
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
      font: {
        size: 18, // Increase the size as needed
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        align: "end",
        text: "Time",
        font: {
          size: 14,
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "LDR",
        font: {
          size: 14,
        },
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
      font: {
        size: 18, // Increase the size as needed
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        align: "end",
        text: "Time",
        font: {
          size: 14,
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Motion",
        font: {
          size: 14,
        },
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
      font: {
        size: 18, // Increase the size as needed
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        align: "end",
        text: "Time",
        font: {
          size: 14,
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Smoke",
        font: {
          size: 14,
        },
      },
    },
  },
}

export { options, distOptions, ldrOptions, motionOptions, smkOptions }
