// ====== CURRENT USER SESSION ======
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

window.onload = function () {
    loadDarkModePreference();

    if (currentUser) {
        showApp(false);
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
        showApp(true);
    })
    .catch(error => {
        document.getElementById("login-message").innerText = "Login failed. Please try again.";
        console.error(error);
    });
}

// ====== LOGOUT ======
function logout() {
    if (currentUser) {
        addNotification("You have logged out.");
    }

    localStorage.removeItem("currentUser");
    currentUser = null;

    document.getElementById("app-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

// ====== SHOW APP ======
function showApp(showLoginNotification = false) {
    document.getElementById("welcome-message").innerText =
        "Welcome, " + currentUser.name + " (" + currentUser.email + ")";

    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";

    updatePointsDisplay(currentUser.points);
    loadNotifications();
    loadEvents();

    if (showLoginNotification) {
        addNotification("You have successfully logged in.");
    }
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
            document.getElementById("signup-message").style.color = "";
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
            addNotification("Unable to load latest campus events.");
            return;
        }

        if (data.length === 0) {
            eventsList.innerHTML = "<li>No upcoming events available.</li>";
            return;
        }

        data.forEach(event => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${event.event_title}</strong> - ${event.event_location} - ${event.event_date} - ${event.event_time}`;
            eventsList.appendChild(li);
        });

        addNotification("Latest campus events loaded.");
    })
    .catch(error => {
        console.error(error);
        document.getElementById("events-list").innerHTML = "<li>Failed to load events.</li>";
        addNotification("Failed to load campus events.");
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
        addNotification(facility.name + " is not open yet.");
        return;
    }

    if (currentTime >= facility.close) {
        message.innerText = facility.name + " is closed. Check-in unavailable.";
        message.style.color = "red";
        addNotification(facility.name + " is closed. Check-in unavailable.");
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

            addNotification("Check-in successful at " + facility.name + ". 10 points added.");
            saveAttendanceRecord(facility.name);
        } else {
            addNotification(data.message);
        }
    })
    .catch(error => {
        message.innerText = "Check-in failed. Please try again.";
        message.style.color = "red";
        addNotification("Check-in failed. Please try again.");
        console.error(error);
    });
}

// ====== ATTENDANCE HISTORY ======
function getAttendanceKey() {
    return "attendance_" + currentUser.email;
}

function saveAttendanceRecord(locationName) {
    if (!currentUser) return;

    const history = JSON.parse(localStorage.getItem(getAttendanceKey())) || [];
    const now = new Date();

    const record = {
        location: locationName,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        }),
        points: 10
    };

    history.unshift(record);

    if (history.length > 10) {
        history.pop();
    }

    localStorage.setItem(getAttendanceKey(), JSON.stringify(history));
}

function loadAttendanceHistory() {
    const attendanceList = document.getElementById("attendance-list");
    const history = JSON.parse(localStorage.getItem(getAttendanceKey())) || [];

    attendanceList.innerHTML = "";

    if (history.length === 0) {
        attendanceList.innerHTML = "<li>No attendance records yet.</li>";
        return;
    }

    history.forEach(record => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${record.location}</strong><br>
            Date: ${record.date}<br>
            Time: ${record.time}<br>
            Points Earned: ${record.points}
        `;
        attendanceList.appendChild(li);
    });
}

// ====== NOTIFICATIONS ======
function getNotificationKey() {
    return "notifications_" + currentUser.email;
}

function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem(getNotificationKey())) || [];
    renderNotifications(notifications);
}

function addNotification(message) {
    if (!currentUser) return;

    const notifications = JSON.parse(localStorage.getItem(getNotificationKey())) || [];

    const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    notifications.unshift(now + " - " + message);

    if (notifications.length > 5) {
        notifications.pop();
    }

    localStorage.setItem(getNotificationKey(), JSON.stringify(notifications));
    renderNotifications(notifications);
}

function renderNotifications(notifications) {
    const list = document.getElementById("notification-list");
    list.innerHTML = "";

    if (notifications.length === 0) {
        list.innerHTML = "<li>No notifications yet.</li>";
        return;
    }

    notifications.forEach(notification => {
        const li = document.createElement("li");
        li.innerText = notification;
        list.appendChild(li);
    });
}

function clearNotifications() {
    if (!currentUser) return;

    localStorage.removeItem(getNotificationKey());
    renderNotifications([]);
}

