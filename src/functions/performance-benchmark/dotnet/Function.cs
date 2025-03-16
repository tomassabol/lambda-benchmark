using Amazon.Lambda.Core;
using System.Text.Json;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace PerformanceBenchmark;

public class Function
{
    /// <summary>
    /// Lambda function handler
    /// </summary>
    public APIGatewayResponse Handler(object input, ILambdaContext context)
    {
        return new APIGatewayResponse
        {
            StatusCode = 200,
            Body = JsonSerializer.Serialize(new { message = "Hello, world!" }),
            Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
        };
    }
}

public class APIGatewayResponse
{
    public int StatusCode { get; set; }
    public required string Body { get; set; }
    public required Dictionary<string, string> Headers { get; set; }
} 