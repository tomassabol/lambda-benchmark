import type { Request } from "@gymbeam/lambda-api"
import { ApiError } from "@gymbeam/lambda-api-toolkit"

/**
 * Get getDeadlineParamsFromQuery from path parameters with validation
 *
 * @throws {ApiError} if one of the parameters is not provided or is not a string
 *
 * @example
 * ```typescript
 * const
 * const { shippingMethod, storeId } = getDeadlineParamsFromQuery(req.query)
 * ```
 */

export function getDeadlineParamsFromQuery(query?: Request["query"]) {
  const shippingMethod = query?.shippingMethod
  const storeId = query?.storeId

  const isValidshippingMethod =
    shippingMethod && typeof shippingMethod === "string"
  const isValidstoreId = storeId && typeof storeId === "string"

  // If one of the parameters is not provided or is not a string, throw an error
  if (isValidshippingMethod !== isValidstoreId) {
    throw new ApiError(400, "Invalid query parameters")
  }

  return {
    shippingMethod,
    storeId,
  }
}
