/**
 * subject.js — Timetable + batch selection logic
 * Flow: pick a day -> pick a lecture slot -> (if Lab) pick a batch -> continue
 */
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));

    if (!requireLogin('index.html')) return;

    document.getElementById('logged-in-user').textContent = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';
    document.getElementById('current-date').textContent = formatDateLong(new Date());

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.querySelector('i').className = document.documentElement.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.addEventListener('click', () => {
        const next = toggleTheme();
        themeToggle.querySelector('i').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    const dayTabsEl = document.getElementById('day-tabs');
    const slotGridEl = document.getElementById('slot-grid');
    const batchSection = document.getElementById('batch-section');
    const batchGridEl = document.getElementById('batch-grid');
    const summaryEl = document.getElementById('selected-summary');
    const takeAttendanceBtn = document.getElementById('take-attendance-btn');
    const backBtn = document.getElementById('back-btn');
    const alertDiv = document.getElementById('selection-alert');

    let selectedDay = WEEK_DAYS.includes(todayName()) ? todayName() : WEEK_DAYS[0];
    let selectedSlot = null;
    let selectedBatch = null;

    renderDayTabs();
    renderSlots();

    function renderDayTabs() {
        dayTabsEl.innerHTML = '';
        WEEK_DAYS.forEach((day) => {
            const tab = document.createElement('button');
            tab.className = `day-tab ${day === selectedDay ? 'active' : ''}`;
            tab.textContent = day;
            tab.addEventListener('click', () => {
                selectedDay = day;
                selectedSlot = null;
                selectedBatch = null;
                renderDayTabs();
                renderSlots();
                updateBatchSection();
                updateSummary();
                updateButton();
            });
            dayTabsEl.appendChild(tab);
        });
    }

    function renderSlots() {
        slotGridEl.innerHTML = '';
        const slots = TIMETABLE[selectedDay] || [];
        if (slots.length === 0) {
            slotGridEl.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-mug-hot"></i>
                    <h4>No lectures scheduled</h4>
                    <p>There are no lectures on ${selectedDay}. Pick another day above.</p>
                </div>`;
            return;
        }
        slots.forEach((slot, index) => {
            const card = document.createElement('div');
            card.className = 'slot-card';
            card.style.animationDelay = `${index * 40}ms`;
            card.innerHTML = `
                <div class="slot-check"><i class="fas fa-check"></i></div>
                <div class="slot-time">${formatTime12(slot.start)} – ${formatTime12(slot.end)}</div>
                <div class="slot-subject">${slot.subject}</div>
                <span class="slot-badge ${slot.type === 'Lab' ? 'badge-lab' : 'badge-theory'}">
                    <i class="fas ${slot.type === 'Lab' ? 'fa-flask' : 'fa-book-open'}"></i> ${slot.type}
                </span>
            `;
            card.addEventListener('click', () => {
                selectedSlot = slot;
                selectedBatch = null;
                document.querySelectorAll('.slot-card').forEach((c) => c.classList.remove('selected'));
                card.classList.add('selected');
                updateBatchSection();
                updateSummary();
                updateButton();
                hideAlert();
            });
            slotGridEl.appendChild(card);
        });
    }

    function updateBatchSection() {
        if (selectedSlot && selectedSlot.type === 'Lab') {
            batchSection.style.display = 'block';
            batchGridEl.innerHTML = '';
            [1, 2].forEach((batchNo) => {
                const count = STUDENTS.filter((s) => s.batch === batchNo).length;
                const card = document.createElement('div');
                card.className = 'batch-card';
                card.innerHTML = `
                    <div class="batch-icon"><i class="fas ${batchNo === 1 ? 'fa-code' : 'fa-microchip'}"></i></div>
                    <div>
                        <div class="batch-name">${BATCH_LABELS[batchNo]}</div>
                        <div class="batch-meta">${count} students</div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    selectedBatch = batchNo;
                    document.querySelectorAll('.batch-card').forEach((c) => c.classList.remove('selected'));
                    card.classList.add('selected');
                    updateSummary();
                    updateButton();
                    hideAlert();
                });
                batchGridEl.appendChild(card);
            });
        } else {
            batchSection.style.display = 'none';
        }
    }

    function updateSummary() {
        if (!selectedSlot) {
            summaryEl.classList.remove('show');
            return;
        }
        summaryEl.classList.add('show');
        document.getElementById('sum-subject').textContent = selectedSlot.subject;
        document.getElementById('sum-time').textContent = `${formatTime12(selectedSlot.start)} – ${formatTime12(selectedSlot.end)}`;
        document.getElementById('sum-type').textContent = selectedSlot.type;
        document.getElementById('sum-batch').textContent = selectedSlot.type === 'Lab'
            ? (selectedBatch ? BATCH_LABELS[selectedBatch] : 'Choose a batch below')
            : 'All Students (Both Batches)';
    }

    function updateButton() {
        const ready = selectedSlot && (selectedSlot.type === 'Theory' || selectedBatch !== null);
        takeAttendanceBtn.disabled = !ready;
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
            showAlert('Please select a lecture slot to continue.');
            return;
        }
        if (selectedSlot.type === 'Lab' && !selectedBatch) {
            showAlert('This is a lab session — please choose a batch before continuing.');
            return;
        }

        Store.set(STORAGE_KEYS.SUBJECT, { name: selectedSlot.subject, type: selectedSlot.type, start: selectedSlot.start, end: selectedSlot.end });
        Store.set(STORAGE_KEYS.DAY, selectedDay);
        Store.set(STORAGE_KEYS.BATCH, selectedSlot.type === 'Lab' ? selectedBatch : 0);
        localStorage.setItem(STORAGE_KEYS.DATE, new Date().toISOString());

        const originalText = takeAttendanceBtn.innerHTML;
        takeAttendanceBtn.innerHTML = '<span class="spinner"></span> Redirecting…';
        takeAttendanceBtn.disabled = true;

        setTimeout(() => {
            window.location.href = 'student.html';
        }, 700);
    });

    backBtn.addEventListener('click', function () {
        Store.clearSession();
        window.location.href = 'index.html';
    });

    updateSummary();
    updateButton();
});