// ====== ADD EVENT ======
function addEvent() {
    const title = document.getElementById("event-title-input").value.trim();
    const location = document.getElementById("event-location-input").value.trim();
    const date = document.getElementById("event-date-input").value;
    const time = document.getElementById("event-time-input").value.trim();
    const description = document.getElementById("event-description-input").value.trim();

    const message = document.getElementById("event-message");

    if (!title || !location || !date || !time) {
        message.innerText = "Please complete event title, location, date and time.";
        message.style.color = "red";
        return;
    }

    fetch("add_event.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            event_title: title,
            event_location: location,
            event_date: date,
            event_time: time,
            event_description: description
        })
    })
    .then(response => response.json())
    .then(data => {
        message.innerText = data.message;
        message.style.color = data.success ? "green" : "red";

        if (data.success) {
            document.getElementById("event-title-input").value = "";
            document.getElementById("event-location-input").value = "";
            document.getElementById("event-date-input").value = "";
            document.getElementById("event-time-input").value = "";
            document.getElementById("event-description-input").value = "";

            loadEvents();
            addNotification("New campus event added: " + title);
        }
    })
    .catch(error => {
        message.innerText = "Failed to add event.";
        message.style.color = "red";
        console.error(error);
    });
}

// ====== NAVIGATION ======
function openNavigation(type) {
    const routes = {
        bus: "https://maps.app.goo.gl/78NmwDQ6SJqvUpXU7",
        tram: "https://www.google.com/maps/search/nearest+tram+stop+near+University+of+Wolverhampton",
        train: "https://maps.app.goo.gl/oV1CH3vqJjyoDSwN7"
    };

    window.open(routes[type], "_blank");

    const labels = {
        bus: "bus stop",
        tram: "tram stop",
        train: "train station"
    };

    addNotification("Opened navigation for nearest " + labels[type] + ".");
}

// ====== PAGE SWITCHING ======
function showDashboardPage(page) {
    const homePage = document.getElementById("home-page");
    const roomsPage = document.getElementById("rooms-page");
    const studentIdPage = document.getElementById("student-id-page");
    const attendancePage = document.getElementById("attendance-page");

    homePage.style.display = "none";
    roomsPage.style.display = "none";
    studentIdPage.style.display = "none";
    attendancePage.style.display = "none";

    if (page === "home") {
        homePage.style.display = "block";
        addNotification("Home page opened.");
    }

    if (page === "rooms") {
        roomsPage.style.display = "block";
        addNotification("Room Availability page opened.");
    }

    if (page === "studentId") {
        studentIdPage.style.display = "block";
        loadStudentId();
        addNotification("Digital Student ID opened.");
    }

    if (page === "attendance") {
        attendancePage.style.display = "block";
        loadAttendanceHistory();
        addNotification("Attendance History page opened.");
    }
}

// ====== STUDY ROOM ======
function bookStudyRoom(roomName) {
    const message = document.getElementById("study-room-message");

    if (roomName === "Computer Lab Room C") {
        message.innerText = roomName + " is currently unavailable.";
        message.style.color = "red";
        addNotification(roomName + " is unavailable for booking.");
        return;
    }

    message.innerText = roomName + " has been booked successfully.";
    message.style.color = "green";
    addNotification("Study room booked: " + roomName);
}

// ====== STUDENT ID ======
function loadStudentId() {
    if (!currentUser) return;

    const studentId = "WLV-" + currentUser.user_id.toString().padStart(6, "0");

    document.getElementById("student-id-name").innerText = currentUser.name;
    document.getElementById("student-id-email").innerText = currentUser.email;
    document.getElementById("student-id-number").innerText = studentId;

    document.getElementById("student-qr").src =
        "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
        encodeURIComponent(
            "Name: " + currentUser.name + " | " +
            "Email: " + currentUser.email + " | " +
            "Student ID: " + studentId
        );

    const studentPhoto = document.getElementById("student-photo");

    if (currentUser.profile_photo) {
        studentPhoto.src = currentUser.profile_photo;
    } else {
        studentPhoto.src = "https://via.placeholder.com/120?text=Photo";
    }
}

function uploadStudentPhoto() {
    const photoInput = document.getElementById("student-photo-input");
    const message = document.getElementById("photo-upload-message");

    if (!photoInput.files.length) {
        message.innerText = "Please select a photo.";
        message.style.color = "red";
        return;
    }

    const formData = new FormData();
    formData.append("user_id", currentUser.user_id);
    formData.append("photo", photoInput.files[0]);

    fetch("upload_photo.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        message.innerText = data.message;
        message.style.color = data.success ? "green" : "red";

        if (data.success) {
            currentUser.profile_photo = data.photo_path;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            document.getElementById("student-photo").src = data.photo_path;

            addNotification("Student ID photo updated successfully.");
        }
    })
    .catch(error => {
        message.innerText = "Photo upload failed.";
        message.style.color = "red";
        console.error(error);
    });
}

// ====== DARK MODE ======
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        addNotification("Dark mode enabled.");
    } else {
        localStorage.setItem("darkMode", "disabled");
        addNotification("Light mode enabled.");
    }
}

function loadDarkModePreference() {
    const darkMode = localStorage.getItem("darkMode");

    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
    }
}