// ====== SIMPLE LOGIN SYSTEM ======
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

window.onload = function () {
    if (currentUser) {
        showApp();
    }
};

function login() {
    const name = document.getElementById("name-input").value.trim();
    const email = document.getElementById("email-input").value.trim();

    if (name.length < 2) {
        document.getElementById("login-message").innerText = "Please enter a valid name.";
        return;
    }

    if (!email.includes("@")) {
        document.getElementById("login-message").innerText = "Please enter a valid university email address.";
        return;
    }

    currentUser = {
        name: name,
        email: email
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;

    document.getElementById("app-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

function showApp() {
    document.getElementById("welcome-message").innerText =
        "Welcome, " + currentUser.name + " (" + currentUser.email + ")";

    document.getElementById("login-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";

    loadUserData();
}

// ====== USER DATA (points + checkins) ======
function getUserKey(keyName) {
    return currentUser.name + "_" + keyName;
}

function loadUserData() {
    // Load points
    let points = localStorage.getItem(getUserKey("points"));
    if (points === null) points = 0;
    points = parseInt(points);

    // Load check-ins
    let checkins = JSON.parse(localStorage.getItem(getUserKey("checkins"))) || {};

    updatePointsDisplay(points);

    // Store these in memory so checkIn() can use them
    window.userPoints = points;
    window.userCheckins = checkins;
}

function updatePointsDisplay(points) {
    document.getElementById("points-display").innerText = "Points: " + points;
}

// ====== CHECK-IN LOGIC (one per location per day) ======
function checkIn(location) {
    const today = new Date().toISOString().split("T")[0];

    // Block if already checked in today at this location
    if (window.userCheckins[location] === today) {
        document.getElementById("checkin-message").innerText =
            "You have already checked in at this location today.";
        document.getElementById("checkin-message").style.color = "#c62828";
        return;
    }

    // Award points
    window.userPoints += 10;
    localStorage.setItem(getUserKey("points"), window.userPoints);

    // Save check-in record
    window.userCheckins[location] = today;
    localStorage.setItem(getUserKey("checkins"), JSON.stringify(window.userCheckins));

    updatePointsDisplay(window.userPoints);

    document.getElementById("checkin-message").innerText =
        "Successfully checked in at " + location + "! +10 points earned.";
    document.getElementById("checkin-message").style.color = "#2e7d32";
}