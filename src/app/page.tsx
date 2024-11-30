import LedButtonMonitor from "@/components/LedButtonMonitor"
import { DataTableDemo } from "@/components/DataTableDemo"
import { AddDataForm } from "@/components/AddDataForm"
import LineChart from "@/components/LineChart"

export default function Home() {
  return (
    <main className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center">
        Advanced System Monitor
      </h1>
      <section>
        <article className="md:w-[40dvw] mx-auto mt-8">
          <LedButtonMonitor />
        </article>

        <article className="md:w-[40dvw] mx-auto mt-8">
          <AddDataForm />
        </article>

        <article className="md:w-[60dvw] mx-auto mt-8">
          <DataTableDemo />
        </article>

        <article className="max-w-[70dvw] mx-auto mt-8">
          <LineChart />
        </article>
      </section>
    </main>
  )
}
