# Planning Task MCP Server - Complete Guide

Your Planning Task MCP server is now fully implemented and ready to use! 🎉

## Overview

The MCP (Model Context Protocol) Server allows Claude and other AI models to directly interact with your Planning Task application through Firebase. You can create, read, update, and delete tasks programmatically.

## Directory Structure

```
mcp/
├── src/
│   ├── index.ts          # Main MCP server implementation
│   └── config.ts         # Configuration loader
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Template for environment variables
├── README.md             # Technical documentation
├── SETUP.md              # Quick setup guide
└── IMPLEMENTATION_COMPLETE.md  # Implementation summary
```

## Quick Start (5 Minutes)

### 1. Prepare Firebase Credentials

You need two things from Firebase Console:

**Get Service Account Key:**
1. Go to https://console.firebase.google.com
2. Select your project
3. ⚙️ Project Settings → Service Accounts → Generate New Private Key
4. Save the JSON file to: `mcp/serviceAccountKey.json`

**Get Database URL:**
1. Realtime Database → Copy the URL (top of the page)
2. It looks like: `https://your-project.firebaseio.com`

### 2. Configure Environment

Create `mcp/.env.local`:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Install & Run

```bash
cd mcp

# Install dependencies (one time)
npm install

# Build TypeScript
npm run build

# Start the server
npm start
```

You should see:
```
Planning Task MCP Server initialized
Available tools: list_tasks, get_task, create_task, update_task, delete_task
```

Press `Ctrl+C` to stop.

## Available MCP Tools

### 1. List Tasks
Get all tasks for a project.

```typescript
list_tasks(projectId: string): Promise<Task[]>
```

**Example:**
```json
{"method":"tools/call","params":{"name":"list_tasks","arguments":{"projectId":"proj-123"}}}
```

### 2. Get Task
Get details of a specific task.

```typescript
get_task(taskId: string): Promise<Task | null>
```

**Example:**
```json
{"method":"tools/call","params":{"name":"get_task","arguments":{"taskId":"task-456"}}}
```

### 3. Create Task
Create a new task with full details.

```typescript
create_task(input: CreateTaskInput): Promise<Task>
```

**Required Fields:**
- `title`: string
- `projectId`: string
- `acceptanceCriteria`: string[]
- `userStory`: { who: string, what: string, why: string }
- `developer`: string
- `startDate`: string (YYYY-MM-DD)
- `bizPoints`: number (1-100)
- `devPoints`: number (1, 2, 3, 5, 8, or 13)
- `status`: "to-do" | "in-progress" | "to-validate" | "validated" | "done"
- `createdBy`: string (user ID)

**Optional Fields:**
- `sprintId`: string
- `endDate`: string (YYYY-MM-DD)

### 4. Update Task
Update an existing task.

```typescript
update_task(taskId: string, updates: Partial<Task>): Promise<Task>
```

**Can update any of these fields:**
- title, status, sprintId, developer
- bizPoints, devPoints (priority will be recalculated)
- endDate, acceptanceCriteria

### 5. Delete Task
Delete a task.

```typescript
delete_task(taskId: string): Promise<void>
```

## Priority Calculation

Task priority is automatically calculated when creating or updating tasks:

```
Priority = ((bizPoints/100) * 0.6 + (devPoints/13) * 0.4) * 100
```

- **Business Points Weight**: 60%
- **Development Points Weight**: 40%
- **Result**: 0-100 scale

**Examples:**
- bizPoints=100, devPoints=13 → priority = 100
- bizPoints=50, devPoints=8 → priority = 65
- bizPoints=25, devPoints=3 → priority = 27

## Integration with Claude

To use with Claude or other AI clients, configure it in your settings:

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

## Error Handling

All errors are returned as JSON:

```json
{
  "error": "Task not found"
}
```

Common errors:
- `FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set`
- `Task {taskId} not found`
- `Failed to generate task ID`

Check the server console (stderr) for detailed error information.

## Troubleshooting

### Error: Configuration validation failed

**Solution**: Check that `.env.local` or `.env` exists and has valid values:
```bash
cat mcp/.env.local
# Should show your paths
```

### Error: Cannot read service account file

**Solution**: Verify the path exists:
```bash
ls -la "path/to/serviceAccountKey.json"
```

### Error: Database URL is invalid

**Solution**: Get the correct URL from Firebase Console:
1. Realtime Database → Copy URL from top of page
2. Should start with `https://` and end with `.firebaseio.com`

### Server exits immediately

**Solution**: Check your Firebase credentials:
1. Service account key file is valid JSON
2. Private key is not corrupted
3. Account has database permissions

## Development

### Run with Hot Reload

```bash
npm run dev
```

Requires `ts-node` to be installed.

### Build Only

```bash
npm run build
```

Output goes to `dist/` directory.

## Task Data Structure

```typescript
interface Task {
  id: string;
  title: string;
  projectId: string;
  sprintId?: string;
  acceptanceCriteria: string[];
  userStory: {
    who: string;
    what: string;
    why: string;
  };
  developer: string;
  startDate: string;
  endDate?: string;
  bizPoints: number;
  devPoints: 1 | 2 | 3 | 5 | 8 | 13;
  priority: number;
  status: "to-do" | "in-progress" | "to-validate" | "validated" | "done";
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  history: Record<string, any>;
}
```

## Next Steps

1. ✅ **Setup** - Complete the SETUP.md guide
2. ✅ **Test** - Run `npm start` and verify it connects
3. ✅ **Integrate** - Add to your Claude configuration
4. ✅ **Use** - Start managing tasks with Claude!

## Getting Help

- 📖 Read [mcp/SETUP.md](./mcp/SETUP.md) for setup issues
- 📖 Read [mcp/README.md](./mcp/README.md) for technical details
- 🔍 Check server logs (stderr output)
- 🔑 Verify Firebase credentials in Console
- 🌐 Check internet connectivity

## What This Enables

With this MCP server, you can:

✅ Ask Claude to create tasks from conversations
✅ Query tasks programmatically
✅ Update task status and details
✅ Delete tasks
✅ Build automation around task management
✅ Integrate with other AI workflows

---

**Status**: ✅ Ready for production

Enjoy your new Planning Task MCP Server! 🚀
