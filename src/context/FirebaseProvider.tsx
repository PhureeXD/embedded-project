"use client"
import { startDiscordBot } from "@/discord/discord-bot"
import { database } from "@/firebase/config"
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
  currentMotionState: 0,
  currentSmokeState: 0,
  currentTimeStampState: Date.now(),
}

const FirebaseDataContext = createContext<FirebaseDataContextType>(defaultValue)

let lastNotificationTime = 0

const debounceNotification = (callback: () => void, delay: number) => {
  const currentTime = Date.now()
  if (currentTime - lastNotificationTime > delay) {
    callback()
    lastNotificationTime = currentTime
  }
}

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

  function schedulePaymentTasks(payments: Payment[]) {
    if (!payments) return

    payments.forEach((payment) => {
      const paymentDate = moment(payment.date)
      if (paymentDate.isAfter(moment())) {
        schedule.scheduleJob(paymentDate.toDate(), () =>
          startDiscordBot(
            "payments",
            payment.description,
            paymentDate.toDate(),
          ),
        )
      }
    })
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
    const currentMotionStateRef = ref(database, "currentState/motion")
    const currentSmokeStateRef = ref(database, "currentState/smk")

    onValue(
      currentTimeStampStateRef,
      (snapshot) => {
        console.log("currentTimeStampState", snapshot.val())
        setCurrentTimeStampState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentTimeStampState:", error)
      },
    )

    onValue(
      currentLDRStateRef,
      (snapshot) => {
        console.log("currentLDRState", snapshot.val())
        console.log("currentTimeStampState", currentTimeStampState)
        debounceNotification(() => {
          if (snapshot.val() >= 1500) {
            startDiscordBot(
              "ldr",
              snapshot.val(),
              new Date(currentTimeStampState),
            )
          }
        }, 3000)
        setCurrentLDRState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentLDRState:", error)
      },
    )

    onValue(
      currentDistStateRef,
      (snapshot) => {
        debounceNotification(() => {
          if (snapshot.val() < 100) {
            startDiscordBot(
              "dist",
              snapshot.val(),
              new Date(currentTimeStampState),
            )
          }
        }, 3000)
        setCurrentDistState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentDistState:", error)
      },
    )

    onValue(
      currentMotionStateRef,
      (snapshot) => setCurrentMotionState(snapshot.val()),
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
      (snapshot) => setLogState(snapshot.val()),
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
        setPayments(snapshot.val())
        schedule.gracefulShutdown()
        schedulePaymentTasks(Object.values(snapshot.val()))
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
      }}
    >
      {children}
    </FirebaseDataContext.Provider>
  )
}

export const useFirebaseData = () => useContext(FirebaseDataContext)
