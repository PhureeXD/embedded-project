"use client"
import { startDiscordBot } from "@/discord/discord-bot"
import { database, update } from "@/firebase/config"
import { ref, onValue, off } from "@/firebase/config"
import { createContext, useContext, useEffect, useState } from "react"
import schedule from "node-schedule"
import moment from "moment-timezone"

interface LedState {
  ledStatus: boolean
  date: string
}

interface Log {
  dist: number
  ldr: number
  loudness: number
  motion: number
  smk: number
  timestamp: number
}

interface Payment {
  date: string
  description: string
  status: string
}

interface FirebaseDataContextType {
  ledState: LedState[]

  buttonState: boolean

  payments: Payment[]

  currentLedState: LedState

  logState: Log[]

  currentLDRState: number
  currentDistState: number
  currentLoudnessState: number
  currentMotionState: number
  currentSmokeState: number
  currentTimeStampState: number
}

const defaultValue: FirebaseDataContextType = {
  ledState: [],
  buttonState: false,
  payments: [],
  currentLedState: {
    ledStatus: false,
    date: "",
  },
  logState: [],
  currentLDRState: 0,
  currentDistState: 0,
  currentLoudnessState: 0,
  currentMotionState: 0,
  currentSmokeState: 0,
  currentTimeStampState: Date.now(),
}

let lastNotificationTime = 0

const debounceNotification = (callback: () => void, delay: number) => {
  const currentTime = Date.now()
  if (currentTime - lastNotificationTime > delay) {
    callback()
    lastNotificationTime = currentTime
  }
}

const loggedDataTimestamps = new Set<number>()

const handleLogDataToSheet = async (data: {
  dist: number
  ldr: number
  loudness: number
  motion: number
  smk: number
  timestamp: number
}) => {
  if (loggedDataTimestamps.has(data.timestamp)) return
  loggedDataTimestamps.add(data.timestamp)

  try {
    const response = await fetch("/api/log-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to log data")
    }

    // const result = await response.json()
    // console.log("Data logged successfully:", result)
  } catch (error) {
    console.error("Error logging data:", error)
  }
}

const FirebaseDataContext = createContext<FirebaseDataContextType>(defaultValue)

