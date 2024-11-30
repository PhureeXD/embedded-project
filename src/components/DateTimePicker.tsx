"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  readOnly?: boolean
}

export function DateTimePicker({
  date,
  setDate,
  readOnly = false,
}: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<
    Date | undefined
  >(date)

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && !readOnly) {
      const newDateTime = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        selectedDateTime?.getHours() || 0,
        selectedDateTime?.getMinutes() || 0,
      )
      setSelectedDateTime(newDateTime)
      setDate(newDateTime)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly) {
      const [hours, minutes] = e.target.value.split(":").map(Number)
      if (selectedDateTime) {
        const newDateTime = new Date(selectedDateTime)
        newDateTime.setHours(hours)
        newDateTime.setMinutes(minutes)
        setSelectedDateTime(newDateTime)
        setDate(newDateTime)
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            readOnly && "opacity-50 cursor-default",
          )}
          onClick={(e) => readOnly && e.preventDefault()}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {selectedDateTime ? (
            format(selectedDateTime, "PPP HH:mm")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      {!readOnly && (
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDateTime || new Date()}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="p-3 border-t">
            <Input
              type="time"
              onChange={handleTimeChange}
              value={
                selectedDateTime
                  ? format(selectedDateTime, "HH:mm")
                  : format(new Date(), "HH:mm")
              }
            />
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
