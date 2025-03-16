import "./service-name"

import { logger } from "@gymbeam/aws-common/utils/logger"
import { createApiHandler } from "@gymbeam/lambda-api-toolkit"

import { statsRoutes } from "../../api/stats-routes"
const routes = [statsRoutes]

export const handler = createApiHandler(routes, { logger })
