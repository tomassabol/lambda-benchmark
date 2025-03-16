import { type API } from "@gymbeam/lambda-api"

import { getStats } from "../app/stats/get-stats"

/**
 * API routes for stats
 *
 * @example
 * ```typescript
 * const api = createAPI()
 * api.register(statsRoutes)
 * ```
 */

export const statsRoutes = (api: API) => {
  api.get("/v1/stats", getStats)
}
