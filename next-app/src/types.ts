export type MetricsData = {
  id: string
  timestamp: number
  functionName: string
  runtime: string
  architecture: string
  language: string
  coldStartDuration: number
  warmStartDuration: number
  coldStartMemoryUsed: number
  warmStartMemoryUsed: number
  coldStartBilledDuration: number
  warmStartBilledDuration: number
  coldStartInitDuration?: number
}

export type StatsApiResponse = {
  items: MetricsData[]
  total: number
}
