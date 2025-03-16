.PHONY: build clean

build:
	GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap main.go

build-x86:
	GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap main.go

clean:
	rm -f bootstrap 