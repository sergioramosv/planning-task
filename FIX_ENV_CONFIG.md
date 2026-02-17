# How to Fix Your .env Configuration

You're getting this error:
```
Configuration validation failed:
  - FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set
  - FIREBASE_DATABASE_URL environment variable is not set
```

This is because your `.env` file has the JSON content directly instead of a path. **Here's how to fix it:**

## Option 1: Use the Path Method (EASIER)

### Step 1: Save the JSON as a file

Your .env file currently has this JSON:
```json
{
  "type": "service_account",
  "project_id": "planning-task",
  "private_key_id": "70039ea4739fdfe4ac9b13a2eb38af4a1cc04bc6",
  ...
}
```

**Save this to a file:**

1. Create a new file in the `mcp` directory
2. Name it: `serviceAccountKey.json`
3. Paste the JSON content into it
4. Save the file

### Step 2: Update your .env.local

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_DATABASE_URL=https://planning-task-default-rtdb.europe-west1.firebasedatabase.app
```

### Step 3: Rebuild and run

```bash
npm run build
npm start
```

✅ Should work now!

---

## Option 2: Use the JSON Content Method (If you don't want a separate file)

### Step 1: Update your .env.local

Copy your JSON content into one line:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"planning-task","private_key_id":"70039ea4739fdfe4ac9b13a2eb38af4a1cc04bc6",...entire JSON as one line...}
FIREBASE_DATABASE_URL=https://planning-task-default-rtdb.europe-west1.firebasedatabase.app
```

**Important:** The JSON must be on a single line with no newlines.

### Step 2: Rebuild and run

```bash
npm run build
npm start
```

✅ Should work now!

---

## Recommended Approach

**Option 1 is better because:**
- ✅ Cleaner and more organized
- ✅ Easier to troubleshoot
- ✅ Industry standard practice
- ✅ Safer (less chance of quotes breaking)
- ✅ Easier to update credentials later

---

## Verification Steps

After fixing, do this:

```bash
# 1. Check the config file exists
cat mcp/.env.local

# Should show:
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# FIREBASE_DATABASE_URL=https://...

# Or if using Option 2:
# FIREBASE_SERVICE_ACCOUNT_JSON={...json...}
# FIREBASE_DATABASE_URL=https://...

# 2. Rebuild
npm run build

# 3. Run
npm start

# Should see:
# Planning Task MCP Server initialized
# Available tools: list_tasks, get_task, create_task, update_task, delete_task
```

---

## Why This Happens

The system needs to know **where** to find your credentials:
- **Path method**: "Here's a file with my credentials" ✅
- **Content method**: "Here are my credentials as JSON" ✅ (updated support)
- **Wrong format**: Pasting JSON into the .env file directly ❌

---

## Which Option Did You Use?

If you're not sure:

1. **If your .env.local has a PATH like `./serviceAccountKey.json`:**
   → Use Option 1

2. **If your .env.local has the JSON content directly:**
   → Use Option 2

3. **If you don't have .env.local yet:**
   → Follow Option 1 (easiest)

---

## Still Having Issues?

Check:
1. ✅ File is named exactly `.env.local` (not `.env`)
2. ✅ File is in the `mcp` directory
3. ✅ Database URL is correct format (https://...firebaseio.com)
4. ✅ No typos in variable names
5. ✅ File was saved properly

Then try:
```bash
npm run build
npm start
```

If still stuck, read: `mcp/SETUP.md` or `MCP_SERVER_GUIDE.md`
