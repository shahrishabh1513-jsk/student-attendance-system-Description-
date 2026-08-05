document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    attachRipple();
    setupScrollToTop(document.getElementById('scroll-top'));

    if (!requireLogin('index.html')) return;

    wireAppNav();

    function el(id) { return document.getElementById(id); }

    let records = Store.get(STORAGE_KEYS.RECORDS, []).slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    const recordsList = el('records-list');
    const filterDate = el('filter-date');
    const filterSubject = el('filter-subject');
    const filterBatch = el('filter-batch');
    const detailPanel = el('record-detail');

    // Populate subject filter dynamically from saved records
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

    // Accepts either a "HH:MM" (24h) string, or a "H:MM AM/PM" display string
    // from older saved records, and always returns 24h "HH:MM".
    function toTwentyFourHour(value) {
        if (!value) return '';
        const ampmMatch = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (ampmMatch) {
            let [, hh, mm, period] = ampmMatch;
            hh = Number(hh);
            if (period.toUpperCase() === 'PM' && hh !== 12) hh += 12;
            if (period.toUpperCase() === 'AM' && hh === 12) hh = 0;
            return `${String(hh).padStart(2, '0')}:${mm}`;
        }
        return value; // already 24h "HH:MM"
    }

    function findRecord(id) {
        return records.find((r) => String(r.id) === String(id));
    }

    /* ------------------------------ sample/demo data ------------------------------ */
    /* A quick way to see the Reports page in action (for testing or demos)
       without having to complete a full attendance session first. */

    function generateSampleRecords() {
        const scenarios = [
            { name: 'Augmented Reality & Virtual Reality', type: 'Theory', start: '09:50', end: '10:45', day: 'Tuesday', batch: 0 },
            { name: 'Image Processing Lab', type: 'Lab', start: '13:30', end: '15:20', day: 'Tuesday', batch: 1 },
            { name: 'Cryptography & Network Security Lab', type: 'Lab', start: '10:45', end: '12:35', day: 'Wednesday', batch: 2 },
            { name: 'DevOps & Agile Foundation', type: 'Theory', start: '11:40', end: '12:35', day: 'Thursday', batch: 0 },
        ];
        const faculty = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Teacher';
        return scenarios.map((s, i) => {
            const roster = (s.batch === 1 || s.batch === 2) ? STUDENTS.filter((st) => st.batch === s.batch) : STUDENTS.slice();
            const date = new Date();
            date.setDate(date.getDate() - i); // spread across the last few days
            const studentsWithAttendance = roster.map((st, idx) => ({ ...st, attendance: idx % 6 === 0 ? false : true }));
            const present = studentsWithAttendance.filter((s2) => s2.attendance === true).length;
            const absent = studentsWithAttendance.filter((s2) => s2.attendance === false).length;
            const total = studentsWithAttendance.length;
            return {
                id: Date.now() + i,
                subject: s.name,
                type: s.type,
                timing: `${formatTime12(s.start)} – ${formatTime12(s.end)}`,
                start: s.start,
                end: s.end,
                day: s.day,
                batch: s.batch,
                batchLabel: s.batch ? BATCH_LABELS[s.batch] : 'All Students',
                faculty,
                date: date.toISOString(),
                students: studentsWithAttendance,
                summary: { total, present, absent, percentage: total > 0 ? Math.round((present / total) * 100) : 0 },
                savedAt: date.toISOString(),
            };
        });
    }

    function wireSampleDataButton() {
        const btn = document.getElementById('load-sample-data-btn');
        if (!btn) return;
        attachRipple(recordsList);
        btn.addEventListener('click', () => {
            const sample = generateSampleRecords();
            const merged = Store.get(STORAGE_KEYS.RECORDS, []).concat(sample);
            Store.set(STORAGE_KEYS.RECORDS, merged);
            records = merged.slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

            const existingOptions = new Set([...filterSubject.options].map((o) => o.value));
            [...new Set(records.map((r) => r.subject))].forEach((name) => {
                if (!existingOptions.has(name)) {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    filterSubject.appendChild(opt);
                }
            });

            showToast(`Loaded ${sample.length} sample attendance record(s).`, 'success');
            render();
        });
    }

    /* ------------------------------ list render ------------------------------ */

    function render() {
        const visible = records.filter(matchesFilters);

        if (records.length === 0) {
            // Truly no saved sessions yet — this is either normal (first time
            // use) or a sign that localStorage isn't being shared between
            // pages (common when opening the files directly instead of via
            // a local server). Give a clear, actionable explanation either way.
            recordsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h4>No attendance records yet</h4>
                    <p>Nothing has been saved on this device yet. Take attendance from the Timetable page and it will show up here automatically.</p>
                    <p style="margin-top:10px; font-size:11.5px; color:var(--text-faint);">
                        Already saved one and don't see it? Make sure you're opening this site through a local web server (not by double-clicking the HTML file) and that your browser isn't in private/incognito mode — both can stop pages from sharing local storage.
                    </p>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:6px;">
                    <a class="btn btn-primary ripple" href="subject.html"><i class="fas fa-calendar-days"></i> Take Attendance Now</a>
                    <button class="btn btn-outline ripple" id="load-sample-data-btn"><i class="fas fa-flask"></i> Load Sample Data</button>
                </div>`;
            wireSampleDataButton();
            return;
        }

        if (visible.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter-circle-xmark"></i>
                    <h4>No records match your filters</h4>
                    <p>You have ${records.length} saved session(s) total — try clearing the filters above.</p>
                </div>
                <div style="display:flex; justify-content:center;">
                    <button class="btn btn-outline ripple" id="clear-filters-inline-btn"><i class="fas fa-rotate-left"></i> Clear Filters</button>
                </div>`;
            const clearBtn = document.getElementById('clear-filters-inline-btn');
            if (clearBtn) clearBtn.addEventListener('click', () => document.getElementById('clear-filters').click());
            attachRipple(recordsList);
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
                    <button class="btn btn-outline btn-sm ripple" data-action="view" data-id="${r.id}"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-outline btn-sm ripple" data-action="print" data-id="${r.id}"><i class="fas fa-print"></i> Print</button>
                    <button class="btn btn-outline btn-sm ripple" data-action="share" data-id="${r.id}"><i class="fas fa-share-nodes"></i> Share</button>
                    <button class="btn btn-outline btn-sm ripple" data-action="csv" data-id="${r.id}"><i class="fas fa-file-csv"></i> CSV</button>
                </div>
            </div>
        `).join('');

        recordsList.querySelectorAll('[data-action="view"]').forEach((btn) => {
            btn.addEventListener('click', () => openDetail(btn.dataset.id, { scroll: true }));
        });
        recordsList.querySelectorAll('[data-action="print"]').forEach((btn) => {
            btn.addEventListener('click', () => printRecord(findRecord(btn.dataset.id)));
        });
        recordsList.querySelectorAll('[data-action="share"]').forEach((btn) => {
            btn.addEventListener('click', () => ShareReport.openModal(() => findRecord(btn.dataset.id)));
        });
        recordsList.querySelectorAll('[data-action="csv"]').forEach((btn) => {
            btn.addEventListener('click', () => exportRecordCsv(findRecord(btn.dataset.id)));
        });
    }

    /* ------------------------------ detail panel ------------------------------ */

    let activeRecordId = null;

    function openDetail(id, { scroll = false } = {}) {
        const r = findRecord(id);
        if (!r) {
            showToast('That attendance record could not be found.', 'error');
            return;
        }
        activeRecordId = r.id;

        el('detail-subject').textContent = `${r.subject} (${r.type})`;
        el('detail-meta').textContent = `${formatDateLong(r.date)} · ${r.timing} · ${r.batchLabel} · Faculty: ${r.faculty}`;
        el('detail-total').textContent = r.summary.total;
        el('detail-present').textContent = r.summary.present;
        el('detail-absent').textContent = r.summary.absent;
        el('detail-percentage').textContent = `${r.summary.percentage}%`;

        el('detail-table-body').innerHTML = r.students.map((s) => {
            const statusClass = s.attendance === true ? 'status-present' : s.attendance === false ? 'status-absent' : 'status-pending';
            const statusText = s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending';
            return `
                <tr>
                    <td>
                        <div class="student-name">${s.name}</div>
                        <div class="student-meta">${BATCH_LABELS[s.batch]}</div>
                    </td>
                    <td class="enroll-code">${s.enrollmentNo}</td>
                    <td><span class="status-pill ${statusClass}"><i class="fas fa-circle" style="font-size:6px;"></i> ${statusText}</span></td>
                </tr>`;
        }).join('');

        detailPanel.style.display = 'block';
        if (scroll) detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    el('detail-close').addEventListener('click', () => {
        detailPanel.style.display = 'none';
        activeRecordId = null;
        // Clean the ?record= param out of the URL without reloading.
        const url = new URL(window.location.href);
        url.searchParams.delete('record');
        window.history.replaceState({}, '', url);
    });

    el('detail-print').addEventListener('click', () => {
        if (activeRecordId) printRecord(findRecord(activeRecordId));
    });

    el('detail-share').addEventListener('click', () => {
        if (activeRecordId) ShareReport.openModal(() => findRecord(activeRecordId));
    });

    el('detail-edit').addEventListener('click', () => {
        const r = findRecord(activeRecordId);
        if (!r) return;
        // Hand this record's data to the attendance page as an editable draft.
        const draftKey = `${r.subject}|${r.day}|${r.batch}|${String(r.date).slice(0, 10)}`;
        // Older records (saved before this field existed) fall back to parsing the display string.
        const fallbackParts = String(r.timing || '').split(' – ');
        const rawStart = r.start || toTwentyFourHour(fallbackParts[0]) || '';
        const rawEnd = r.end || toTwentyFourHour(fallbackParts[1]) || '';
        Store.set(STORAGE_KEYS.SUBJECT, { name: r.subject, type: r.type, start: rawStart, end: rawEnd });
        Store.set(STORAGE_KEYS.DAY, r.day);
        Store.set(STORAGE_KEYS.BATCH, r.batch);
        localStorage.setItem(STORAGE_KEYS.DATE, r.date);
        Store.set(STORAGE_KEYS.DRAFT, { key: draftKey, students: r.students });
        Store.set(STORAGE_KEYS.EDIT_RECORD, r.id);
        window.location.href = 'student.html';
    });

    /* ------------------------------ print + export ------------------------------ */

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

        // Absent students get a red boxed name; everyone else stays plain.
        el('print-table-body').innerHTML = r.students.map((s, i) => {
            const isAbsent = s.attendance === false;
            const statusLabel = s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending';
            const statusClass = s.attendance === true ? 'print-status-present' : s.attendance === false ? 'print-status-absent' : 'print-status-pending';
            const nameHtml = isAbsent
                ? `<span class="print-name-absent">${s.name}</span>`
                : `<span class="print-name-plain">${s.name}</span>`;
            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${s.enrollmentNo}</td>
                    <td class="print-name-cell">${nameHtml}</td>
                    <td class="${statusClass}">${statusLabel}</td>
                </tr>`;
        }).join('');
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

    /* ------------------------------ wiring ------------------------------ */

    filterDate.addEventListener('change', render);
    filterSubject.addEventListener('change', render);
    filterBatch.addEventListener('change', render);
    el('clear-filters').addEventListener('click', () => {
        filterDate.value = '';
        filterSubject.value = 'all';
        filterBatch.value = 'all';
        render();
    });

    el('refresh-records-btn').addEventListener('click', () => {
        records = Store.get(STORAGE_KEYS.RECORDS, []).slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        const existingOptions = new Set([...filterSubject.options].map((o) => o.value));
        [...new Set(records.map((r) => r.subject))].forEach((name) => {
            if (!existingOptions.has(name)) {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                filterSubject.appendChild(opt);
            }
        });
        showToast(records.length > 0 ? `Refreshed — ${records.length} record(s) found.` : 'Refreshed — no records found in storage.', 'info');
        render();
    });

    render();

    // Arriving here right after Save (or via a "View" link) opens the record automatically.
    const params = new URLSearchParams(window.location.search);
    const recordParam = params.get('record');
    if (recordParam) {
        openDetail(recordParam, { scroll: true });
        if (!findRecord(recordParam)) {
            showToast('That attendance session could not be found — it may have been removed.', 'warning');
        } else {
            showToast('Attendance saved. Review it below, or edit if anything needs a fix.', 'success');
        }
    }
});