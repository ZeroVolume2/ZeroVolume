// ====== SIMPLE LOGIN SYSTEM ======
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

window.onload = function () {
    if (currentUser) {
        showApp();
    }
};

function login() {
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();

    const storedUser = localStorage.getItem("user_" + email);

    if (!storedUser) {
        document.getElementById("login-message").innerText = "Account not found. Please sign up.";
        return;
    }

    const user = JSON.parse(storedUser);

    if (user.password !== password) {
        document.getElementById("login-message").innerText = "Incorrect password.";
        return;
    }

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;

    document.getElementById("app-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

function showApp() {
    document.getElementById("welcome-message").innerText =
        "Welcome, " + currentUser.name + " (" + currentUser.email + ")";

    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";

    loadUserData();
}

function showSignup() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "block";
}

function showLogin() {
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

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

    const existingUser = localStorage.getItem("user_" + email);

    if (existingUser) {
        document.getElementById("signup-message").innerText = "An account with this email already exists.";
        return;
    }

    const user = {
        name: name,
        email: email,
        password: password
    };

    localStorage.setItem("user_" + email, JSON.stringify(user));

    document.getElementById("signup-message").style.color = "green";
    document.getElementById("signup-message").innerText = "Account created successfully. Please login.";

    document.getElementById("signup-name").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";

    setTimeout(() => {
        document.getElementById("signup-message").innerText = "";
        document.getElementById("signup-message").style.color = "";
        showLogin();
    }, 1000);
}

// ====== USER DATA (points + checkins) ======
function getUserKey(keyName) {
    return currentUser.email + "_" + keyName;
}

function loadUserData() {
    let points = localStorage.getItem(getUserKey("points"));
    if (points === null) points = 0;
    points = parseInt(points);

    let checkins = JSON.parse(localStorage.getItem(getUserKey("checkins"))) || {};

    updatePointsDisplay(points);

    window.userPoints = points;
    window.userCheckins = checkins;
}

function updatePointsDisplay(points) {
    document.getElementById("points-display").innerText = "Points: " + points;
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
            open: 8 * 60 + 30,   // 08:30 AM
            close: 24 * 60,      // 12:00 AM
            name: "Library",
            openText: "08:30 AM"
        },
        gym: {
            open: 7 * 60,        // 07:00 AM
            close: 20 * 60,      // 08:00 PM
            name: "Gym",
            openText: "07:00 AM"
        },
        student_union: {
            open: 9 * 60,        // 09:00 AM
            close: 17 * 60,      // 05:00 PM
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

    const today = new Date().toISOString().split("T")[0];

    if (window.userCheckins[location] === today) {
        message.innerText = "You have already checked in at this location today.";
        message.style.color = "red";
        return;
    }

    window.userPoints += 10;
    localStorage.setItem(getUserKey("points"), window.userPoints);

    window.userCheckins[location] = today;
    localStorage.setItem(getUserKey("checkins"), JSON.stringify(window.userCheckins));

    updatePointsDisplay(window.userPoints);

    message.innerText = "Successfully checked in at " + facility.name + "! +10 points earned.";
    message.style.color = "green";
}