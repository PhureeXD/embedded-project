import LedButtonMonitor from "@/components/LedButtonMonitor"
import { DataTableDemo } from "@/components/DataTableDemo"
import { AddDataForm } from "@/components/AddDataForm"
import LineChart from "@/components/LineChart"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Dashboard from "@/components/Dashboard"

export default function Home() {
  return (
    <main className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center">
        Advanced System Monitor
      </h1>
      <section>
        <article className="md:w-[60dvw] mx-auto mt-8">
          <Suspense fallback={<Skeleton className="h-40" />}>
            <LedButtonMonitor />
          </Suspense>
        </article>

        <article className="md:w-[60dvw] mx-auto mt-8">
          <Suspense fallback={<Skeleton className="h-40" />}>
            <AddDataForm />
          </Suspense>
        </article>

        <article className="md:w-[60dvw] mx-auto mt-8">
          <Suspense fallback={<Skeleton className="h-60" />}>
            <DataTableDemo />
          </Suspense>
        </article>

        <article className="max-w-[90dvw] mx-auto mt-8">
          <Suspense fallback={<Skeleton className="h-80" />}>
            <Dashboard />
          </Suspense>
        </article>

        <article className="max-w-[90dvw] mx-auto mt-8">
          <Suspense fallback={<Skeleton className="h-80" />}>
            <LineChart />
          </Suspense>
        </article>
      </section>
    </main>
  )
}
