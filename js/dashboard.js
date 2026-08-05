document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));

    if (!requireLogin('index.html')) return;

    wireAppNav();

    const username = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';
    const initial = (username.trim().charAt(0) || 'T').toUpperCase();

    document.getElementById('page-subtitle').textContent = username;
    document.getElementById('profile-photo').textContent = initial;
    document.getElementById('profile-name').textContent = username;
    document.getElementById('profile-faculty-name').textContent = username;
    document.getElementById('profile-username').textContent = username;
    document.getElementById('profile-date').textContent = formatDateLong(new Date());

    /* ------------------------- Today's Overview ------------------------- */

    const todayName_ = todayName();
    const todayDateStr = new Date().toISOString().slice(0, 10);
    const allRecords = Store.get(STORAGE_KEYS.RECORDS, []);
    const todayRecords = allRecords.filter((r) => String(r.date).slice(0, 10) === todayDateStr);

    const todayPresent = todayRecords.reduce((sum, r) => sum + (r.summary?.present || 0), 0);
    const todayAbsent = todayRecords.reduce((sum, r) => sum + (r.summary?.absent || 0), 0);
    document.getElementById('dash-today-present').textContent = todayPresent;
    document.getElementById('dash-today-absent').textContent = todayAbsent;

    let mostRecent = null;
    if (allRecords.length > 0) {
        mostRecent = allRecords.reduce((latest, r) => {
            const t = new Date(r.editedAt || r.savedAt).getTime();
            return t > latest.time ? { time: t, record: r } : latest;
        }, { time: -Infinity, record: null }).record;
    }
    if (mostRecent) {
        const ts = new Date(mostRecent.editedAt || mostRecent.savedAt);
        const isToday = ts.toISOString().slice(0, 10) === todayDateStr;
        const timeStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('dash-last-updated').textContent = isToday ? timeStr : `${ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
    }

    /* ------------------------- Notifications / Activity ------------------------- */

    const todaysLectureCount = (TIMETABLE[todayName_] || []).length;
    const takenTodayCount = new Set(todayRecords.map((r) => `${r.day}|${r.subject}|${r.start || ''}|${r.batch}`)).size;
    const pendingToday = Math.max(todaysLectureCount - takenTodayCount, 0);

    function buildNotifications() {
        const items = [];
        items.push({
            icon: 'fa-hand-sparkles', iconClass: '', date: '',
            text: `Welcome back, ${username}!`, sub: 'Have a great day of teaching.',
        });
        if (todaysLectureCount === 0) {
            items.push({
                icon: 'fa-mug-hot', iconClass: 'icon-success', date: '',
                text: 'No lectures scheduled today.', sub: `Nothing on the timetable for ${todayName_}.`,
            });
        } else if (pendingToday === 0) {
            items.push({
                icon: 'fa-circle-check', iconClass: 'icon-success', date: '',
                text: `All ${todaysLectureCount} lecture(s) for today are recorded.`, sub: 'Nice work — you\u2019re all caught up.',
            });
        } else {
            items.push({
                icon: 'fa-triangle-exclamation', iconClass: 'icon-warning', date: '',
                text: `${pendingToday} of ${todaysLectureCount} lecture(s) still pending today.`, sub: 'Head to Timetable to mark attendance.',
            });
        }
        if (mostRecent) {
            const ts = new Date(mostRecent.editedAt || mostRecent.savedAt);
            items.push({
                icon: 'fa-floppy-disk', iconClass: '', date: ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                text: `Last saved: ${mostRecent.subject}`, sub: `${mostRecent.summary.present}/${mostRecent.summary.total} present \u2014 ${mostRecent.batchLabel}`,
            });
        }
        items.push({
            icon: 'fa-shield-halved', iconClass: '', date: '',
            text: 'Your attendance data stays on this device.', sub: 'Everything is stored locally in this browser only.',
        });
        return items;
    }

    function buildActivity() {
        const sorted = allRecords.slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)).slice(0, 8);
        if (sorted.length === 0) {
            return [{ icon: 'fa-box-open', iconClass: '', date: '', text: 'No attendance sessions saved yet.', sub: 'Take attendance from the Timetable page to see activity here.' }];
        }
        return sorted.map((r) => ({
            icon: 'fa-clipboard-check', iconClass: 'icon-success', date: formatDateLong(r.date).replace(/^[A-Za-z]+, /, ''),
            text: `${r.subject} \u2014 ${r.batchLabel}`, sub: `${r.summary.present}/${r.summary.total} present (${r.summary.percentage}%)`,
            recordId: r.id,
        }));
    }

    function renderList(items) {
        const list = document.getElementById('notif-list');
        list.innerHTML = items.map((item) => `
            <div class="notif-item ${item.recordId ? 'clickable' : ''}" ${item.recordId ? `data-record-id="${item.recordId}"` : ''}>
                <div class="notif-icon ${item.iconClass}"><i class="fas ${item.icon}"></i></div>
                <div class="notif-text">${item.text}${item.sub ? `<span class="notif-sub">${item.sub}</span>` : ''}</div>
                ${item.date ? `<div class="notif-date">${item.date}</div>` : ''}
            </div>
        `).join('');
        list.querySelectorAll('.notif-item.clickable').forEach((el) => {
            el.addEventListener('click', () => {
                window.location.href = `reports.html?record=${encodeURIComponent(el.dataset.recordId)}`;
            });
        });
    }

    renderList(buildNotifications());

    document.querySelectorAll('.notif-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.notif-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            renderList(tab.dataset.tab === 'activity' ? buildActivity() : buildNotifications());
        });
    });
});