import { env } from "~/env"
import { type StatsApiResponse } from "~/types"

export async function getStats() {
  const stats = await fetch(env.LAMBDA_STATS_API_URL, {
    headers: {
      "x-api-key": env.LAMBDA_STATS_API_KEY,
    },
    cache: "no-store",
  })
  return stats.json() as Promise<StatsApiResponse>
}
