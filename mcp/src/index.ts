import {
  initializeApp,
  getApps,
  cert,
  ServiceAccount,
} from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import * as readline from "readline";
import { config } from "./config.js";

// Validate configuration
config.validate();

// Initialize Firebase Admin
const serviceAccount = config.getServiceAccount() as ServiceAccount;

const apps = getApps();
if (apps.length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: config.firebaseDatabaseUrl,
  });
}

const db = getDatabase();

// Types
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

interface CreateTaskInput {
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
  status: "to-do" | "in-progress" | "to-validate" | "validated" | "done";
  createdBy: string;
}

// Calculate priority based on bizPoints and devPoints
function calculatePriority(bizPoints: number, devPoints: number): number {
  const bizWeight = 0.6;
  const devWeight = 0.4;
  const maxDevPoints = 13;

  const normalizedDevPoints = devPoints / maxDevPoints;
  const normalizedBizPoints = bizPoints / 100;

  return Math.round(
    (normalizedBizPoints * bizWeight + normalizedDevPoints * devWeight) * 100
  );
}

// MCP Tool implementations
async function listTasks(projectId: string): Promise<Task[]> {
  const tasksRef = db.ref("tasks");
  const snapshot = await tasksRef.get();

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  const tasks: Task[] = Object.entries(data)
    .filter(([_, task]: [string, any]) => task.projectId === projectId)
    .map(([id, task]: [string, any]) => ({
      id,
      ...task,
    }));

  return tasks.sort((a, b) => b.createdAt - a.createdAt);
}

async function getTask(taskId: string): Promise<Task | null> {
  const taskRef = db.ref(`tasks/${taskId}`);
  const snapshot = await taskRef.get();

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: taskId,
    ...snapshot.val(),
  };
}

async function createTask(taskData: CreateTaskInput): Promise<Task> {
  const taskId = db.ref("tasks").push().key;
  if (!taskId) {
    throw new Error("Failed to generate task ID");
  }

  const priority = calculatePriority(taskData.bizPoints, taskData.devPoints);
  const now = Date.now();

  const task: Task = {
    id: taskId,
    ...taskData,
    priority,
    createdAt: now,
    updatedAt: now,
    history: {},
  };

  await db.ref(`tasks/${taskId}`).set(task);
  return task;
}

async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task> {
  const task = await getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const updatedData: any = {
    ...updates,
    updatedAt: Date.now(),
  };

  // Recalculate priority if points changed
  if (updates.bizPoints || updates.devPoints) {
    const bizPoints = updates.bizPoints || task.bizPoints;
    const devPoints = updates.devPoints || task.devPoints;
    updatedData.priority = calculatePriority(bizPoints, devPoints);
  }

  await db.ref(`tasks/${taskId}`).update(updatedData);

  return {
    ...task,
    ...updatedData,
  };
}

async function deleteTask(taskId: string): Promise<void> {
  const task = await getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  await db.ref(`tasks/${taskId}`).remove();
}

// Tool definitions for MCP
const tools = [
    {
      name: "list_tasks",
      description: "List all tasks for a specific project",
      input_schema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "The project ID to list tasks for",
          },
        },
        required: ["projectId"],
      },
    },
    {
      name: "get_task",
      description: "Get details of a specific task",
      input_schema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The task ID",
          },
        },
        required: ["taskId"],
      },
    },
    {
      name: "create_task",
      description: "Create a new task",
      input_schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Task title",
          },
          projectId: {
            type: "string",
            description: "The project ID",
          },
          sprintId: {
            type: "string",
            description: "Optional sprint ID",
          },
          acceptanceCriteria: {
            type: "array",
            items: { type: "string" },
            description: "Acceptance criteria for the task",
          },
          userStory: {
            type: "object",
            properties: {
              who: { type: "string" },
              what: { type: "string" },
              why: { type: "string" },
            },
            required: ["who", "what", "why"],
            description: "User story in As a... I want... So that... format",
          },
          developer: {
            type: "string",
            description: "Developer ID assigned to this task",
          },
          startDate: {
            type: "string",
            description: "Start date (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date (YYYY-MM-DD), optional",
          },
          bizPoints: {
            type: "number",
            description: "Business points (1-100)",
          },
          devPoints: {
            type: "number",
            description: "Development points (Fibonacci: 1, 2, 3, 5, 8, 13)",
          },
          status: {
            type: "string",
            enum: ["to-do", "in-progress", "to-validate", "validated", "done"],
            description: "Task status",
          },
          createdBy: {
            type: "string",
            description: "User ID of the creator",
          },
        },
        required: [
          "title",
          "projectId",
          "acceptanceCriteria",
          "userStory",
          "developer",
          "startDate",
          "bizPoints",
          "devPoints",
          "status",
          "createdBy",
        ],
      },
    },
    {
      name: "update_task",
      description: "Update an existing task",
      input_schema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The task ID to update",
          },
          title: {
            type: "string",
            description: "Task title",
          },
          status: {
            type: "string",
            enum: ["to-do", "in-progress", "to-validate", "validated", "done"],
            description: "Task status",
          },
          sprintId: {
            type: "string",
            description: "Sprint ID",
          },
          developer: {
            type: "string",
            description: "Developer ID",
          },
          bizPoints: {
            type: "number",
            description: "Business points (1-100)",
          },
          devPoints: {
            type: "number",
            description: "Development points (Fibonacci)",
          },
          endDate: {
            type: "string",
            description: "End date (YYYY-MM-DD)",
          },
          acceptanceCriteria: {
            type: "array",
            items: { type: "string" },
            description: "Acceptance criteria",
          },
        },
        required: ["taskId"],
      },
    },
    {
      name: "delete_task",
      description: "Delete a task",
      input_schema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The task ID to delete",
          },
        },
        required: ["taskId"],
      },
    },
];

// Process tool calls
async function processToolCall(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    try {
      switch (toolName) {
        case "list_tasks": {
          const tasks = await listTasks(toolInput.projectId);
          return JSON.stringify(tasks);
        }
        case "get_task": {
          const task = await getTask(toolInput.taskId);
          return JSON.stringify(task);
        }
        case "create_task": {
          const task = await createTask(toolInput as CreateTaskInput);
          return JSON.stringify(task);
        }
        case "update_task": {
          const task = await updateTask(toolInput.taskId, toolInput as Partial<Task>);
          return JSON.stringify(task);
        }
        case "delete_task": {
          await deleteTask(toolInput.taskId);
          return JSON.stringify({ success: true, taskId: toolInput.taskId });
        }
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return JSON.stringify({ error: String(error) });
    }
}

// Main MCP server
async function main() {
  console.error("Planning Task MCP Server initialized");
  console.error("Available tools:", tools.map((t) => t.name).join(", "));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", async (line) => {
    if (!line.trim()) return;

    try {
      const request = JSON.parse(line);

      // Handle different request types
      if (request.method === "tools/list") {
        process.stdout.write(JSON.stringify({ tools }) + "\n");
      } else if (request.method === "tools/call") {
        const result = await processToolCall(
          request.params.name,
          request.params.arguments
        );
        process.stdout.write(JSON.stringify({ result }) + "\n");
      } else if (request.method === "initialize") {
        process.stdout.write(
          JSON.stringify({ capabilities: { tools: true } }) + "\n"
        );
      } else {
        process.stdout.write(
          JSON.stringify({ error: `Unknown method: ${request.method}` }) + "\n"
        );
      }
    } catch (error) {
      process.stdout.write(
        JSON.stringify({ error: String(error) }) + "\n"
      );
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
