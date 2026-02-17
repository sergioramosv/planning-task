#!/bin/bash

# Script to create all 44 tasks in Firebase via MCP server

cd "$(dirname "$0")"

echo "📍 Building MCP server..."
cd mcp
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Failed to build MCP server"
  exit 1
fi

echo "✅ MCP built successfully"
echo ""
echo "🚀 Starting MCP server in background..."

# Start MCP server in background and capture its PID
node dist/index.js > /tmp/mcp_server.log 2>&1 &
MCP_PID=$!

# Wait for server to be ready
sleep 2

# Check if server started
if ! kill -0 $MCP_PID 2>/dev/null; then
  echo "❌ Failed to start MCP server"
  cat /tmp/mcp_server.log
  exit 1
fi

echo "✅ MCP Server started (PID: $MCP_PID)"
echo ""

# Go back to root directory
cd ..

echo "🚀 Creating 44 tasks in Firebase..."
echo ""

# Run the create tasks script
timeout 180 node create_tasks_real.js 2>&1

EXIT_CODE=$?

# Kill MCP server
kill $MCP_PID 2>/dev/null
wait $MCP_PID 2>/dev/null

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All tasks created successfully!"
else
  echo "❌ Script failed or timed out"
fi

exit $EXIT_CODE
