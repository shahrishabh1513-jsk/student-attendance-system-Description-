/**
 * dashboard.js — Dashboard logic
 */
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));
    wireAppNav();

    if (!requireLogin('index.html')) return;

    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';
    document.getElementById('profile-name').textContent = username;
    document.getElementById('profile-username').textContent = username;
    document.getElementById('profile-photo').textContent = (username.trim().charAt(0) || 'T').toUpperCase();
    document.getElementById('profile-date').textContent = formatDateLong(new Date());

    // Total students
    document.getElementById('dash-total-students').textContent = STUDENTS.length;

    // Today's stats
    const todayDateStr = new Date().toISOString().slice(0, 10);
    const records = Store.get(STORAGE_KEYS.RECORDS, []);
    const todayRecords = records.filter((r) => String(r.date).slice(0, 10) === todayDateStr);

    let todayPresent = 0;
    let todayAbsent = 0;
    todayRecords.forEach((r) => {
        todayPresent += r.summary?.present || 0;
        todayAbsent += r.summary?.absent || 0;
    });

    document.getElementById('dash-today-present').textContent = todayPresent;
    document.getElementById('dash-today-absent').textContent = todayAbsent;

    // Last updated
    if (records.length > 0) {
        const mostRecent = records.reduce((latest, r) => {
            const t = new Date(r.editedAt || r.savedAt).getTime();
            return t > latest.time ? { time: t, record: r } : latest;
        }, { time: -Infinity, record: null }).record;
        if (mostRecent) {
            const ts = new Date(mostRecent.editedAt || mostRecent.savedAt);
            const isToday = ts.toISOString().slice(0, 10) === todayDateStr;
            const timeStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('dash-last-updated').textContent = isToday ? timeStr : `${ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
        }
    }

    // Notifications / Recent Activity
    renderNotifications(records);

    // Tab switching
    const tabs = document.querySelectorAll('.notif-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderNotifications(records, this.dataset.tab);
        });
    });
});

function renderNotifications(records, tab = 'notifications') {
    const list = document.getElementById('notif-list');
    if (records.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h4>No notifications yet</h4>
                <p>Start taking attendance to see activity here.</p>
            </div>`;
        return;
    }

    const sorted = [...records].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    if (tab === 'notifications') {
        // Show latest 5 records as notifications
        const recent = sorted.slice(0, 5);
        list.innerHTML = recent.map((r) => `
            <div class="notif-item clickable" onclick="window.location.href='reports.html?record=${r.id}'">
                <div class="notif-icon icon-success"><i class="fas fa-clipboard-check"></i></div>
                <div class="notif-text">
                    <strong>${r.subject}</strong> — ${r.batchLabel}
                    <span class="notif-sub">${r.summary.present} present, ${r.summary.absent} absent · ${r.summary.percentage}%</span>
                </div>
                <div class="notif-date">${new Date(r.savedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    } else {
        // Show all records as activity
        list.innerHTML = sorted.map((r) => `
            <div class="notif-item clickable" onclick="window.location.href='reports.html?record=${r.id}'">
                <div class="notif-icon ${r.summary.percentage >= 80 ? 'icon-success' : 'icon-warning'}">
                    <i class="fas ${r.summary.percentage >= 80 ? 'fa-check' : 'fa-exclamation'}"></i>
                </div>
                <div class="notif-text">
                    <strong>${r.subject}</strong> — ${formatDateLong(r.date)}
                    <span class="notif-sub">${r.batchLabel} · ${r.summary.present}/${r.summary.total} present (${r.summary.percentage}%)</span>
                </div>
                <div class="notif-date">${new Date(r.savedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }
}