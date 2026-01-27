#!/bin/bash

# Build script for render server
# This script prepares the render server with necessary Remotion files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RENDER_SERVER_DIR="$PROJECT_ROOT/render-server"

echo "Building render server..."

# Create src directory in render-server
mkdir -p "$RENDER_SERVER_DIR/src/remotion"
mkdir -p "$RENDER_SERVER_DIR/src/types"

# Copy remotion source files
cp -r "$PROJECT_ROOT/src/remotion/"* "$RENDER_SERVER_DIR/src/remotion/"
cp -r "$PROJECT_ROOT/src/types/"* "$RENDER_SERVER_DIR/src/types/"

# Copy tsconfig for path resolution
cat > "$RENDER_SERVER_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
EOF

# Install dependencies
cd "$RENDER_SERVER_DIR"
npm install

echo "Render server build complete!"
echo ""
echo "To run locally:"
echo "  cd render-server && npm start"
echo ""
echo "To build Docker image:"
echo "  cd render-server && docker build -t dev-flashback-render ."
