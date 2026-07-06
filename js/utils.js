const STORAGE_KEYS = {
    LOGGED_IN: "attendanceLoggedIn",
    USERNAME: "attendanceUsername",
    SUBJECT: "attendanceSubject",
    DAY: "attendanceDay",
    BATCH: "attendanceBatch",
    DATE: "attendanceDate",
    RECORDS: "attendanceRecords",
    DRAFT: "attendanceDraft",
    THEME: "attendanceTheme",
};

const Store = {
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) { /* storage unavailable — nothing to clear anyway */ }
    },
    clearSession() {
        [
            STORAGE_KEYS.LOGGED_IN,
            STORAGE_KEYS.USERNAME,
            STORAGE_KEYS.SUBJECT,
            STORAGE_KEYS.DAY,
            STORAGE_KEYS.BATCH,
            STORAGE_KEYS.DATE,
            STORAGE_KEYS.DRAFT,
        ].forEach((k) => Store.remove(k));
    },
};

function formatTime12(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDateLong(date) {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function todayName() {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
}


function showToast(message, type = "info", duration = 3200) {
    let host = document.getElementById("toast-host");
    if (!host) {
        host = document.createElement("div");
        host.id = "toast-host";
        host.className = "toast-host";
        document.body.appendChild(host);
    }
    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        warning: "fa-triangle-exclamation",
        info: "fa-circle-info",
    };
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    host.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-show"));
    setTimeout(() => {
        toast.classList.remove("toast-show");
        toast.classList.add("toast-hide");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}


function safeGetItem(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch (e) {
        return fallback;
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        return false;
    }
}

function initTheme() {

    const saved = safeGetItem(STORAGE_KEYS.THEME, "light");
    document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    safeSetItem(STORAGE_KEYS.THEME, next);
    return next;
}


function animateCount(el, to, duration = 500) {
    if (!el) return;
    const from = Number(el.textContent) || 0;
    if (from === to) {
        el.textContent = to;
        return;
    }
    const start = performance.now();
    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(from + (to - from) * progress);
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}


function debounce(fn, delay = 200) {
    let handle;
    return (...args) => {
        clearTimeout(handle);
        handle = setTimeout(() => fn(...args), delay);
    };
}

function setupScrollToTop(buttonEl) {
    if (!buttonEl) return;
    window.addEventListener("scroll", () => {
        buttonEl.classList.toggle("visible", window.scrollY > 320);
    });
    buttonEl.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function requireLogin(redirectTo = "index.html") {
    const isLoggedIn = Store.get(STORAGE_KEYS.LOGGED_IN, false);
    const username = safeGetItem(STORAGE_KEYS.USERNAME);
    if (isLoggedIn !== true || !username) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}


function attachRipple(root = document) {
    try {
        root.querySelectorAll(".ripple").forEach((el) => {
            if (el.dataset.rippleBound) return;
            el.dataset.rippleBound = "true";
            el.addEventListener("click", function (e) {
                try {
                    const rect = this.getBoundingClientRect();
                    const circle = document.createElement("span");
                    const size = Math.max(rect.width, rect.height) * 2;
                    circle.className = "ripple-circle";
                    circle.style.width = circle.style.height = `${size}px`;
                    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
                    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
                    this.appendChild(circle);
                    setTimeout(() => circle.remove(), 650);
                } catch (err) { /* purely cosmetic — ignore failures */ }
            });
        });
    } catch (err) { /* purely cosmetic — ignore failures */ }
}