# Planning Task MCP Server - Setup Checklist

## Pre-Setup (5 minutes)

### Get Firebase Credentials
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Select your project
- [ ] Go to **Project Settings** (⚙️ icon)
- [ ] Click on **Service Accounts** tab
- [ ] Click **Generate New Private Key**
- [ ] Save the JSON file as: `mcp/serviceAccountKey.json`
- [ ] Go to **Realtime Database**
- [ ] Copy the database URL from the top of the page
  - Format: `https://your-project.firebaseio.com`

## Setup (5 minutes)

### Create Configuration File
- [ ] Navigate to the `mcp` directory
- [ ] Copy `.env.local.example` to `.env.local`
  ```bash
  cp .env.local.example .env.local
  ```
- [ ] Edit `.env.local` with your paths:
  ```
  FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
  FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
  ```
- [ ] Verify the service account JSON file exists

### Install Dependencies
- [ ] Run `npm install` in the `mcp` directory
- [ ] Verify no errors during installation

### Build the Server
- [ ] Run `npm run build`
- [ ] Verify TypeScript compiles without errors
- [ ] Check that `dist/` directory was created
- [ ] Verify `dist/index.js` exists

## Verify Installation (2 minutes)

### Start the Server
- [ ] Run `npm start` in the `mcp` directory
- [ ] You should see:
  ```
  Planning Task MCP Server initialized
  Available tools: list_tasks, get_task, create_task, update_task, delete_task
  ```

### Test Basic Connection
- [ ] Server started without errors
- [ ] No error messages in console
- [ ] Process is running (shows process ID)

### Stop the Server
- [ ] Press `Ctrl+C` to stop
- [ ] Server exits cleanly

## Integration with Claude

### Configure Claude Client
- [ ] Find the compiled server path: `/absolute/path/to/mcp/dist/index.js`
- [ ] Add to your Claude configuration:
  ```json
  {
    "mcpServers": {
      "planning-task": {
        "command": "node",
        "args": ["/path/to/mcp/dist/index.js"],
        "env": {
          "FIREBASE_SERVICE_ACCOUNT_PATH": "/path/to/serviceAccountKey.json",
          "FIREBASE_DATABASE_URL": "https://your-project.firebaseio.com"
        }
      }
    }
  }
  ```
- [ ] Save configuration
- [ ] Restart Claude client
- [ ] Verify MCP server appears in tools list

## Testing the Server (5 minutes)

### Test List Tasks
- [ ] Ask Claude: "List all tasks in project `your-project-id`"
- [ ] Verify Claude returns task list (or empty list if none exist)

### Test Create Task
- [ ] Ask Claude: "Create a task in project `your-project-id` with title 'Test Task'"
- [ ] Provide required fields when prompted
- [ ] Verify task is created successfully

### Test Get Task
- [ ] Ask Claude: "Get details of task `task-id`"
- [ ] Verify task details are returned

### Test Update Task
- [ ] Ask Claude: "Update task `task-id` to status 'in-progress'"
- [ ] Verify task status is updated

### Test Delete Task
- [ ] Ask Claude: "Delete task `task-id`"
- [ ] Verify task is deleted

## Troubleshooting

### If Server Won't Start

**Check Configuration**
- [ ] `.env.local` file exists
- [ ] Both variables are set with correct paths
- [ ] Service account JSON file exists at the path specified
- [ ] Database URL format is correct (https://...firebaseio.com)

**Check Firebase Credentials**
- [ ] Service account JSON is valid JSON (no syntax errors)
- [ ] Service account has database permissions
- [ ] Firebase project has Realtime Database enabled

**Check Node.js**
- [ ] Node.js version 18+ installed
- [ ] `npm` works: `npm --version`

### If Server Starts But Doesn't Work

**Check Logs**
- [ ] Watch the console output for error messages
- [ ] Check stderr for detailed error information

**Check Firebase Console**
- [ ] Project exists and is accessible
- [ ] Realtime Database is enabled
- [ ] Your account has read/write permissions

**Check Network**
- [ ] Internet connection is working
- [ ] Firewall allows outbound HTTPS (port 443)

### If Claude Can't Access the Tools

**Check MCP Server is Running**
- [ ] Manual test: `npm start` produces no errors
- [ ] Server stays running (doesn't exit immediately)

**Check Claude Configuration**
- [ ] Path to `dist/index.js` is correct and absolute
- [ ] Environment variables are set correctly
- [ ] Claude client restarted after configuration change

**Check Tool Availability**
- [ ] Ask Claude: "What tools do you have available?"
- [ ] Should list: list_tasks, get_task, create_task, update_task, delete_task

## Success Criteria

✅ All items in sections below should be checked:

### Installation Complete When:
- [ ] `npm install` finished without errors
- [ ] `npm run build` finished without errors
- [ ] `npm start` shows initialization message
- [ ] No errors in console

### Integration Complete When:
- [ ] Claude recognizes the 5 MCP tools
- [ ] Can list tasks from a project
- [ ] Can create a test task successfully
- [ ] Can update and delete tasks

## Maintenance

### Regular Tasks
- [ ] Keep Firebase credentials secure
- [ ] Do NOT commit `serviceAccountKey.json`
- [ ] Do NOT commit `.env.local`
- [ ] Check `.gitignore` includes these files

### Updates
- [ ] Check for MCP server updates periodically
- [ ] Review Firebase Admin SDK updates
- [ ] Keep Node.js up to date

## Support

### Documentation Files
- `SETUP.md` - Quick start guide
- `README.md` - Technical documentation
- `IMPLEMENTATION_COMPLETE.md` - Implementation details
- `../MCP_SERVER_GUIDE.md` - Master guide

### Common Questions
- **How do I update a task?** See README.md > update_task tool
- **What fields are required?** See README.md > Tool Definitions
- **How is priority calculated?** See MCP_SERVER_GUIDE.md > Priority Calculation
- **How do I integrate with Claude?** See MCP_SERVER_GUIDE.md > Integration

## Completion

Once all items are checked, your MCP server is:
- ✅ Installed and configured
- ✅ Running and verified
- ✅ Integrated with Claude
- ✅ Ready for production use

**You're done!** 🎉 Start using your Planning Task MCP Server!
