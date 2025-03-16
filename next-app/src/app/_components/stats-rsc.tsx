import { getStats } from "../_lib/get-stats"
import { Chart } from "./chart"

export async function StatsRSC() {
  const stats = (await getStats()).items
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    .map((item) => {
      const date = new Date(item.timestamp * 1000)
      const day = date.toISOString().split("T")[0]
      const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
      })
      return {
        ...item,
        timestamp: `${day} ${time}`,
      }
    })
  const sortByRuntimeAndLanguage = stats.reduce(
    (acc, item) => {
      const key = `${item.runtime}-${item.language}-${item.architecture}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<string, typeof stats>,
  )

  if (Object.keys(sortByRuntimeAndLanguage).length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-4 p-4">
        <p className="text-center text-lg font-medium text-primary/70">
          No data
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-4 p-4">
      {Object.entries(sortByRuntimeAndLanguage)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => (
          <Chart key={key} chartData={value} />
        ))}
    </div>
  )
}
