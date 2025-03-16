use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize)]
struct Response {
    status_code: u16,
    headers: Value,
    body: String,
}

#[derive(Deserialize)]
struct Request {}

async fn function_handler(_event: LambdaEvent<Request>) -> Result<Response, Error> {
    let response = Response {
        status_code: 200,
        headers: json!({
            "Content-Type": "application/json"
        }),
        body: json!({
            "message": "Hello, world!"
        }).to_string(),
    };

    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    let func = service_fn(function_handler);
    lambda_runtime::run(func).await?;
    Ok(())
} 