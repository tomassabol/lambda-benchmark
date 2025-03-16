export type StepFunctionEvent = {
  functionName: string
  functionArn: string
  runtime: string
  architecture: string
  language: string
  executionId: string
}

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

export type LogQueryResult = {
  "@message": string
  "@timestamp": string
  [key: string]: string
}

export type LambdaMetrics = {
  duration: number
  billedDuration: number
  memoryUsed: number
  initDuration?: number
}
