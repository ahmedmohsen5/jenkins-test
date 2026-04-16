const crypto = require("node:crypto");

const tasks = [
  { id: 1, title: "Create CI pipeline", priority: "high", completed: false },
  { id: 2, title: "Write API tests", priority: "medium", completed: false },
];

let nextTaskId = 3;

function listTasks() {
  return tasks;
}

function createTask(input, signingSecret) {
  const newTask = {
    id: nextTaskId,
    title: input.title,
    priority: input.priority ?? "normal",
    completed: false,
  };

  const signature = crypto
    .createHmac("sha256", signingSecret)
    .update(`${newTask.id}:${newTask.title}:${newTask.priority}`)
    .digest("hex")
    .slice(0, 16);

  nextTaskId += 1;
  tasks.push(newTask);

  return { task: newTask, signature };
}

module.exports = {
  listTasks,
  createTask,
};
