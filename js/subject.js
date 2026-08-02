/**
 * subject.js — Weekly timetable grid + batch selection logic
 */
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));
    wireAppNav();

    if (!requireLogin('index.html')) return;

    const timetableEl = document.getElementById('timetable');
    const batchSection = document.getElementById('batch-section');
    const batchGridEl = document.getElementById('batch-grid');
    const summaryEl = document.getElementById('selected-summary');
    const takeAttendanceBtn = document.getElementById('take-attendance-btn');
    const alertDiv = document.getElementById('selection-alert');

    const today = todayName();
    const todayDateStr = new Date().toISOString().slice(0, 10);
    let selectedDay = null;
    let selectedSlot = null;
    let selectedBatch = null;

    const maxPeriods = Math.max(...WEEK_DAYS.map((day) => TIMETABLE[day].length));

    // Get today's records for the "already taken" badge
    const allRecords = Store.get(STORAGE_KEYS.RECORDS, []);
    const todayRecords = allRecords.filter((r) => String(r.date).slice(0, 10) === todayDateStr);
    const takenTodayMap = {};
    todayRecords.forEach((r) => {
        const key = `${r.day}|${r.subject}|${r.start || ''}`;
        if (!takenTodayMap[key]) takenTodayMap[key] = [];
        takenTodayMap[key].push(r.batch ? BATCH_LABELS[r.batch] : 'All Students');
    });

    renderTimetable();

    function renderTimetable() {
        let head = '<thead><tr><th class="period-col"></th>';
        WEEK_DAYS.forEach((day) => {
            const isToday = day === today;
            head += `
                <th class="day-head ${isToday ? 'is-today' : ''}">
                    <span class="day-name">${day}</span>
                    <span class="day-tag">${isToday ? 'Today' : `${TIMETABLE[day].length} lectures`}</span>
                </th>`;
        });
        head += '</tr></thead>';

        let body = '<tbody>';
        for (let period = 0; period < maxPeriods; period++) {
            body += `<tr><td class="period-col">Period ${period + 1}</td>`;
            WEEK_DAYS.forEach((day) => {
                const slot = TIMETABLE[day][period];
                if (!slot) {
                    body += '<td><div class="timetable-cell is-empty"><span class="cell-time">—</span></div></td>';
                    return;
                }
                const isSelected = selectedDay === day && selectedSlot === slot;
                const takenKey = `${day}|${slot.subject}|${slot.start}`;
                const takenBatches = takenTodayMap[takenKey];
                const takenBadge = (day === today && takenBatches)
                    ? `<span class="cell-taken" title="Already taken today: ${takenBatches.join(', ')}"><i class="fas fa-circle-check"></i></span>`
                    : '';
                body += `
                    <td>
                        <div class="timetable-cell type-${slot.type.toLowerCase()} ${isSelected ? 'selected' : ''}"
                             data-day="${day}" data-period="${period}">
                            ${takenBadge}
                            <span class="cell-badge type-${slot.type.toLowerCase()}">${slot.type}</span>
                            <span class="cell-time">${formatTime12(slot.start)} – ${formatTime12(slot.end)}</span>
                            <span class="cell-subject">${slot.subject}</span>
                            <span class="cell-check"><i class="fas fa-check"></i></span>
                        </div>
                    </td>`;
            });
            body += '</tr>';
        }
        body += '</tbody>';

        timetableEl.innerHTML = head + body;

        timetableEl.querySelectorAll('.timetable-cell:not(.is-empty)').forEach((cell) => {
            cell.addEventListener('click', () => {
                const day = cell.dataset.day;
                const period = Number(cell.dataset.period);
                selectedDay = day;
                selectedSlot = TIMETABLE[day][period];
                selectedBatch = null;

                timetableEl.querySelectorAll('.timetable-cell').forEach((c) => c.classList.remove('selected'));
                cell.classList.add('selected');

                updateBatchSection();
                updateSummary();
                updateButton();
                hideAlert();
            });
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
        document.getElementById('sum-time').textContent = `${selectedDay} · ${formatTime12(selectedSlot.start)} – ${formatTime12(selectedSlot.end)}`;
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
            showAlert('Please select a lecture from the timetable to continue.');
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

    updateSummary();
    updateButton();
});