export const FirebaseDataProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [ledState, setLedState] = useState<LedState[]>([])
  const [buttonState, setButtonState] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])

  const [logState, setLogState] = useState<Log[]>([])
  const [currentLedState, setCurrentLedState] = useState<LedState>(
    defaultValue.currentLedState,
  )
  const [currentLDRState, setCurrentLDRState] = useState<number>(
    defaultValue.currentLDRState,
  )

  const [currentLoudnessState, setCurrentLoudnessState] = useState<number>(
    defaultValue.currentLoudnessState,
  )

  const [currentDistState, setCurrentDistState] = useState<number>(
    defaultValue.currentDistState,
  )
  const [currentMotionState, setCurrentMotionState] = useState<number>(
    defaultValue.currentMotionState,
  )
  const [currentSmokeState, setCurrentSmokeState] = useState<number>(
    defaultValue.currentSmokeState,
  )
  const [currentTimeStampState, setCurrentTimeStampState] = useState<number>(
    defaultValue.currentTimeStampState,
  )

  function schedulePaymentTasks(payment: Payment, paymentKey: string) {
    if (!payment) return

    const paymentDate = moment(payment.date)

    if (paymentDate.isAfter(moment())) {
      schedule.scheduleJob(paymentDate.toDate(), async () => {
        await startDiscordBot(
          "payments",
          payment.description,
          paymentDate.toDate(),
        )
        // Update the status to "success" in Firebase
        await update(ref(database, `payments/${paymentKey}`), {
          status: "success",
        })
      })
    }
  }

  useEffect(() => {
    const currentTimeStampStateRef = ref(database, "currentState/timestamp")
    const ledStateRef = ref(database, "ledStateLog")
    const buttonStateRef = ref(database, "buttonStatus")
    const paymentsRef = ref(database, "payments")
    const currentLedStateRef = ref(database, "currentLedState")
    const logStateRef = ref(database, "log")
    const currentLDRStateRef = ref(database, "currentState/LDR")
    const currentDistStateRef = ref(database, "currentState/dist")
    const currentLoudnessStateRef = ref(database, "currentState/loudness")
    const currentMotionStateRef = ref(database, "currentState/motion")
    const currentSmokeStateRef = ref(database, "currentState/smk")
    const currentState = ref(database, "currentState")

    onValue(
      currentTimeStampStateRef,
      (snapshot) => {
        setCurrentTimeStampState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentTimeStampState:", error)
      },
    )

    onValue(
      currentState,
      (snapshot) => {
        handleLogDataToSheet(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentState:", error)
      },
    )

    onValue(
      currentLDRStateRef,
      (snapshot) => {
        // debounceNotification(() => {
        //   if (snapshot.val() >= 1500) {
        //     startDiscordBot(
        //       "ldr",
        //       snapshot.val(),
        //       new Date(currentTimeStampState),
        //     )
        //   }
        // }, 3000)
        setCurrentLDRState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentLDRState:", error)
      },
    )

    onValue(
      currentDistStateRef,
      (snapshot) => {
        // debounceNotification(() => {
        //   if (snapshot.val() < 100) {
        //     startDiscordBot(
        //       "dist",
        //       snapshot.val(),
        //       new Date(currentTimeStampState),
        //     )
        //   }
        // }, 3000)
        setCurrentDistState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentDistState:", error)
      },
    )

    onValue(
      currentLoudnessStateRef,
      (snapshot) => setCurrentLoudnessState(snapshot.val()),
      (error) => {
        console.error("Error reading currentLoudnessState:", error)
      },
    )

    onValue(
      currentMotionStateRef,
      (snapshot) => {
        debounceNotification(() => {
          if (snapshot.val()) {
            startDiscordBot(
              "motion",
              snapshot.val() ? 1 : 0,
              new Date(currentTimeStampState),
            )
          }
        }, 3000)

        setCurrentMotionState(snapshot.val() ? 1 : 0)
      },
      (error) => {
        console.error("Error reading currentMotionState:", error)
      },
    )

    onValue(
      currentSmokeStateRef,
      (snapshot) => {
        debounceNotification(() => {
          if (snapshot.val() >= 500) {
            startDiscordBot(
              "smoke",
              snapshot.val(),
              new Date(currentTimeStampState),
            )
          }
        }, 3000)

        setCurrentSmokeState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentSmokeState:", error)
      },
    )

    onValue(
      logStateRef,
      (snapshot) => {
        setLogState(snapshot.val())

        // snapshot.forEach((childSnapshot) => {
        //   const childData = childSnapshot.val()
        //   handleLogDataToSheet(childData)
        // })
      },
      (error) => {
        console.error("Error reading logState:", error)
      },
    )

    onValue(
      currentLedStateRef,
      (snapshot) => setCurrentLedState(snapshot.val()),
      (error) => {
        console.error("Error reading currentLedState:", error)
      },
    )

    onValue(
      ledStateRef,
      (snapshot) => {
        setLedState(snapshot.val())
      },
      (error) => {
        console.error("Error reading ledStatus:", error)
      },
    )

    onValue(
      buttonStateRef,
      (snapshot) => setButtonState(snapshot.val()),
      (error) => {
        console.error("Error reading buttonStatus:", error)
      },
    )

    onValue(
      paymentsRef,
      (snapshot) => {
        const paymentsData = snapshot.val()
        setPayments(paymentsData)
        schedule.gracefulShutdown()
        Object.keys(paymentsData).forEach((paymentKey) => {
          console.log(paymentsData[paymentKey])
          schedulePaymentTasks(paymentsData[paymentKey], paymentKey)
        })
      },
      (error) => {
        console.error("Error reading payments:", error)
      },
    )

    return () => {
      off(ledStateRef)
      off(buttonStateRef)
      off(paymentsRef)
      off(currentLedStateRef)
      off(logStateRef)
      off(currentLDRStateRef)
      off(currentDistStateRef)
      off(currentMotionStateRef)
      off(currentSmokeStateRef)
      off(currentTimeStampStateRef)
    }
  }, [])

  return (
    <FirebaseDataContext.Provider
      value={{
        ledState,
        buttonState,
        payments,
        currentLedState,
        logState,
        currentLDRState,
        currentDistState,
        currentMotionState,
        currentSmokeState,
        currentTimeStampState,
        currentLoudnessState,
      }}
    >
      {children}
    </FirebaseDataContext.Provider>
  )
}

export const useFirebaseData = () => useContext(FirebaseDataContext)
