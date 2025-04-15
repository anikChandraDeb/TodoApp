// Handle Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("https://localhost:5217/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        alert("Login successful! Redirecting to dashboard...");
        window.location.href = "dashboard.html";
    } else {
        alert("Login failed. Please check your credentials.");
    }
});

// Handle Registration
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;

        try {
            const response = await fetch("https://localhost:5217/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                alert("Registration successful! Redirecting to login...");
                window.location.href = "index.html";
            } else {
                const error = await response.json();
                alert(error.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong. Please check your connection and try again.");
        }
    });
});

