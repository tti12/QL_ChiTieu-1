/* ============================================================
   HIỂN THỊ LOGIN / REGISTER
============================================================ */
function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');

    const container = document.querySelector('.container');
    container.classList.remove('login-bg');
    container.classList.add('register-bg');
}

function showLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');

    const container = document.querySelector('.container');
    container.classList.remove('register-bg');
    container.classList.add('login-bg');
}

/* ============================================================
   XỬ LÝ ĐĂNG KÝ
============================================================ */

function register() {
    const user = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value.trim();

    if (!user || !pass) {
        showAlert("Vui lòng nhập đầy đủ!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find(u => u.username === user)) {
        showAlert("Tên tài khoản đã tồn tại!");
        return;
    }

    users.push({
        username: user,
        password: btoa(pass)   // mã hóa password
    });

    localStorage.setItem("users", JSON.stringify(users));

    showAlert("Đăng ký thành công! Mời đăng nhập.");
    showLogin();
}


/* ============================================================
   XỬ LÝ ĐĂNG NHẬP
============================================================ */

function login() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    if (!user || !pass) {
        showAlert("Vui lòng nhập đầy đủ!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    const found = users.find(
        u => u.username === user && u.password === btoa(pass)
    );

    if (!found) {
        showAlert("Sai tài khoản hoặc mật khẩu!");
        return;
    }

    // Lưu trạng thái đăng nhập + user hiện tại
    localStorage.setItem("loggedInUser", user);
    loadUserExpenses();
    showMainUI();
}

/* ============================================================
   ĐĂNG XUẤT
============================================================ */

function logout() {
    localStorage.removeItem("loggedInUser");

    document.getElementById('auth').classList.remove('hidden');
    document.getElementById('main').classList.add('hidden');

    document.body.classList.add("center-body");

    const container = document.querySelector('.container');
    container.classList.remove('register-bg');
    container.classList.add('login-bg');

    document.getElementById('loginUser').value = "";
    document.getElementById('loginPass').value = "";

    showAlert("Đăng xuất thành công!");
}

/* ============================================================
   HIỂN THỊ GIAO DIỆN MAIN SAU KHI LOGIN
============================================================ */

function showMainUI() {
    document.getElementById('auth').classList.add('hidden');
    document.getElementById('main').classList.remove('hidden');

    document.body.classList.remove("center-body");
}

/* ============================================================
   ALERT BOX
============================================================ */

function showAlert(message) {
    const alertBox = document.getElementById('alertBox');
    const alertMsg = document.getElementById('alertMessage');

    alertMsg.innerText = message;
    alertBox.classList.remove('hidden');

    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 3000);
}

function closeAlert() {
    document.getElementById('alertBox').classList.add('hidden');
}


/* ============================================================
   CHI TIÊU — LƯU THEO TỪNG TÀI KHOẢN
============================================================ */

let expenses = [];

function getCurrentUser() {
    return localStorage.getItem("loggedInUser");
}

function getExpenseKey() {
    return "expenses_" + getCurrentUser();
}

/* --- Load chi tiêu của user hiện tại --- */
function loadUserExpenses() {
    const key = getExpenseKey();
    expenses = JSON.parse(localStorage.getItem(key) || "[]");
    renderExpenses();
    updateTotals();
}

/* --- Lưu chi tiêu --- */
function saveUserExpenses() {
    localStorage.setItem(getExpenseKey(), JSON.stringify(expenses));
}

/* --- Thêm chi tiêu --- */
function addExpense() {
    const name = document.getElementById("expenseNameInput").value.trim();
    const amount = parseFloat(document.getElementById("expenseInput").value);
    const date = document.getElementById("dateInput").value;

    if (!name || isNaN(amount) || !date) {
        showAlert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    expenses.push({ name, amount, date });
    saveUserExpenses();

    document.getElementById("expenseNameInput").value = "";
    document.getElementById("expenseInput").value = "";

    renderExpenses();
    updateTotals();
}


/* --- Hiển thị danh sách chi tiêu --- */
function renderExpenses() {
    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    // nhóm theo ngày
    const group = {};
    expenses.forEach((exp, index) => {
        if (!group[exp.date]) group[exp.date] = [];
        group[exp.date].push({ ...exp, index });
    });

    // hiển thị từng ngày
    for (const date in group) {
        const [y, m, d] = date.split("-");
        const formattedDate = `${d}-${m}-${y}`;

        // container cho ngày và các khoản chi
        const dayContainer = document.createElement("div");
        dayContainer.className = "day-container";

        // cột ngày bên trái
        const dateCol = document.createElement("div");
        dateCol.className = "date-col";
        dateCol.innerHTML = `<h3 class="day-title">${formattedDate}</h3>`; // đặt h3 ngay trong cột
        dayContainer.appendChild(dateCol);

        // cột danh sách khoản chi bên phải
        const expensesCol = document.createElement("div");
        expensesCol.className = "expenses-col";

        group[date].forEach(exp => {
            const div = document.createElement("div");
            div.className = "expense-item";

            div.innerHTML = `
                <div class="exp-left">
                    <div class="exp-name">Tên khoản chi: ${exp.name}</div>
                </div>
                <div class="exp-right">
                    <div class="exp-amount">Số tiền: ${exp.amount.toLocaleString('vi-VN')}đ</div>
                </div>

                <button class="delete-btn" onclick="deleteExpense(${exp.index})">
                    <i class="fas fa-trash"></i>
                </button>
                
            `;
            div.addEventListener("click", () => {
                div.classList.toggle("active");
            });

            expensesCol.appendChild(div);
        });
        dayContainer.appendChild(expensesCol);
        list.appendChild(dayContainer);
    }
}
//xoa chi tiêu
function deleteExpense(index) {
    const confirmBox = document.getElementById("confirmBox");
    confirmBox.classList.remove("hidden");

    // Xử lý khi nhấn Xóa
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    // remove previous listeners để tránh nhiều lần click
    yesBtn.onclick = () => {
        expenses.splice(index, 1);   // xóa item
        saveUserExpenses();
        renderExpenses();
        updateTotals();
        confirmBox.classList.add("hidden");
        showAlert("Xóa thành công!");
    };

    // hủy
    noBtn.onclick = () => {
        confirmBox.classList.add("hidden");
    };
}


/* --- Tính tổng chi tiêu --- */
function updateTotals() {
    const today = getToday();
    const month = getMonth();

    const todayTotal = expenses
        .filter(e => e.date === today)
        .reduce((sum, e) => sum + e.amount, 0);

    const monthTotal = expenses
        .filter(e => e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);

    document.getElementById("todayTotal").innerText = todayTotal + "đ";
    document.getElementById("monthTotal").innerText = monthTotal + "đ";
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function getMonth() {
    return new Date().toISOString().slice(0, 7);
}

/* ============================================================
   WINDOW.ONLOAD
============================================================ */

window.onload = () => {
    const user = getCurrentUser();

    if (user) {
        loadUserExpenses();
        showMainUI();
    } else {
        document.body.classList.add("center-body");
    }

    document.getElementById("dateInput").valueAsDate = new Date();
};
