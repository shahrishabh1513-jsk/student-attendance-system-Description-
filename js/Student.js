document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));

    if (!requireLogin('index.html')) return;

    const subject = Store.get(STORAGE_KEYS.SUBJECT);
    const day = Store.get(STORAGE_KEYS.DAY);
    const batch = Store.get(STORAGE_KEYS.BATCH, 0);
    const sessionDate = localStorage.getItem(STORAGE_KEYS.DATE) || new Date().toISOString();

    if (!subject || !day) {
        window.location.href = 'subject.html';
        return;
    }

      const roster = (batch === 1 || batch === 2)
        ? STUDENTS.filter((s) => s.batch === batch)
        : STUDENTS.slice();

    let students = roster.map((s) => ({ ...s, attendance: null }));

    const draft = Store.get(STORAGE_KEYS.DRAFT);
    const draftKey = `${subject.name}|${day}|${batch}|${sessionDate.slice(0, 10)}`;
    if (draft && draft.key === draftKey && Array.isArray(draft.students)) {
        students = draft.students;
    }

    let filteredStudents = [...students];
    let history = []; // undo stack of {id, previous}
    let unsavedChanges = false;


    const el = (id) => document.getElementById(id);
    const themeToggle = el('theme-toggle');
    const totalStudentsElem = el('total-students');
    const presentCountElem = el('present-count');
    const absentCountElem = el('absent-count');
    const completionPctElem = el('completion-pct');
    const progressFill = el('progress-fill');
    const studentTableBody = el('student-table-body');
    const saveAttendanceBtn = el('save-attendance-btn');
    const backBtn = el('back-btn');
    const printBtn = el('print-btn');
    const alertDiv = el('attendance-alert');
    const searchInput = el('search-student');
    const filterStatus = el('filter-status');


    el('logged-in-user').textContent = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';
    el('header-sub').textContent = `${subject.name} · ${day}`;
    el('info-subject').textContent = subject.name;
    el('info-time').textContent = `${formatTime12(subject.start)} – ${formatTime12(subject.end)}`;
    el('info-batch').textContent = batch ? BATCH_LABELS[batch] : 'All Students (Both Batches)';
    el('info-date').textContent = formatDateLong(sessionDate);

    function updateClock() {
        el('current-time').textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 30000);

    themeToggle.querySelector('i').className = document.documentElement.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.addEventListener('click', () => {
        const next = toggleTheme();
        themeToggle.querySelector('i').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    function renderTable() {
        if (filteredStudents.length === 0) {
            studentTableBody.innerHTML = `
                <tr><td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-magnifying-glass"></i>
                        <h4>No students found</h4>
                        <p>Try a different search term or filter.</p>
                    </div>
                </td></tr>`;
            return;
        }
        studentTableBody.innerHTML = filteredStudents.map((student, i) => {
            const statusClass = student.attendance === true ? 'status-present' : student.attendance === false ? 'status-absent' : 'status-pending';
            const statusText = student.attendance === true ? 'Present' : student.attendance === false ? 'Absent' : 'Pending';
            return `
                <tr style="animation-delay:${i * 25}ms">
                    <td>${i + 1}</td>
                    <td>
                        <div class="student-name">${student.name}</div>
                        <div class="student-meta">${BATCH_LABELS[student.batch]}</div>
                    </td>
                    <td class="enroll-code">${student.enrollmentNo}</td>
                    <td><span class="course-pill">${student.course}</span></td>
                    <td><span class="status-pill ${statusClass}"><i class="fas fa-circle" style="font-size:6px;"></i> ${statusText}</span></td>
                    <td>
                        <div class="mark-toggle">
                            <button class="mark-btn present-btn ${student.attendance === true ? 'active' : ''}" data-id="${student.id}" data-value="true" title="Mark present"><i class="fas fa-check"></i></button>
                            <button class="mark-btn absent-btn ${student.attendance === false ? 'active' : ''}" data-id="${student.id}" data-value="false" title="Mark absent"><i class="fas fa-xmark"></i></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        studentTableBody.querySelectorAll('.mark-btn').forEach((btn) => {
            btn.addEventListener('click', () => markAttendance(Number(btn.dataset.id), btn.dataset.value === 'true'));
        });
    }

    function updateStatistics() {
        const total = students.length;
        const present = students.filter((s) => s.attendance === true).length;
        const absent = students.filter((s) => s.attendance === false).length;
        const pending = total - present - absent;

        animateCount(totalStudentsElem, total);
        animateCount(presentCountElem, present);
        animateCount(absentCountElem, absent);

        const pct = total > 0 ? Math.round(((present + absent) / total) * 100) : 0;
        completionPctElem.textContent = `${pct}%`;
        progressFill.style.width = `${pct}%`;
    }

    function checkAllMarked() {
        const pending = students.filter((s) => s.attendance === null).length;
        if (pending === 0 && students.length > 0) {
            saveAttendanceBtn.disabled = false;
            hideAlert();
        } else {
            saveAttendanceBtn.disabled = true;
            if (pending > 0) showAlert(`${pending} student(s) still pending. Mark everyone before saving.`, 'warning');
        }
    }

    function persistDraft() {
        Store.set(STORAGE_KEYS.DRAFT, { key: draftKey, students });
    }

    function applyFilters() {
        const term = searchInput.value.trim().toLowerCase();
        const statusFilter = filterStatus.value;
        filteredStudents = students.filter((s) => {
            const statusWord = s.attendance === true ? 'present' : s.attendance === false ? 'absent' : 'pending';
            const matchesTerm = !term ||
                s.name.toLowerCase().includes(term) ||
                s.enrollmentNo.toLowerCase().includes(term) ||
                s.course.toLowerCase().includes(term) ||
                statusWord.includes(term);
            const matchesStatus = statusFilter === 'all' || statusFilter === statusWord;
            return matchesTerm && matchesStatus;
        });
        renderTable();
    }


    function markAttendance(studentId, isPresent, { recordHistory = true } = {}) {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;
        if (recordHistory) history.push({ id: studentId, previous: student.attendance });
        student.attendance = isPresent;
        unsavedChanges = true;

        applyFilters();
        updateStatistics();
        checkAllMarked();
        persistDraft();
    }

    function markAll(isPresent) {
        history.push({ bulk: true, previous: students.map((s) => ({ id: s.id, attendance: s.attendance })) });
        students.forEach((s) => { s.attendance = isPresent; });
        unsavedChanges = true;
        applyFilters();
        updateStatistics();
        checkAllMarked();
        persistDraft();
        showToast(`All students marked ${isPresent ? 'present' : 'absent'}.`, 'info');
    }

    function undoLast() {
        const last = history.pop();
        if (!last) {
            showToast('Nothing to undo.', 'warning');
            return;
        }
        if (last.bulk) {
            last.previous.forEach(({ id, attendance }) => {
                const s = students.find((st) => st.id === id);
                if (s) s.attendance = attendance;
            });
        } else {
            const s = students.find((st) => st.id === last.id);
            if (s) s.attendance = last.previous;
        }
        unsavedChanges = true;
        applyFilters();
        updateStatistics();
        checkAllMarked();
        persistDraft();
        showToast('Last action undone.', 'info');
    }

    function resetAttendance() {
        history.push({ bulk: true, previous: students.map((s) => ({ id: s.id, attendance: s.attendance })) });
        students.forEach((s) => { s.attendance = null; });
        unsavedChanges = true;
        applyFilters();
        updateStatistics();
        checkAllMarked();
        persistDraft();
        showToast('Attendance reset. Start marking again.', 'warning');
    }


    function showAlert(message, type = 'info') {
        alertDiv.className = `alert alert-${type}`;
        alertDiv.querySelector('#alert-message').textContent = message;
        alertDiv.style.display = 'flex';
    }
    function hideAlert() { alertDiv.style.display = 'none'; }


    function preparePrintReport() {
        const present = students.filter((s) => s.attendance === true).length;
        const absent = students.filter((s) => s.attendance === false).length;
        const total = students.length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;

        el('print-college').textContent = COLLEGE_NAME;
        el('print-subject').textContent = subject.name;
        el('print-faculty').textContent = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';
        el('print-date').textContent = formatDateLong(sessionDate);
        el('print-time').textContent = `${formatTime12(subject.start)} – ${formatTime12(subject.end)}`;
        el('print-batch').textContent = batch ? BATCH_LABELS[batch] : 'All Students (Both Batches)';
        el('print-total').textContent = total;
        el('print-present').textContent = present;
        el('print-absent').textContent = absent;
        el('print-percentage').textContent = `${pct}%`;

        el('print-table-body').innerHTML = students.map((s, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${s.enrollmentNo}</td>
                <td>${s.name}</td>
                <td>${s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending'}</td>
            </tr>`).join('');
    }

    printBtn.addEventListener('click', () => {
        preparePrintReport();
        window.print();
    });


    const confirmOverlay = el('confirm-overlay');
    const successOverlay = el('success-overlay');

    saveAttendanceBtn.addEventListener('click', () => {
        confirmOverlay.classList.add('show');
    });
    el('confirm-cancel').addEventListener('click', () => confirmOverlay.classList.remove('show'));
    el('confirm-ok').addEventListener('click', () => {
        confirmOverlay.classList.remove('show');
        saveAttendance();
    });

    function saveAttendance() {
        const originalText = saveAttendanceBtn.innerHTML;
        saveAttendanceBtn.innerHTML = '<span class="spinner"></span> Saving…';
        saveAttendanceBtn.disabled = true;

        setTimeout(() => {
            const present = students.filter((s) => s.attendance === true).length;
            const absent = students.filter((s) => s.attendance === false).length;
            const total = students.length;

            const record = {
                id: Date.now(),
                subject: subject.name,
                type: subject.type,
                timing: `${formatTime12(subject.start)} – ${formatTime12(subject.end)}`,
                day,
                batch,
                batchLabel: batch ? BATCH_LABELS[batch] : 'All Students',
                faculty: localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher',
                date: sessionDate,
                students,
                summary: { total, present, absent, percentage: total > 0 ? Math.round((present / total) * 100) : 0 },
                savedAt: new Date().toISOString(),
            };

            const records = Store.get(STORAGE_KEYS.RECORDS, []);
            records.push(record);
            Store.set(STORAGE_KEYS.RECORDS, records);

            Store.remove(STORAGE_KEYS.DRAFT);
            unsavedChanges = false;

            successOverlay.classList.add('show');

            setTimeout(() => {
                Store.clearSession();
                window.location.href = 'subject.html';
            }, 1800);
        }, 1100);
    }


    searchInput.addEventListener('input', debounce(applyFilters, 150));
    filterStatus.addEventListener('change', applyFilters);
    el('mark-all-present').addEventListener('click', () => markAll(true));
    el('mark-all-absent').addEventListener('click', () => markAll(false));
    el('undo-action').addEventListener('click', undoLast);
    el('reset-attendance').addEventListener('click', resetAttendance);

    backBtn.addEventListener('click', () => {
        if (unsavedChanges && !confirm('You have unsaved attendance marks. Leave this page anyway?')) return;
        window.location.href = 'subject.html';
    });

    window.addEventListener('beforeunload', (e) => {
        if (unsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === 'p') printBtn.click();
        if (e.key === 's' && !saveAttendanceBtn.disabled) saveAttendanceBtn.click();
        if (e.key === '/') { e.preventDefault(); searchInput.focus(); }
    });

  
    applyFilters();
    updateStatistics();
    checkAllMarked();
    showToast(`Roster loaded: ${students.length} student(s).`, 'info');
});