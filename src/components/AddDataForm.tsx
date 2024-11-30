"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { database, ref, push } from "@/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send } from "lucide-react"
import { DateTimePicker } from "@/components/DateTimePicker"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToastAction } from "./ui/toast"

type FormData = {
  description: string
  status: "processing" | "success" | "failed"
  date: Date
}

export function AddDataForm() {
  const form = useForm<FormData>({
    defaultValues: {
      status: "processing",
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      await push(ref(database, "payments"), {
        ...data,
        date: data.date.toISOString(),
      })

      toast({
        title: "Success",
        description: "Data added successfully.",
        duration: 3000,
      })

      form.reset({
        status: "processing",
      })
    } catch (error) {
      console.error("Error adding document: ", error)

      toast({
        title: "Error",
        description: "There was a problem adding the data.",
        variant: "destructive",
        duration: 5000,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Add New Task!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task description"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description for the task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="processing">
                        <Badge
                          variant="outline"
                          className="text-blue-800 bg-blue-100"
                        >
                          Processing
                        </Badge>
                      </SelectItem>
                      <SelectItem value="success">
                        <Badge
                          variant="outline"
                          className="text-green-800 bg-green-100"
                        >
                          Success
                        </Badge>
                      </SelectItem>
                      <SelectItem value="failed">
                        <Badge
                          variant="outline"
                          className="text-red-800 bg-red-100"
                        >
                          Failed
                        </Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the current status of the task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date and Time</FormLabel>
                  <FormControl>
                    <div>
                      <Controller
                        name="date"
                        control={form.control}
                        render={({ field }) => (
                          <DateTimePicker
                            date={field.value}
                            setDate={(date) => field.onChange(date)}
                          />
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select the date and time of the task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Task
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
