# Quick Setup Guide for Planning Task MCP

## What is this?

The Planning Task MCP is a Model Context Protocol server that allows Claude to directly interact with your Planning Task application through Firebase. You can ask Claude to create, read, update, and delete tasks programmatically.

## Step 1: Get Firebase Credentials

1. Open [Firebase Console](https://console.firebase.google.com)
2. Click on your project
3. Click on **Project Settings** (gear icon)
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download - save it somewhere safe

**Also:** Copy your **Realtime Database URL** from the Realtime Database section

## Step 2: Configure Environment

In the `mcp` directory, create a file named `.env.local`:

### Option A: Using a File (RECOMMENDED)

1. Save the Firebase service account JSON as `mcp/serviceAccountKey.json`
2. Create `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Option B: Pasting JSON Content (Alternative)

If you prefer not to create a separate file, copy the entire JSON content:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...entire JSON here..."}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Note:** Remove newlines from the JSON to make it a single line, or the system will handle multiline automatically.

## Step 3: Install Dependencies

```bash
cd mcp
npm install
```

## Step 4: Build the Server

```bash
npm run build
```

You should see the TypeScript compile successfully with no errors.

## Step 5: Run the Server

```bash
npm start
```

You should see:
```
Planning Task MCP Server initialized
Available tools: list_tasks, get_task, create_task, update_task, delete_task
```

If you see an error, check the Troubleshooting section below.

## Step 6: Integrate with Claude (Optional)

See [MCP_SERVER_GUIDE.md](../MCP_SERVER_GUIDE.md) for integration instructions.

## Troubleshooting

### Error: `Configuration validation failed`

This means the .env.local file is missing or incomplete.

**Solution:**
```bash
# Verify the file exists
cat .env.local

# Should show both variables:
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# FIREBASE_DATABASE_URL=https://...
```

### Error: `Failed to read service account from ./serviceAccountKey.json`

The file path is wrong.

**Solution:**
```bash
# Check the file exists
ls -la ./serviceAccountKey.json

# If not found, make sure:
# 1. The file was saved in the correct directory (mcp/)
# 2. The filename matches exactly (serviceAccountKey.json)
# 3. The path in .env.local is correct
```

### Error: `Cannot connect to database`

Your database URL is wrong or Firebase isn't responding.

**Solution:**
1. Check the URL format: `https://your-project.firebaseio.com` (no trailing slash)
2. Copy it again from Firebase Console → Realtime Database
3. Check internet connection
4. Check that Realtime Database is enabled in Firebase

### Error: `Failed to authenticate with Firebase`

Your credentials are invalid or expired.

**Solution:**
1. Go back to Firebase Console
2. Generate a NEW private key (don't reuse the old one)
3. Replace the file or JSON content in .env.local
4. Try again

### Environment variables not loading from .env file

Make sure you're using `.env.local` (not `.env`).

**Solution:**
```bash
# Should be this:
ls -la mcp/.env.local

# NOT this:
ls -la mcp/.env
```

## Verification

Test that everything works:

```bash
# The server should stay running without errors
npm start

# In another terminal, press Ctrl+C after a few seconds
# If no errors appear, you're good!
```

## Success Criteria

✅ You know this works when:
1. `npm run build` finishes with no errors
2. `npm start` shows "Planning Task MCP Server initialized"
3. No error messages appear in the console
4. You can press Ctrl+C to stop it gracefully

## Next Steps

1. **Short Path:** Ask Claude to create a test task
2. **Complete Path:** Read [MCP_SERVER_GUIDE.md](../MCP_SERVER_GUIDE.md) for integration guide

## Need Help?

- **Setup issues:** Check Troubleshooting above
- **Technical questions:** See [README.md](./README.md)
- **Full guide:** See [MCP_SERVER_GUIDE.md](../MCP_SERVER_GUIDE.md)
- **Setup checklist:** See [CHECKLIST.md](./CHECKLIST.md)
