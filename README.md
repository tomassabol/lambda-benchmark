# AWS Lambda Benchmark

A comprehensive benchmarking tool for AWS Lambda functions across different runtimes and architectures. This project helps you compare the performance of various Lambda runtimes including Node.js, Python, .NET, Java, Go, and Rust, running on both ARM64 and x86_64 architectures.

## Architecture

![AWS Lambda Benchmark Architecture](https://lambda-benchmark.vercel.app/architecture.png)

## Features

- Benchmarks multiple Lambda runtimes:
  - Node.js (v18 and v22)
  - Python 3.11
  - .NET 8
  - Java 21
  - Go
  - Rust
- Tests both ARM64 and x86_64 architectures
- Automated performance testing with AWS Step Functions
- Metrics collection and storage in DynamoDB
- Regular benchmarking via CloudWatch Events (every 2 hours)

## Architecture

The project consists of several key components:

1. **Performance Test Functions**: Lambda functions implemented in different runtimes that perform standardized tests
2. **Metrics Collector**: A Lambda function that collects performance metrics from CloudWatch Logs
3. **Step Functions State Machine**: Orchestrates the benchmarking process
4. **DynamoDB Table**: Stores the collected performance metrics

## Prerequisites

- AWS CDK CLI
- Node.js 18 or later
- AWS CLI configured with appropriate credentials
- Docker (for building Lambda functions)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Deploy API key

```sh
aws secretsmanager \
  create-secret \
  --profile {AWS_PROFILE} \
  --name {STAGE}/lambda-performance-benchmark/api-key \
  --description 'API key for lambda-performance-benchmark API' \
  --secret-string 'some api key'
```

3. Deploy the infrastructure:
   ```bash
   cdk deploy
   ```

## Project Structure

```
.
├── infra/
│   ├── constructs/
│   │   ├── functions/
│   │   │   ├── metrics-collector/
│   │   │   └── performance-test/
│   │   ├── state-machines/
│   │   └── tables/
│   └── stacks/
└── src/
    └── functions/
        ├── metrics/
        └── performance-benchmark/
            ├── nodejs/
            ├── python/
            ├── dotnet/
            ├── java/
            ├── go/
            └── rust/
```

## How It Works

1. The Step Functions state machine triggers performance tests for each Lambda runtime
2. Each test function runs both cold and warm starts
3. After the tests complete, the metrics collector function:
   - Retrieves CloudWatch Logs
   - Analyzes performance metrics
   - Stores results in DynamoDB

## Results

The benchmark results are stored in DynamoDB and include:

- Cold start latency
- Warm start latency
- Memory usage
- CPU utilization
- Runtime-specific metrics
