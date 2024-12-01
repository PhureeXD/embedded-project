import moment from "moment-timezone"
import { NextResponse } from "next/server"

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { dist, ldr, loudness, motion, smk, timestamp } = body

    const payload = {
      dist,
      ldr,
      loudness,
      motion,
      smk,
      timestamp: moment(timestamp).format() || new Date(),
    }

    // Send the data to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Failed to log data")
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error logging data:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
