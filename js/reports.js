document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));

    if (!requireLogin('index.html')) return;

    el('logged-in-user').textContent = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';

    const themeToggle = el('theme-toggle');
    themeToggle.querySelector('i').className = document.documentElement.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.addEventListener('click', () => {
        const next = toggleTheme();
        themeToggle.querySelector('i').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    function el(id) { return document.getElementById(id); }

    const records = Store.get(STORAGE_KEYS.RECORDS, []).slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    const recordsList = el('records-list');
    const filterDate = el('filter-date');
    const filterSubject = el('filter-subject');
    const filterBatch = el('filter-batch');

    const subjectNames = [...new Set(records.map((r) => r.subject))];
    subjectNames.forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        filterSubject.appendChild(opt);
    });

    function matchesFilters(record) {
        const dateOk = !filterDate.value || record.date.slice(0, 10) === filterDate.value;
        const subjectOk = filterSubject.value === 'all' || record.subject === filterSubject.value;
        const batchOk = filterBatch.value === 'all' || String(record.batch) === filterBatch.value;
        return dateOk && subjectOk && batchOk;
    }

    function render() {
        const visible = records.filter(matchesFilters);
        if (visible.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h4>No attendance records found</h4>
                    <p>Save an attendance session, or adjust your filters.</p>
                </div>`;
            return;
        }
        recordsList.innerHTML = visible.map((r) => `
            <div class="record-card" data-id="${r.id}">
                <div class="record-main">
                    <div class="record-title">${r.subject} <span class="course-pill">${r.type}</span></div>
                    <div class="record-sub">${formatDateLong(r.date)} · ${r.timing} · ${r.batchLabel} · Faculty: ${r.faculty}</div>
                </div>
                <div class="record-stats">
                    <span>Total <b>${r.summary.total}</b></span>
                    <span style="color:var(--success)">Present <b>${r.summary.present}</b></span>
                    <span style="color:var(--danger)">Absent <b>${r.summary.absent}</b></span>
                    <span>Attendance <b>${r.summary.percentage}%</b></span>
                </div>
                <div class="bulk-actions">
                    <button class="btn btn-outline btn-sm ripple" data-action="print" data-id="${r.id}"><i class="fas fa-print"></i> Print</button>
                    <button class="btn btn-outline btn-sm ripple" data-action="csv" data-id="${r.id}"><i class="fas fa-file-csv"></i> CSV</button>
                </div>
            </div>
        `).join('');

        recordsList.querySelectorAll('[data-action="print"]').forEach((btn) => {
            btn.addEventListener('click', () => printRecord(findRecord(btn.dataset.id)));
        });
        recordsList.querySelectorAll('[data-action="csv"]').forEach((btn) => {
            btn.addEventListener('click', () => exportRecordCsv(findRecord(btn.dataset.id)));
        });
    }

    function findRecord(id) {
        return records.find((r) => String(r.id) === String(id));
    }

    function printRecord(r) {
        if (!r) return;
        el('print-college').textContent = COLLEGE_NAME;
        el('print-subject').textContent = r.subject;
        el('print-faculty').textContent = r.faculty;
        el('print-date').textContent = formatDateLong(r.date);
        el('print-time').textContent = r.timing;
        el('print-batch').textContent = r.batchLabel;
        el('print-total').textContent = r.summary.total;
        el('print-present').textContent = r.summary.present;
        el('print-absent').textContent = r.summary.absent;
        el('print-percentage').textContent = `${r.summary.percentage}%`;
        el('print-table-body').innerHTML = r.students.map((s, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${s.enrollmentNo}</td>
                <td>${s.name}</td>
                <td>${s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending'}</td>
            </tr>`).join('');
        window.print();
    }

    function toCsvRows(record) {
        const rows = [['Enrollment No.', 'Student Name', 'Course', 'Status']];
        record.students.forEach((s) => {
            rows.push([s.enrollmentNo, s.name, s.course, s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending']);
        });
        return rows;
    }

    function downloadCsv(filename, rows) {
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function exportRecordCsv(r) {
        if (!r) return;
        downloadCsv(`attendance_${r.subject.replace(/\s+/g, '_')}_${r.date.slice(0, 10)}.csv`, toCsvRows(r));
        showToast('CSV downloaded.', 'success');
    }

    el('export-all-csv').addEventListener('click', () => {
        const visible = records.filter(matchesFilters);
        if (visible.length === 0) {
            showToast('No records to export.', 'warning');
            return;
        }
        const rows = [['Date', 'Subject', 'Batch', 'Faculty', 'Enrollment No.', 'Student Name', 'Course', 'Status']];
        visible.forEach((r) => {
            r.students.forEach((s) => {
                rows.push([
                    r.date.slice(0, 10), r.subject, r.batchLabel, r.faculty,
                    s.enrollmentNo, s.name, s.course,
                    s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending',
                ]);
            });
        });
        downloadCsv('attendance_report_export.csv', rows);
        showToast('All matching records exported to CSV.', 'success');
    });

    filterDate.addEventListener('change', render);
    filterSubject.addEventListener('change', render);
    filterBatch.addEventListener('change', render);
    el('clear-filters').addEventListener('click', () => {
        filterDate.value = '';
        filterSubject.value = 'all';
        filterBatch.value = 'all';
        render();
    });

    el('back-btn').addEventListener('click', () => { window.location.href = 'subject.html'; });

    render();
});