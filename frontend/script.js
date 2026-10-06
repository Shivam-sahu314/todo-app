const API_URL = "http://localhost:3000/todos";

let allTodos = [];
let currentFilter = "all";

async function getTodos() {
    const response = await fetch(API_URL);
    allTodos = await response.json();

    updateStats();
    displayTodos();
}

function updateStats() {
    const total = allTodos.length;

    const completed = allTodos.filter(todo => {
        return todo.completed;
    }).length;

    const pending = total - completed;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completedCount").textContent = completed;
}

function displayTodos() {
    const todoList = document.getElementById("todoList");
    const emptyMessage = document.getElementById("emptyMessage");

    todoList.innerHTML = "";

    let filteredTodos = allTodos;

    if (currentFilter === "pending") {
        filteredTodos = allTodos.filter(todo => {
            return !todo.completed;
        });
    }

    if (currentFilter === "completed") {
        filteredTodos = allTodos.filter(todo => {
            return todo.completed;
        });
    }

    if (filteredTodos.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    filteredTodos.forEach(todo => {
        const li = document.createElement("li");

        li.innerHTML = `
            <span class="${todo.completed ? "completed" : ""}">
                ${todo.title}
            </span>

            <div class="buttons">
                <button onclick="completeTodo('${todo._id}', ${todo.completed})">
                    ${todo.completed ? "Undo" : "Done"}
                </button>

                <button onclick="editTodo('${todo._id}')">
                    Edit
                </button>

                <button onclick="deleteTodo('${todo._id}')">
                    Delete
                </button>
            </div>
        `;

        todoList.appendChild(li);
    });
}

async function addTodo() {
    const input = document.getElementById("todoInput");

    const title = input.value.trim();

    if (title === "") {
        alert("Please enter a task");
        return;
    }

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title
        })
    });

    input.value = "";

    getTodos();
}

async function completeTodo(id, currentStatus) {
    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: !currentStatus
        })
    });

    getTodos();
}

async function editTodo(id) {
    const newTitle = prompt("Enter new task:");

    if (newTitle === null) {
        return;
    }

    const title = newTitle.trim();

    if (title === "") {
        alert("Task cannot be empty");
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title
        })
    });

    getTodos();
}

async function deleteTodo(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    getTodos();
}

function filterTodos(filter) {
    currentFilter = filter;
    displayTodos();
}

getTodos();