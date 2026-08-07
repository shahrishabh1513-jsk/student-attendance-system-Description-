<div align="center">

# 🎓 Student Attendance Management System

### A fast, offline-friendly attendance app for faculty — mark, track, and share attendance in seconds.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-View_Project-2563EB?style=for-the-badge)](https://shahrishabh1513-jsk.github.io/student-attendance-system-Description-/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/shahrishabh1513-jsk/student-attendance-system-Description-)
[![License](https://img.shields.io/badge/License-MIT-16A34A?style=for-the-badge)](#-license)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![No Backend Required](https://img.shields.io/badge/Backend-None_Needed-blueviolet?style=flat-square)](#)
[![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=flat-square)](#-author)

<br>

**[🚀 Live Demo](https://shahrishabh1513-jsk.github.io/student-attendance-system-Description-/) &nbsp;·&nbsp; [🐛 Report Bug](https://github.com/shahrishabh1513-jsk/student-attendance-system-Description-/issues) &nbsp;·&nbsp; [✨ Request Feature](https://github.com/shahrishabh1513-jsk/student-attendance-system-Description-/issues)**

</div>

---

## 📖 Table of Contents

| # | Section | # | Section |
|:---:|---|:---:|---|
| 1️⃣ | [Preview](#-preview) | 8️⃣ | [How It Works](#-how-it-works) |
| 2️⃣ | [About the Project](#-about-the-project) | 9️⃣ | [Data & Privacy](#-data--privacy) |
| 3️⃣ | [Features](#-features) | 🔟 | [Roadmap](#-roadmap) |
| 4️⃣ | [Tech Stack](#-tech-stack) | ⓫ | [Contributing](#-contributing) |
| 5️⃣ | [Project Structure](#-project-structure) | ⓬ | [Author](#-author) |
| 6️⃣ | [Getting Started](#-getting-started) | ⓭ | [License](#-license) |
| 7️⃣ | [Demo Login](#-demo-login) | | |

---

## 🖼 Preview

<table>
<tr>
<td width="50%" align="center"><img width="1899" height="874" alt="Day_2_login_Page" src="https://github.com/user-attachments/assets/2f7a5db2-dede-4382-b9f6-360256bf802c" />

" alt="Login Page" width="100%"/><br><b>🔐 Login Page</b></td>
<td width="50%" align="center"><img src="screenshots/dashboard.png" alt="Dashboard" width="100%"/><br><b>🏠 Dashboard</b></td>
</tr>
</table>

---

## 📌 About the Project

**Student Attendance Management System** is a lightweight, fully client-side web app that lets faculty take, track, and share classroom attendance — without needing a backend, a database, or an internet connection once loaded.

Everything runs in the browser using **HTML, CSS, and vanilla JavaScript**, and all data is stored locally via `localStorage`. It's built for real classroom use: a weekly timetable drives what's being taught right now, attendance is marked with big one-tap buttons, and every saved session can be reviewed, edited, printed, or shared later — as an **Image, PDF, or Excel file** — straight to WhatsApp or Email.

> 💡 **Why this project?** Most college attendance workflows are either paper registers or heavy ERP portals. This project explores a middle ground: a clean, fast, installable-anywhere tool that a single faculty member can start using in under a minute.

---

## ✨ Features

### 🔐 Authentication
- Simple, secure faculty login (Staff / Student role selector)
- Persistent session — stays logged in until you log out
- Clean full-screen login experience with a campus illustration panel

### 🏠 Dashboard
- At-a-glance **Today's Overview**: Total Students, Present Today, Absent Today, Last Updated
- Faculty profile card (name, role, batches, subjects)
- Live **Notifications** tab — pending lectures, last saved session, reminders
- **Recent Activity** tab — quick access to your last saved sessions

### 🗓️ Weekly Timetable
- Full Tuesday–Saturday timetable rendered as a real grid (periods × days)
- Colour-coded lecture types — 🟡 **Lab** vs 🔵 **Theory**
- "Today" column highlighted automatically
- ✅ **Already Taken Today** badge — never accidentally re-mark a lecture
- Lab sessions automatically prompt for **Batch 1 (BCA)** or **Batch 2 (B.Sc. IT)** — batch-wise attendance built in

### ✅ Take Attendance
- Clean student list: **Name · Enrollment No. · Total Attendance · Mark**
- Big one-tap **P / A** buttons — turns green/red instantly, no page reload
- Live search (by name, enrollment number, course, or status)
- Sort **A → Z** or **Z → A**
- Bulk actions: Select All Present, Select All Absent, Undo Last Action, Reset
- Auto-saves a draft as you go — refresh-proof, no data loss
- Session summary cards: Total / Present / Absent / Completion %

### 📊 Reports & Records
- Every saved session stored with full details — subject, date, time, batch, faculty, per-student status
- Filter records by date, subject, or batch
- **View → Edit → Re-save** any past session
- **Print** a formatted attendance report (A4-ready)
- **Export**: CSV (single record or bulk), and printable/shareable reports
- Built-in **sample data loader** for quick demos/testing

### 📤 Share Report
- Export attendance as **Image (PNG)**, **PDF**, or **Excel (.xls)**
- Share directly via the device share sheet, **WhatsApp**, or **Email**
- Absent students are visually flagged with a red highlight on printed/shared reports

### 📱 Fully Responsive
- Optimized for desktop, tablet, and mobile
- Attendance table becomes tap-friendly cards on small screens
- Large touch targets designed for quick marking mid-lecture

### 🎨 Design
- Clean, modern light theme (soft blue palette, high contrast, easy on the eyes)
- Smooth micro-interactions (ripple buttons, animated counters, toasts)
- Consistent navigation shared across every page

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, Flexbox, Grid) |
| Logic | Vanilla JavaScript (ES6+, no frameworks) |
| Storage | Browser `localStorage` (no server/database) |
| Icons | Font Awesome |
| Export | `html2canvas`, `jsPDF` |
| Hosting | GitHub Pages |

No build tools, no `npm install`, no bundlers — clone it and open it.

---

## 📁 Project Structure

```
student-attendance-system/
│
├── index.html              # Login page
├── dashboard.html           # Faculty dashboard (post-login landing page)
├── subject.html             # Weekly timetable & lecture/batch selection
├── student.html             # Take attendance page
├── reports.html             # Attendance reports & account page
│
├── assets/
│   ├── logo-mark.svg        # App logo
│   └── bg.jpg                # (optional) login page campus image
│
├── css/
│   └── style.css            # All application styling
│
└── js/
    ├── data.js               # Student roster & timetable data
    ├── utils.js              # Shared helpers (storage, toasts, nav, formatting)
    ├── main.js                # Login page logic
    ├── dashboard.js           # Dashboard page logic
    ├── subject.js             # Timetable/batch selection logic
    ├── student.js             # Attendance-taking logic
    ├── reports.js              # Reports/records logic
    └── share.js                # Image/PDF/Excel export & sharing
```

---

## 🚀 Getting Started

### Option 1 — Just use the live version
No setup needed:
👉 **[Open the live app](https://shahrishabh1513-jsk.github.io/student-attendance-system-Description-/)**

### Option 2 — Run it locally

```bash
# 1. Clone the repository
git clone https://github.com/shahrishabh1513-jsk/student-attendance-system-Description-.git

# 2. Move into the project folder
cd student-attendance-system-Description-

# 3. Serve it locally (recommended, so localStorage behaves consistently)
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

> ⚠️ **Tip:** Opening `index.html` by double-clicking it works too, but some browsers isolate storage differently for files opened directly (`file://`). Running a local server avoids that entirely.

---

## 🔑 Demo Login

| Field | Value |
|---|---|
| **Role** | Staff |
| **Username** | `Rishabh Shah` |
| **Password** | `1504` |

---

## 🧭 How It Works

```
Login  →  Dashboard  →  Timetable  →  (Batch, if Lab)  →  Take Attendance  →  Save  →  Reports
                ↑______________________________________________________________________|
                                     (review, edit, print, share anytime)
```

1. **Log in** with your faculty credentials.
2. Land on the **Dashboard** — see today's overview and recent activity.
3. Open the **Timetable**, tap the lecture you're teaching right now.
4. If it's a **Lab**, pick the batch (Batch 1 / Batch 2).
5. Mark each student **Present** or **Absent** with one tap.
6. Hit **Save Attendance** — you're taken straight to the saved report.
7. From **Reports**, revisit any session to view, edit, print, export, or share it.

---

## 🔒 Data & Privacy

This project stores **all data locally in your browser** (`localStorage`) — there is no backend server and no database.

- ✅ Works fully offline once the page is loaded
- ✅ Nothing is sent to any server
- ⚠️ Clearing your browser data will erase saved attendance — export/share important records regularly
- ⚠️ Data does not sync across devices or browsers (by design — this is a lightweight, single-device tool)

---

## 🗺 Roadmap

- [ ] Optional backend sync (Firebase / Supabase) for multi-device access
- [ ] Bulk student roster import/editor (CSV upload)
- [ ] Attendance analytics & trend charts per student/subject
- [ ] Dark mode refinements
- [ ] PWA support (installable, offline-first)
- [ ] Multi-faculty / multi-role accounts

Have an idea? [Open an issue](https://github.com/shahrishabh1513-jsk/student-attendance-system-Description-/issues) — contributions and suggestions are welcome!

---

## 🤝 Contributing

Contributions make the open-source community amazing. Any contributions are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Rishabh Shah**

[![GitHub](https://img.shields.io/badge/GitHub-shahrishabh1513--jsk-181717?style=flat-square&logo=github)](https://github.com/shahrishabh1513-jsk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/Rishabh-alpeshabhai-shah-91b9072a6/)

---

## 📄 License

Licensed under the **MIT License** — free to use, modify, and distribute, with attribution.
See [`LICENSE`](LICENSE) for full details.

---

<div align="center">

### ⭐ If this project helped you, consider giving it a star!

**✧ Designed with purpose & passion ✧**

Made by [Rishabh Shah](https://github.com/shahrishabh1513-jsk)

</div>
