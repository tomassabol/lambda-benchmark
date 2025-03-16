using Amazon.Lambda.RuntimeSupport;
using Amazon.Lambda.Serialization.SystemTextJson;
using PerformanceBenchmark;

var handler = new Function();
await LambdaBootstrapBuilder.Create(handler.Handler, new DefaultLambdaJsonSerializer())
    .Build()
    .RunAsync(); 