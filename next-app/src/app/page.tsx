import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { StatsRSC } from "./_components/stats-rsc"
import { ChartSkeleton } from "./_components/stats-skeleton"

export default function HomePage() {
  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-center text-3xl font-bold">AWS Lambda Benchmark</h1>
        <h2 className="text-center text-lg font-medium text-primary/70">
          eu-central-1
        </h2>
      </div>

      {/* <ErrorBoundary fallback={<div>Error</div>}> */}
      <Suspense fallback={<ChartSkeleton />}>
        <StatsRSC />
      </Suspense>
      {/* </ErrorBoundary> */}
    </main>
  )
}
