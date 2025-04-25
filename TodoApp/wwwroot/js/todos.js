// Token Check
const token = localStorage.getItem("token");
if (!token) {
    alert("You must log in first!");
    window.location.href = "index.html";
}

// Pagination setup
let currentPage = 1;
const todosPerPage = 7;
let allTodos = [];

// Fetch all Todos
const fetchTodos = async () => {
    try {
        const response = await fetch("https://localhost:5217/api/todos", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch todos");

        const todos = await response.json();
        allTodos = todos;
        renderTodos();
    } catch (error) {
        console.error("Error fetching todos:", error);
    }
};

// Render Todos with Pagination
const renderTodos = () => {
    const todoList = document.getElementById("todo-list");
    const totalPages = Math.ceil(allTodos.length / todosPerPage);
    const startIndex = (currentPage - 1) * todosPerPage;
    const endIndex = startIndex + todosPerPage;
    const todosToDisplay = allTodos.slice(startIndex, endIndex);

    // Generate table HTML
    let html = `
        <table class="table table-bordered table-hover table-striped">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    todosToDisplay.forEach((todo, index) => {
        html += `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td>${todo.title}</td>
                <td>${todo.description}</td>
                <td>
                    <span class="badge ${todo.isCompleted ? 'bg-success' : 'bg-warning'}">
                        ${todo.isCompleted ? "Completed" : "Pending"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${todo.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <nav>
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
                </li>
    `;

    // Fixed pagination logic: Show only 5 pages centered
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }

    html += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
                </li>
            </ul>
        </nav>
    `;

    todoList.innerHTML = html;
};

// Change Page
const changePage = (page) => {
    const totalPages = Math.ceil(allTodos.length / todosPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTodos();
    }
};

// Form Submission: Add or Update Todo
document.getElementById("add-todo-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("todo-id").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const isCompleted = document.getElementById("isCompleted").value === "true";

    const method = id ? "PUT" : "POST";
    const url = id
        ? `https://localhost:5217/api/todos/${id}`
        : "https://localhost:5217/api/todos";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ title, description, isCompleted }),
        });

        if (response.ok) {
            alert(id ? "Todo updated successfully!" : "Todo added successfully!");
            document.getElementById("add-todo-form").reset();
            fetchTodos();

            // Hide modal
            const addTodoModal = bootstrap.Modal.getInstance(document.getElementById("addTodoModal"));
            addTodoModal.hide();
        } else {
            throw new Error("Save failed");
        }
    } catch (error) {
        alert("Failed to save todo. Please try again.");
        console.error(error);
    }
});

// Delete Todo
const deleteTodo = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this todo?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`https://localhost:5217/api/todos/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            alert("Todo deleted successfully!");
            fetchTodos();
        } else {
            throw new Error("Delete failed");
        }
    } catch (error) {
        alert("Failed to delete todo. Please try again.");
        console.error(error);
    }
};

const searchTodos = async (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("search").value;
    try {
        const response = await fetch(`https://localhost:5217/api/todos/search?query=${searchTerm}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch todos");
        const todos = await response.json();
        allTodos = todos;
        renderTodos();
    } catch (error) {
        console.error("Error searching todos:", error);
    }
};

// Open Edit Modal with Todo Info
const openEditModal = async (id) => {
    try {
        const response = await fetch(`https://localhost:5217/api/todos/${id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch todo");

        const todo = await response.json();

        // Populate fields
        document.getElementById("todo-id").value = todo.id;
        document.getElementById("title").value = todo.title;
        document.getElementById("description").value = todo.description;
        document.getElementById("isCompleted").value = todo.isCompleted.toString();
        document.getElementById("addTodoModalLabel").textContent = "Edit Todo";

        // Show modal
        const addTodoModal = new bootstrap.Modal(document.getElementById("addTodoModal"));
        addTodoModal.show();
    } catch (error) {
        alert("Failed to load todo for editing.");
        console.error(error);
    }
};

// Initial fetch on load
fetchTodos();
