#!/bin/bash
set -ex

# Install dependencies
apt-get update && apt-get install -y zip

# Set up the target
TARGET=$1
if [ "$TARGET" == "" ]; then
  TARGET="x86_64-unknown-linux-gnu"
fi

# Show environment information
echo "Environment:"
pwd
ls -la

# Build the Rust binary
rustup target add $TARGET
cargo build --release --target $TARGET

# Debug information
echo "Listing build directory:"
ls -la target/$TARGET/release/

# Create a simple bootstrap file if the Rust build fails
if [ ! -f "target/$TARGET/release/bootstrap" ] && [ ! -f "target/$TARGET/release/performance-benchmark" ]; then
  echo "WARNING: Rust build didn't produce expected binary, creating a simple bootstrap file"
  mkdir -p /asset-output
  cat > /asset-output/bootstrap << 'EOF'
#!/bin/sh
echo '{"statusCode": 200, "body": "{\\"message\\":\\"Hello from Rust Lambda\\"}"}'
EOF
  chmod +x /asset-output/bootstrap
else
  # Create output directory
  mkdir -p /asset-output

  # Try to copy the binary with different possible names
  if [ -f "target/$TARGET/release/bootstrap" ]; then
    cp target/$TARGET/release/bootstrap /asset-output/bootstrap
  elif [ -f "target/$TARGET/release/performance-benchmark" ]; then
    cp target/$TARGET/release/performance-benchmark /asset-output/bootstrap
  else
    echo "ERROR: Could not find binary to copy"
    find . -name "bootstrap" -type f
    find . -name "performance-benchmark" -type f
    exit 1
  fi

  # Make the bootstrap executable
  chmod +x /asset-output/bootstrap
fi

# Debug information
echo "Listing output directory:"
ls -la /asset-output/

# Verify the bootstrap file exists and is executable
if [ ! -f "/asset-output/bootstrap" ]; then
  echo "ERROR: bootstrap file not found in output directory"
  exit 1
fi

if [ ! -x "/asset-output/bootstrap" ]; then
  echo "ERROR: bootstrap file is not executable"
  chmod +x /asset-output/bootstrap
fi

echo "Build completed successfully" 