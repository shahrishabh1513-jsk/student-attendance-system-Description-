document.addEventListener('DOMContentLoaded', function () {
    // CHECK LOGIN
    const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
    const username = localStorage.getItem('attendanceUsername');

    if (isLoggedIn !== 'true' || !username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('logged-in-user').textContent = username;
    updateDateTime();
    setInterval(updateDateTime, 60000);

    function updateDateTime() {
        const now = new Date();
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    }

    // ---------------- Subject master list ----------------
    const SUBJECTS = {
        AR:      { code: 'SSCA4010', name: 'Augmented Reality & Virtual Reality' },
        DEVOPS:  { code: 'SSCS4010', name: 'DevOps & Agile Foundation' },
        FSD:     { code: 'SSCA4020', name: 'Full Stack Development' },
        IMGP:    { code: 'SSCA4030', name: 'Image Processing' },
        CRYPTO:  { code: 'SSCS4020', name: 'Cryptography & Network Security' }
    };

    // 8 fixed time columns
    const TIME_COLS = [
        { start: '09:50', end: '10:45' },
        { start: '10:45', end: '11:40' },
        { start: '11:40', end: '12:35' },
        { start: '12:35', end: '13:30' },
        { start: '13:30', end: '14:25' },
        { start: '14:25', end: '15:20' },
        { start: '15:20', end: '16:15' },
        { start: '16:15', end: '17:10' }
    ];

    // Each day: array of 8 entries. null = empty (—).
    // { subject: SUBJECTS key, lab: bool, continues: bool (this slot is a continuation of a lab that started earlier) }
    const TIMETABLE = {
        Tuesday: [
            { subject: 'AR' },
            { subject: 'DEVOPS' },
            { subject: 'FSD' },
            { subject: 'AR' },
            { subject: 'IMGP', lab: true },
            { subject: 'IMGP', lab: true, continues: true },
            { subject: 'AR' },
            null
        ],
        Wednesday: [
            { subject: 'AR' },
            { subject: 'CRYPTO', lab: true },
            { subject: 'CRYPTO', lab: true, continues: true },
            { subject: 'AR' },
            { subject: 'AR' },
            { subject: 'AR' },
            { subject: 'AR' },
            null
        ],
        Thursday: [
            null,
            null,
            { subject: 'DEVOPS' },
            null,
            null,
            { subject: 'CRYPTO' },
            { subject: 'DEVOPS', lab: true },
            { subject: 'DEVOPS', lab: true, continues: true }
        ],
        Friday: [
            null,
            { subject: 'IMGP' },
            { subject: 'IMGP' },
            null,
            null,
            null,
            { subject: 'FSD', lab: true },
            { subject: 'FSD', lab: true, continues: true }
        ],
        Saturday: [
            null,
            { subject: 'IMGP' },
            { subject: 'DEVOPS' },
            null,
            { subject: 'FSD' },
            { subject: 'FSD' },
            { subject: 'CRYPTO' },
            { subject: 'CRYPTO' }
        ]
    };

    const DAYS = Object.keys(TIMETABLE);

    // Default to today if it's a scheduled day, else the first day
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let selectedDay = DAYS.includes(todayName) ? todayName : DAYS[0];
    let selectedSlot = null; // { day, colIndex, subject, lab, start, end }

    const dayTabsEl = document.getElementById('day-tabs');
    const timeSlotsEl = document.getElementById('time-slots');
    const daySlotTitle = document.getElementById('day-slot-title');
    const selectedInfoPanel = document.getElementById('selected-info');
    const takeAttendanceBtn = document.getElementById('take-attendance-btn');
    const backBtn = document.getElementById('back-btn');
    const alertDiv = document.getElementById('selection-alert');

    function formatTime(t) {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:${m} ${ampm}`;
    }

    function renderDayTabs() {
        dayTabsEl.innerHTML = '';
        DAYS.forEach(day => {
            const tab = document.createElement('button');
            tab.className = 'day-tab' + (day === selectedDay ? ' active' : '');
            tab.textContent = day;
            tab.addEventListener('click', () => {
                selectedDay = day;
                renderDayTabs();
                renderTimeSlots();
            });
            dayTabsEl.appendChild(tab);
        });
    }

    function renderTimeSlots() {
        daySlotTitle.textContent = `${selectedDay} — Lecture Slots`;
        timeSlotsEl.innerHTML = '';

        TIMETABLE[selectedDay].forEach((entry, index) => {
            const col = TIME_COLS[index];
            const el = document.createElement('div');

            if (!entry) {
                el.className = 'time-slot slot-empty';
                el.innerHTML = `
                    <div class="time-range">${formatTime(col.start)} - ${formatTime(col.end)}</div>
                    <div class="lecture-number">—</div>
                    <div class="duration">No lecture</div>
                `;
                timeSlotsEl.appendChild(el);
                return;
            }

            if (entry.continues) {
                el.className = 'time-slot slot-continue slot-lab';
                el.innerHTML = `
                    <div class="time-range">${formatTime(col.start)} - ${formatTime(col.end)}</div>
                    <div class="lecture-number">(Lab Continues)</div>
                    <div class="duration">${SUBJECTS[entry.subject].name}</div>
                `;
                timeSlotsEl.appendChild(el);
                return;
            }

            const subj = SUBJECTS[entry.subject];
            const isSelected = selectedSlot && selectedSlot.day === selectedDay && selectedSlot.colIndex === index;

            el.className = 'time-slot' + (entry.lab ? ' slot-lab' : '') + (isSelected ? ' selected' : '');
            el.innerHTML = `
                <div class="time-range">${formatTime(col.start)} - ${formatTime(col.end)}</div>
                <div class="lecture-number">${subj.name}</div>
                <div class="duration">${subj.code}</div>
                ${entry.lab ? '<div class="lab-badge"><i class="fas fa-flask"></i> Lab Session</div>' : ''}
            `;

            el.addEventListener('click', () => {
                selectedSlot = {
                    day: selectedDay,
                    colIndex: index,
                    subject: subj,
                    lab: !!entry.lab,
                    start: col.start,
                    end: col.end
                };
                renderTimeSlots();
                updateSelectedInfo();
                updateTakeAttendanceButton();
            });

            timeSlotsEl.appendChild(el);
        });
    }

    function updateSelectedInfo() {
        if (!selectedSlot) {
            selectedInfoPanel.style.display = 'none';
            return;
        }
        selectedInfoPanel.style.display = 'block';
        document.getElementById('selected-subject-name').textContent = selectedSlot.subject.name + (selectedSlot.lab ? ' (Lab)' : '');
        document.getElementById('selected-subject-code').textContent = selectedSlot.subject.code;
        document.getElementById('selected-day').textContent = selectedSlot.day;
        document.getElementById('selected-time-slot').textContent = `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`;
    }

    function updateTakeAttendanceButton() {
        takeAttendanceBtn.disabled = !selectedSlot;
        if (selectedSlot) hideAlert();
    }

    function showAlert(message) {
        alertDiv.querySelector('span').textContent = message;
        alertDiv.style.display = 'flex';
    }
    function hideAlert() {
        alertDiv.style.display = 'none';
    }

    takeAttendanceBtn.addEventListener('click', function () {
        if (!selectedSlot) {
            showAlert('Please select a lecture slot to continue');
            return;
        }

        localStorage.setItem('attendanceSubject', JSON.stringify(selectedSlot.subject));
        localStorage.setItem('attendanceTimeSlot', JSON.stringify({
            start: selectedSlot.start,
            end: selectedSlot.end,
            lecture: selectedSlot.subject.name,
            day: selectedSlot.day,
            isLab: selectedSlot.lab
        }));
        localStorage.setItem('attendanceDate', new Date().toISOString());

        const originalText = takeAttendanceBtn.innerHTML;
        takeAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
        takeAttendanceBtn.disabled = true;

        setTimeout(() => {
            window.location.href = 'student.html';
        }, 1000);
    });

    backBtn.addEventListener('click', function () {
        localStorage.removeItem('attendanceLoggedIn');
        localStorage.removeItem('attendanceUsername');
        localStorage.removeItem('attendanceSubject');
        localStorage.removeItem('attendanceTimeSlot');
        window.location.href = 'index.html';
    });

    renderDayTabs();
    renderTimeSlots();
});