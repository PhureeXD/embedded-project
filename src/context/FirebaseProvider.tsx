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
  currentTimeStampState: 0,
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
      // console.log(paymentDate.isAfter(moment()))
      if (paymentDate.isAfter(moment())) {
        schedule.scheduleJob(paymentDate.toDate(), () =>
          startDiscordBot(
            "payments",
            payment.description,
            paymentDate.toDate(),
          ),
        )
        // console.log(
        //   `Scheduled task for payment desc: ${payment.description} on ${paymentDate.format()}`,
        // )
      }
    })
  }

  useEffect(() => {
    const ledStateRef = ref(database, "ledStateLog")
    const buttonStateRef = ref(database, "buttonStatus")
    const paymentsRef = ref(database, "payments")
    const currentLedStateRef = ref(database, "currentLedState")
    const logStateRef = ref(database, "log")
    const currentLDRStateRef = ref(database, "currentState/LDR")
    const currentDistStateRef = ref(database, "currentState/dist")
    const currentMotionStateRef = ref(database, "currentState/motion")
    const currentSmokeStateRef = ref(database, "currentState/smk")
    const currentTimeStampStateRef = ref(database, "currentState/timestamp")

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
      currentLDRStateRef,
      (snapshot) => {
        if (snapshot.val() >= 1500) {
          startDiscordBot(
            "ldr",
            snapshot.val(),
            new Date(currentTimeStampState),
          )
        }
        setCurrentLDRState(snapshot.val())
      },
      (error) => {
        console.error("Error reading currentLDRState:", error)
      },
    )

    onValue(
      currentDistStateRef,
      (snapshot) => {
        if (snapshot.val() < 100) {
          // startDiscordBot(
          //   "dist",
          //   snapshot.val(),
          //   new Date(currentTimeStampState),
          // )
        }
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
        if (snapshot.val() >= 500) {
          startDiscordBot(
            "smoke",
            snapshot.val(),
            new Date(currentTimeStampState),
          )
        }
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
        // console.log("payments", snapshot.val())
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
