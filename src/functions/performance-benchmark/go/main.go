package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/lambda"
)

// Response is the structure for the Lambda response
type Response struct {
	StatusCode int               `json:"statusCode"`
	Body       string            `json:"body"`
	Headers    map[string]string `json:"headers,omitempty"`
}

// Message is the structure for the response body
type Message struct {
	Message string `json:"message"`
}

// Handler is the Lambda handler function
func Handler(ctx context.Context) (Response, error) {
	// Create the message
	msg := Message{
		Message: "Hello, world!",
	}

	// Convert the message to JSON
	body, err := json.Marshal(msg)
	if err != nil {
		return Response{StatusCode: 500}, err
	}

	// Return the response
	return Response{
		StatusCode: 200,
		Body:       string(body),
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}, nil
}

func main() {
	lambda.Start(Handler)
} 