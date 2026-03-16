// ====== CURRENT USER SESSION ======
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

window.onload = function () {
    if (currentUser) {
        showApp();
    }
};

// ====== LOGIN ======
function login() {
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();

    fetch("login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            university_email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            document.getElementById("login-message").innerText = data.message;
            return;
        }

        currentUser = data.user;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        showApp();
    })
    .catch(error => {
        document.getElementById("login-message").innerText = "Login failed. Please try again.";
        console.error(error);
    });
}

// ====== LOGOUT ======
function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;

    document.getElementById("app-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

// ====== SHOW APP ======
function showApp() {
    document.getElementById("welcome-message").innerText =
        "Welcome, " + currentUser.name + " (" + currentUser.email + ")";

    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";

    updatePointsDisplay(currentUser.points);
    loadEvents();
}

// ====== SHOW SIGNUP / LOGIN ======
function showSignup() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "block";
}

function showLogin() {
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

// ====== SIGNUP ======
function signup() {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (name.length < 2) {
        document.getElementById("signup-message").innerText = "Enter your full name.";
        return;
    }

    if (!email.includes("@")) {
        document.getElementById("signup-message").innerText = "Enter a valid university email.";
        return;
    }

    if (password.length < 4) {
        document.getElementById("signup-message").innerText = "Password must be at least 4 characters.";
        return;
    }

    fetch("signup.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            full_name: name,
            university_email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            document.getElementById("signup-message").style.color = "red";
            document.getElementById("signup-message").innerText = data.message;
            return;
        }

        document.getElementById("signup-message").style.color = "green";
        document.getElementById("signup-message").innerText = data.message;

        document.getElementById("signup-name").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-password").value = "";

        setTimeout(() => {
            document.getElementById("signup-message").innerText = "";
            showLogin();
        }, 1000);
    })
    .catch(error => {
        document.getElementById("signup-message").style.color = "red";
        document.getElementById("signup-message").innerText = "Signup failed. Please try again.";
        console.error(error);
    });
}

// ====== UPDATE POINTS ======
function updatePointsDisplay(points) {
    document.getElementById("points-display").innerText = "Points: " + points;
}

// ====== LOAD EVENTS FROM DATABASE ======
function loadEvents() {
    fetch("events.php")
    .then(response => response.json())
    .then(data => {
        const eventsList = document.getElementById("events-list");
        eventsList.innerHTML = "";

        if (!Array.isArray(data)) {
            eventsList.innerHTML = "<li>Unable to load events.</li>";
            return;
        }

        data.forEach(event => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${event.event_title}</strong> - ${event.event_location} - ${event.event_time}`;
            eventsList.appendChild(li);
        });
    })
    .catch(error => {
        console.error(error);
        document.getElementById("events-list").innerHTML = "<li>Failed to load events.</li>";
    });
}

// ====== CHECK-IN LOGIC ======
function checkIn(location) {
    const message = document.getElementById("checkin-message");

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    const facilityTimes = {
        library: {
            open: 8 * 60 + 30,
            close: 24 * 60,
            name: "Library",
            openText: "08:30 AM"
        },
        gym: {
            open: 7 * 60,
            close: 20 * 60,
            name: "Gym",
            openText: "07:00 AM"
        },
        student_union: {
            open: 9 * 60,
            close: 17 * 60,
            name: "Student Union",
            openText: "09:00 AM"
        }
    };

    const facility = facilityTimes[location];

    if (currentTime < facility.open) {
        message.innerText = facility.name + " opens at " + facility.openText + ". Check-in unavailable.";
        message.style.color = "red";
        return;
    }

    if (currentTime >= facility.close) {
        message.innerText = facility.name + " is closed. Check-in unavailable.";
        message.style.color = "red";
        return;
    }

    fetch("checkin.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: currentUser.user_id,
            location_name: location
        })
    })
    .then(response => response.json())
    .then(data => {
        message.innerText = data.message;
        message.style.color = data.success ? "green" : "red";

        if (data.success) {
            currentUser.points = data.points;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            updatePointsDisplay(currentUser.points);
        }
    })
    .catch(error => {
        message.innerText = "Check-in failed. Please try again.";
        message.style.color = "red";
        console.error(error);
    });
}