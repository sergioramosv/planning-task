# Planning Task MCP Server

This is a Model Context Protocol (MCP) server that provides tools to manage tasks in the Planning Task application via Firebase Realtime Database.

## Setup

### 1. Install Dependencies

```bash
cd mcp
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key** and save the JSON file
5. Copy the path to this file and note it

6. In Firebase Console, go to **Realtime Database** and copy the database URL (e.g., `https://your-project.firebaseio.com`)

### 3. Set Environment Variables

Create a `.env` file in the `mcp` directory:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

Alternatively, set these as environment variables before running the server:

```bash
export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
export FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Run the server
npm start
```

The server will output initialization messages to stderr and accept JSON requests on stdin.

## MCP Tools

The server exposes the following tools:

### `list_tasks`
List all tasks for a specific project.

**Parameters:**
- `projectId` (string, required): The project ID to list tasks for

**Returns:** Array of Task objects

### `get_task`
Get details of a specific task.

**Parameters:**
- `taskId` (string, required): The task ID

**Returns:** Task object or null if not found

### `create_task`
Create a new task.

**Parameters:**
- `title` (string, required): Task title
- `projectId` (string, required): The project ID
- `sprintId` (string, optional): Sprint ID
- `acceptanceCriteria` (array of strings, required): Acceptance criteria
- `userStory` (object, required): User story with `who`, `what`, `why`
- `developer` (string, required): Developer ID
- `startDate` (string, required): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)
- `bizPoints` (number, required): Business points (1-100)
- `devPoints` (number, required): Development points (1, 2, 3, 5, 8, or 13)
- `status` (string, required): Task status (to-do, in-progress, to-validate, validated, done)
- `createdBy` (string, required): User ID of the creator

**Returns:** Created Task object with priority calculated

### `update_task`
Update an existing task.

**Parameters:**
- `taskId` (string, required): The task ID to update
- `title` (string, optional): Task title
- `status` (string, optional): Task status
- `sprintId` (string, optional): Sprint ID
- `developer` (string, optional): Developer ID
- `bizPoints` (number, optional): Business points
- `devPoints` (number, optional): Development points
- `endDate` (string, optional): End date
- `acceptanceCriteria` (array of strings, optional): Acceptance criteria

**Returns:** Updated Task object

### `delete_task`
Delete a task.

**Parameters:**
- `taskId` (string, required): The task ID to delete

**Returns:** Confirmation object with success status

## Integration with Claude

To use this MCP server with Claude, add it to your Claude client configuration:

```json
{
  "mcpServers": {
    "planning-task": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/dist/index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "/path/to/serviceAccountKey.json",
        "FIREBASE_DATABASE_URL": "https://your-project.firebaseio.com"
      }
    }
  }
}
```

## Development

To run in development mode with TypeScript directly:

```bash
npm run dev
```

This requires `ts-node` to be installed globally or as a dev dependency.

## Task Priority Calculation

Task priority is automatically calculated based on:
- Business Points (60% weight): Normalized to 0-100 scale
- Development Points (40% weight): Normalized based on Fibonacci scale (max 13)

Formula:
```
priority = ((bizPoints/100) * 0.6 + (devPoints/13) * 0.4) * 100
```

Result is rounded to the nearest integer (0-100 scale).

## Error Handling

All errors are returned as JSON objects with an `error` field:

```json
{
  "error": "Task not found"
}
```

Check stderr logs for detailed error information during development.
