"use client"
import { database } from "@/firebase/config"
import { ref, onValue, off } from "@/firebase/config"
import { createContext, useContext, useEffect, useState } from "react"

interface ledState {
  ledStatus: boolean
  date: string
}

interface ldrState {
  ldr: number
  date: string
}

interface distState {
  dist: number
  date: string
}

interface motionState {
  motion: number
  date: string
}

interface smokeState {
  smk: number
  date: string
}

interface log {
  dist: number
  ldr: number
  motion: number
  smk: number
  timestamp: number
}

interface FirebaseDataContextType {
  ledState: ledState[]

  buttonState: boolean

  payments: object[]

  currentLedState: ledState

  logState: log[]

  currentLDRState: ldrState
  currentDistState: distState
  currentMotionState: motionState
  currentSmokeState: smokeState
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
  currentLDRState: {
    ldr: 0,
    date: "",
  },
  currentDistState: {
    dist: 0,
    date: "",
  },
  currentMotionState: {
    motion: 0,
    date: "",
  },
  currentSmokeState: {
    smk: 0,
    date: "",
  },
}

const FirebaseDataContext = createContext<FirebaseDataContextType>(defaultValue)

export const FirebaseDataProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [ledState, setLedState] = useState<ledState[]>([])
  const [buttonState, setButtonState] = useState(false)
  const [payments, setPayments] = useState<object[]>([])

  const [logState, setLogState] = useState<log[]>([])
  const [currentLedState, setCurrentLedState] = useState<ledState>(
    defaultValue.currentLedState,
  )
  const [currentLDRState, setCurrentLDRState] = useState<ldrState>(
    defaultValue.currentLDRState,
  )
  const [currentDistState, setCurrentDistState] = useState<distState>(
    defaultValue.currentDistState,
  )
  const [currentMotionState, setCurrentMotionState] = useState<motionState>(
    defaultValue.currentMotionState,
  )
  const [currentSmokeState, setCurrentSmokeState] = useState<smokeState>(
    defaultValue.currentSmokeState,
  )

  useEffect(() => {
    const ledStateRef = ref(database, "ledStateLog")
    const buttonStateRef = ref(database, "buttonStatus")
    const paymentsRef = ref(database, "payments")
    const currentLedStateRef = ref(database, "currentLedState")
    const logStateRef = ref(database, "log")
    const currentLDRStateRef = ref(database, "currentLDR")
    const currentDistStateRef = ref(database, "currentDist")
    const currentMotionStateRef = ref(database, "currentMotion")
    const currentSmokeStateRef = ref(database, "currentSmoke")

    onValue(
      currentLDRStateRef,
      (snapshot) => setCurrentLDRState(snapshot.val()),
      (error) => {
        console.error("Error reading currentLDRState:", error)
      },
    )

    onValue(
      currentDistStateRef,
      (snapshot) => setCurrentDistState(snapshot.val()),
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
      (snapshot) => setCurrentSmokeState(snapshot.val()),
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
      (snapshot) => setPayments(snapshot.val()),
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
      }}
    >
      {children}
    </FirebaseDataContext.Provider>
  )
}

export const useFirebaseData = () => useContext(FirebaseDataContext)
