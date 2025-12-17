// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);

const taskInput = $("#taskInput");
const addBtn = $("#addBtn");
const tasksList = $("#tasksList");
const tasksCount = $("#tasksCount");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = $("#clearCompletedBtn");

const STORAGE_KEY = "todo_tasks_v1";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
// task = { id, text, completed }

let currentFilter = "all";

// ---------- Storage ----------
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Rendering ----------
function renderTasks() {
  const filtered = tasks.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  tasksList.innerHTML = "";

  if (filtered.length === 0) {
    tasksList.innerHTML =
      '<li class="empty">No tasks here. Add something!</li>';
  } else {
    filtered.forEach((task) => {


      const li = document.createElement("li");
      li.className = "task-item";
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-check" ${
            task.completed ? "checked" : ""
          } />
          <span class="task-text ${
            task.completed ? "completed" : ""
          }">${escapeHtml(task.text)}</span>
        </div>
        <div class="task-actions">
          <button class="icon-btn edit-btn">Edit</button>
          <button class="icon-btn delete-btn">Delete</button>
        </div>
      `;

      tasksList.appendChild(li);
    });
  }

  const remaining = tasks.filter((t) => !t.completed).length;
  tasksCount.textContent =
    tasks.length === 0
      ? "No tasks"
      : `${remaining} of ${tasks.length} left`;

  saveTasks();
}

// Simple HTML escape so text doesn’t break layout
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch];
  });
}

// ---------- Add Task ----------
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now().toString(),
    text,
    completed: false,
  });

  taskInput.value = "";
  renderTasks();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// ---------- Task actions (event delegation) ----------
tasksList.addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = li.dataset.id;
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  // Toggle complete
  if (e.target.classList.contains("task-check")) {
    task.completed = e.target.checked;
    renderTasks();
    return;
  }

  // Edit
  if (e.target.classList.contains("edit-btn")) {
    const newText = prompt("Edit task:", task.text);
    if (newText !== null) {
      task.text = newText.trim() || task.text;
      renderTasks();
    }
    return;
  }

  // Delete
  if (e.target.classList.contains("delete-btn")) {
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
    return;
  }
});

// ---------- Filters ----------
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ---------- Clear completed ----------
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  renderTasks();
});

// ---------- Initial render ----------
renderTasks();
