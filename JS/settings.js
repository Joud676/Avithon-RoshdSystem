window.onload = function () {
  loadSettings();
  loadUsers();
  loadFlightData();
};

function saveSettings() {
  const settings = {
    apuMax: document.getElementById("apuMax").value,
    alerts: {
      alert5: document.getElementById("alert5").checked,
      alert10: document.getElementById("alert10").checked,
      alert15: document.getElementById("alert15").checked
    }
  };
  localStorage.setItem("systemSettings", JSON.stringify(settings));
  showCustomAlert("✅ تم حفظ الإعدادات بنجاح");
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem("systemSettings"));
  if (settings) {
    document.getElementById("apuMax").value = settings.apuMax || 30;
    document.getElementById("alert5").checked = settings.alerts.alert5;
    document.getElementById("alert10").checked = settings.alerts.alert10;
    document.getElementById("alert15").checked = settings.alerts.alert15;
  }
}

let editingUserIndex = null;

function loadUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const usersDiv = document.getElementById("users");
  usersDiv.innerHTML = "";
  users.forEach((user, index) => {
    const userDiv = document.createElement("div");
    userDiv.className = "user";
    userDiv.innerHTML = `
      <span>${user.name} - ${user.roleText}</span>
      <button onclick="editUser(${index})">تعديل</button>
      <button onclick="deleteUser(${index})">حذف</button>
    `;
    usersDiv.appendChild(userDiv);
  });
}

function addUser() {
  editingUserIndex = null;
  document.getElementById("modalTitle").textContent = "إضافة مستخدم";
  document.getElementById("userName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userRole").value = "admin";
  document.getElementById("userModal").style.display = "block";
}

function editUser(index) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users[index];
  editingUserIndex = index;
  document.getElementById("modalTitle").textContent = "تعديل مستخدم";
  document.getElementById("userName").value = user.name;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userRole").value = user.role;
  document.getElementById("userModal").style.display = "block";
}

function saveUser() {
  const nameInput = document.getElementById("userName");
  const emailInput = document.getElementById("userEmail");
  const roleInput = document.getElementById("userRole");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const role = roleInput.value;
  const roleText = document.querySelector(`#userRole option[value="${role}"]`).textContent;

  clearErrors();

  let hasError = false;

  if (name === "") {
    showError(nameInput, "الاسم مطلوب");
    hasError = true;
  }

  if (email === "") {
    showError(emailInput, "البريد الإلكتروني مطلوب");
    hasError = true;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError(emailInput, "البريد الإلكتروني غير صالح");
      hasError = true;
    }
  }

  if (role === "") {
    showError(roleInput, "الرجاء اختيار الدور");
    hasError = true;
  }

  if (hasError) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const newUser = { name, email, role, roleText };

  if (editingUserIndex !== null) {
    users[editingUserIndex] = newUser;
  } else {
    users.push(newUser);
  }

  localStorage.setItem("users", JSON.stringify(users));
  document.getElementById("userModal").style.display = "none";
  loadUsers();
}
function showError(input, message) {
  input.classList.add("input-error");
  const errorMsg = document.createElement("div");
  errorMsg.className = "error-message";
  errorMsg.textContent = message;
  input.parentNode.appendChild(errorMsg);
}

function clearErrors() {
  document.querySelectorAll(".input-error").forEach(input => {
    input.classList.remove("input-error");
  });
  document.querySelectorAll(".error-message").forEach(msg => msg.remove());
}

let deleteIndex = null;

function deleteUser(index) {
  deleteIndex = index;
  document.getElementById("deleteModal").style.display = "flex";
}

document.getElementById("confirmDelete").addEventListener("click", function () {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  users.splice(deleteIndex, 1);
  localStorage.setItem("users", JSON.stringify(users));
  loadUsers();
  document.getElementById("deleteModal").style.display = "none";
  deleteIndex = null;
});

document.getElementById("cancelDelete").addEventListener("click", function () {
  document.getElementById("deleteModal").style.display = "none";
  deleteIndex = null;
});

function showCustomAlert(message, duration = 3000) {
  const alertBox = document.getElementById('customAlert');
  alertBox.textContent = message;
  alertBox.classList.add('show');

  setTimeout(() => {
    alertBox.classList.remove('show');
  }, duration);
}

function closeModal() {
  document.getElementById("userModal").style.display = "none";
}

function loadFlightData() {
  fetch("../JSON/data.json")
    .then(response => response.json())
    .then(data => {
      document.getElementById("airportName").textContent = data.airport.name || "غير معروف";
      document.getElementById("flightCount").textContent = data.flights.length || 0;
      const types = Object.keys(data.aircraftTypes);
      const typeNames = types.map(typeCode => data.aircraftTypes[typeCode].model);
      document.getElementById("aircraftTypes").textContent = typeNames.join(", ");
      const airlinesList = document.getElementById("airlinesList");
      airlinesList.innerHTML = "";
      const airlineCodes = Object.keys(data.airlines);
      airlineCodes.forEach(code => {
        const airlineName = data.airlines[code].name;
        const li = document.createElement("li");
        li.textContent = airlineName;
        airlinesList.appendChild(li);
      });
    })
    .catch(error => {
      console.error("❌ فشل في تحميل بيانات الرحلات:", error);
    });
}
