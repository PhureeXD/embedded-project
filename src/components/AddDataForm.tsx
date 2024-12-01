"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { database, ref, push } from "@/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { ToastAction } from "@/components/ui/toast"

type FormData = {
  description: string
  status: "processing" | "success" | "failed"
  date: Date
}

export function AddDataForm() {
  const form = useForm<FormData>({
    defaultValues: {
      status: "processing",
      description: "",
      date: new Date(),
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
        description: "Task added successfully.",
        duration: 3000,
      })

      form.reset({
        status: "processing",
        description: "",
        date: new Date(),
      })
    } catch (error) {
      console.error("Error adding document: ", error)

      toast({
        title: "Error",
        description: "There was a problem adding the task.",
        variant: "destructive",
        duration: 5000,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          Add New Task
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              Processing
                            </Badge>
                          </SelectItem>
                          <SelectItem value="success">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              Success
                            </Badge>
                          </SelectItem>
                          <SelectItem value="failed">
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800"
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
                        <DateTimePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                        />
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
      </PopoverContent>
    </Popover>
  )
}
