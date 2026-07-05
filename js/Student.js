document.addEventListener('DOMContentLoaded', function () {
    // Check login + selection
    const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
    const selectedSubject = JSON.parse(localStorage.getItem('attendanceSubject') || 'null');
    const selectedTimeSlot = JSON.parse(localStorage.getItem('attendanceTimeSlot') || 'null');

    if (isLoggedIn !== 'true' || !selectedSubject || !selectedTimeSlot) {
        window.location.href = 'subject.html';
        return;
    }

    // ---------------- DOM elements ----------------
    const attendanceInfo = document.getElementById('attendance-info');
    const studentTableBody = document.getElementById('student-table-body');
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    const printAttendanceBtn = document.getElementById('print-attendance-btn');
    const backBtn = document.getElementById('back-btn');
    const alertDiv = document.getElementById('attendance-alert');
    const searchInput = document.getElementById('search-student');

    const totalStudentsElem = document.getElementById('total-students');
    const presentCountElem = document.getElementById('present-count');
    const absentCountElem = document.getElementById('absent-count');
    const pendingCountElem = document.getElementById('pending-count');

    const loggedInUser = document.getElementById('logged-in-user');
    const currentDateElem = document.getElementById('current-date');
    const currentTimeElem = document.getElementById('current-time');

    const reportModal = document.getElementById('report-modal');
    const printableReportBody = document.getElementById('printable-report-body');
    const closeReportBtn = document.getElementById('close-report-btn');
    const cancelReportBtn = document.getElementById('cancel-report-btn');
    const confirmPrintBtn = document.getElementById('confirm-print-btn');

    const isLab = !!selectedTimeSlot.isLab;

    // ---------------- Semester 7 student roster ----------------
    // Batch 1 - BCA (23SS02CA...) students
    const batch1Raw = [
        ["23SS02CA001", "GAUTAM G.A. ANAND MURTHY G.S."],
        ["23SS02CA002", "AGHERA DHRUVIBEN NAVNEETBHAI"],
        ["23SS02CA007", "BARAD TRUSHA KIRANKUMAR"],
        ["23SS02CA017", "CHAUDHARI HARDIK RAVJIBHAI"],
        ["23SS02CA027", "AMANKUMAR RAMESHCHAND GAUTAM"],
        ["23SS02CA051", "MANIYA HASTIBEN JITESHBHAI"],
        ["23SS02CA060", "PARMAR KRISHRAJSINH YOGENDRASINH"],
        ["23SS02CA064", "VIKASH GIRAJASHANKAR PASWAN"],
        ["23SS02CA065", "DHRUV KUMAR PATEL"],
        ["23SS02CA066", "PATEL ANKIT PRADIP"],
        ["23SS02CA074", "RAJVI PRASAD"],
        ["23SS02CA077", "RUPAVATIYA HARSH RAJESHBHAI"],
        ["23SS02CA078", "SAIYED ISMA ZULFIKARALI"],
        ["23SS02CA084", "SHAILESH SANTOSHBHAI AGRAWAL"],
        ["23SS02CA085", "SHARBIDRE GAURAV RAJESH SHASHIKANT"],
        ["23SS02CA089", "SINGH SAURABH AJITSINGH"],
        ["23SS02CA090", "SINGH GULSHANKUMAR RAMCHARITRA"],
        ["23SS02CA093", "JAIMISH M SOLANKI"],
        ["23SS02CA098", "AYUSHMAN TRIPATHI"],
        ["23SS02CA104", "MITUL SANJAY VASOYA"],
        ["23SS02CA118", "AHIR NEEL RAJESHBHAI"],
        ["23SS02CA119", "MALEK NOORFATIMA SALAUDDIN"],
        ["24IC08CA002", "KHAN IQRAR MO. IBRAR"]
    ];

    // Batch 2 - B.Sc. IT (23SS02IT...) students
    const batch2Raw = [
        ["23SS02IT007", "ANAGHAN KRUNAL BHARATBHAI"],
        ["23SS02IT014", "BHAIDU SADIYA SHABBIR"],
        ["23SS02IT018", "KAKADIYA BANSARIBEN BHAVESHBHAI"],
        ["23SS02IT034", "CHAUHAN VISHWABEN ASHWINSINH"],
        ["23SS02IT038", "KRISH DESAI"],
        ["23SS02IT061", "GEHLOT BHUMIN KAMLESHBHAI"],
        ["23SS02IT067", "GOLAKIYA KEVINS SHAILESH BHAI"],
        ["23SS02IT068", "GOYANI NANDISH RAMESHBHAI"],
        ["23SS02IT069", "GUJARATI HARSHIL PARESHKUMAR"],
        ["23SS02IT075", "RAMANI VINAS HASMUKHBHAI"],
        ["23SS02IT078", "ITALIYA PRIYANSHI PRAVINBHAI"],
        ["23SS02IT083", "PATEL RIYAKUMARI JITENDRABHAI"],
        ["23SS02IT093", "TANMAY KHENI"],
        ["23SS02IT094", "KHUNT AYUSHKUMAR PRAFULBHAI"],
        ["23SS02IT107", "LATHIYA KHUSH DEVRAJBHAI"],
        ["23SS02IT117", "MAVANI KRISH MAHESHBHAI"],
        ["23SS02IT122", "MORADIYA OM BHARATBHAI"],
        ["23SS02IT137", "PATEL KHUSHUBU VASANTKUMAR"],
        ["23SS02IT141", "PATEL SHREYA DHARMESHBHAI"],
        ["23SS02IT150", "PATEL KRINA SANJAYBHAI"],
        ["23SS02IT153", "PATEL CHAITANYAKUMAR BHUPENDRABHAI"],
        ["23SS02IT154", "KHUSHI PATEL"],
        ["23SS02IT156", "DHOLARIYA ARSHITABEN PRAKASHBHAI"],
        ["23SS02IT157", "PUROHIT PARTHKUMAR ANILBHAI"],
        ["23SS02IT159", "RADDADIYA ISHITABEN BHAVESHBHAI"],
        ["23SS02IT160", "RAJ JAYDEEPSINH MAHENDRASINH"],
        ["23SS02IT165", "RAKHOLIYA KRISHNA RAJNIKANT"],
        ["23SS02IT166", "RAKHOLIYA TUSHAR GIRDHARBHAI"],
        ["23SS02IT181", "SHAH RISHABH ALPESHBHAI"],
        ["23SS02IT185", "SINGH VISHAL VIRENDER"],
        ["23SS02IT187", "PATEL DEVAN SUNIL"],
        ["23SS02IT188", "SUTARIYA JAY NARESHBHAI"],
        ["23SS02IT197", "VANANI MILAN HARIBHAI"],
        ["23SS02IT218", "PARMAR DHRUVI BALVANTSINH"],
        ["23SS02IT219", "NOORMOHMMED"],
        ["23SS02IT222", "VARUN MANOJBHAI VAGHASIYA"],
        ["23SS02IT238", "MAVANI ARCHI JITENDRABHAI"],
        ["23SS02IT240", "SHAKIB AHMED MOHAMMAD FARUK BHOR"],
        ["23SS02IT242", "JASANI SNEHA KALPESHBHAI"]
    ];

    function buildStudents() {
        let id = 1;
        const batch1 = batch1Raw.map(([enrollmentNo, name]) => ({
            id: id++, enrollmentNo, name, batch: 'Batch 1 – BCA', attendance: null
        }));
        const batch2 = batch2Raw.map(([enrollmentNo, name]) => ({
            id: id++, enrollmentNo, name, batch: 'Batch 2 – B.Sc. IT', attendance: null
        }));
        return { batch1, batch2, all: [...batch1, ...batch2] };
    }

    const roster = buildStudents();
    let students = [...roster.all];
    let filteredStudents = [...students];

    // ---------------- Init ----------------
    function init() {
        const username = localStorage.getItem('attendanceUsername') || 'Teacher';
        loggedInUser.textContent = username;

        updateDateTime();
        setInterval(updateDateTime, 60000);

        loadAttendanceInfo();
        setupEventListeners();

        renderStudentTable();
        updateStatistics();
        checkAllMarked();
    }

    function updateDateTime() {
        const now = new Date();
        currentDateElem.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        currentTimeElem.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    }

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function loadAttendanceInfo() {
        const subject = selectedSubject;
        const timeSlot = selectedTimeSlot;
        const date = new Date(localStorage.getItem('attendanceDate') || new Date());

        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        attendanceInfo.innerHTML = `
            <h3 class="info-title">
                <i class="fas fa-info-circle"></i> Attendance Details
            </h3>
            <div class="info-details">
                <div class="detail-item">
                    <div class="detail-label">Subject</div>
                    <div class="detail-value">${subject.code} - ${subject.name}${isLab ? ' (Lab)' : ''}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Day</div>
                    <div class="detail-value">${timeSlot.day || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${formatTime(timeSlot.start)} - ${formatTime(timeSlot.end)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${formattedDate}</div>
                </div>
            </div>
        `;

        if (isLab) {
            showAlert(`Lab session — students are grouped batch-wise (${roster.batch1.length} + ${roster.batch2.length} students).`, 'info');
        } else {
            showAlert(`Mark attendance for all ${students.length} Semester 7 students.`, 'info');
        }
    }

    // ---------------- Table rendering ----------------
    function studentRowHtml(student, indexLabel) {
        const status = student.attendance === true ? 'status-present'
            : student.attendance === false ? 'status-absent' : 'status-pending';
        const statusText = student.attendance === true ? 'Present'
            : student.attendance === false ? 'Absent' : 'Pending';

        return `
            <tr>
                <td>${indexLabel}</td>
                <td>${student.name}</td>
                <td>${student.enrollmentNo}</td>
                <td>${student.batch}</td>
                <td><span class="attendance-status ${status}">${statusText}</span></td>
                <td>
                    <div class="attendance-actions">
                        <button class="btn-present ${student.attendance === true ? 'active' : ''}" data-id="${student.id}" data-present="true">
                            <i class="fas fa-check"></i> Present
                        </button>
                        <button class="btn-absent ${student.attendance === false ? 'active' : ''}" data-id="${student.id}" data-present="false">
                            <i class="fas fa-times"></i> Absent
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderStudentTable() {
        const searchTerm = searchInput.value.trim();
        let html = '';

        if (!isLab || searchTerm !== '') {
            // Flat list (non-lab, or while searching regardless of lab)
            if (filteredStudents.length === 0) {
                html = `<tr><td colspan="6" class="text-center py-4"><div class="text-muted">No students match your search.</div></td></tr>`;
            } else {
                filteredStudents.forEach((student, i) => {
                    html += studentRowHtml(student, i + 1);
                });
            }
        } else {
            // Batch-wise grouped view for lab sessions
            let counter = 1;
            [
                { label: `Batch 1 – BCA Students (${roster.batch1.length} Students)`, list: roster.batch1 },
                { label: `Batch 2 – B.Sc. IT Students (${roster.batch2.length} Students)`, list: roster.batch2 }
            ].forEach(group => {
                html += `<tr class="batch-row"><td colspan="6"><i class="fas fa-layer-group"></i> ${group.label}</td></tr>`;
                group.list.forEach(s => {
                    // Use the live reference from `students` so attendance state stays in sync
                    const live = students.find(st => st.id === s.id);
                    html += studentRowHtml(live, counter++);
                });
            });
        }

        studentTableBody.innerHTML = html;

        // Attach listeners
        studentTableBody.querySelectorAll('.btn-present, .btn-absent').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const present = this.getAttribute('data-present') === 'true';
                markAttendance(id, present);
            });
        });
    }

    function markAttendance(studentId, isPresent) {
        const idx = students.findIndex(s => s.id === studentId);
        if (idx !== -1) {
            students[idx].attendance = isPresent;
            const fIdx = filteredStudents.findIndex(s => s.id === studentId);
            if (fIdx !== -1) filteredStudents[fIdx].attendance = isPresent;

            renderStudentTable();
            updateStatistics();
            checkAllMarked();
        }
    }

    function updateStatistics() {
        const total = students.length;
        const present = students.filter(s => s.attendance === true).length;
        const absent = students.filter(s => s.attendance === false).length;
        const pending = students.filter(s => s.attendance === null).length;

        totalStudentsElem.textContent = total;
        presentCountElem.textContent = present;
        absentCountElem.textContent = absent;
        pendingCountElem.textContent = pending;
    }

    function checkAllMarked() {
        const pending = students.filter(s => s.attendance === null).length;
        if (pending === 0) {
            saveAttendanceBtn.disabled = false;
        } else {
            saveAttendanceBtn.disabled = true;
        }
    }

    // ---------------- Events ----------------
    function setupEventListeners() {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            filteredStudents = term === ''
                ? [...students]
                : students.filter(s =>
                    s.name.toLowerCase().includes(term) ||
                    s.enrollmentNo.toLowerCase().includes(term)
                );
            renderStudentTable();
        });

        saveAttendanceBtn.addEventListener('click', saveAttendance);
        printAttendanceBtn.addEventListener('click', openReport);

        closeReportBtn.addEventListener('click', closeReport);
        cancelReportBtn.addEventListener('click', closeReport);
        confirmPrintBtn.addEventListener('click', () => window.print());

        backBtn.addEventListener('click', function () {
            localStorage.removeItem('attendanceLoggedIn');
            localStorage.removeItem('attendanceUsername');
            localStorage.removeItem('attendanceSubject');
            localStorage.removeItem('attendanceTimeSlot');
            localStorage.removeItem('attendanceDate');
            window.location.href = 'index.html';
        });
    }

    function saveAttendance() {
        const originalText = saveAttendanceBtn.innerHTML;
        saveAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveAttendanceBtn.disabled = true;

        setTimeout(() => {
            const attendanceRecord = {
                id: Date.now(),
                subject: selectedSubject,
                timeSlot: selectedTimeSlot,
                date: new Date().toISOString(),
                students,
                summary: {
                    total: students.length,
                    present: students.filter(s => s.attendance === true).length,
                    absent: students.filter(s => s.attendance === false).length,
                    percentage: 0
                }
            };
            if (attendanceRecord.summary.total > 0) {
                attendanceRecord.summary.percentage = Math.round(
                    (attendanceRecord.summary.present / attendanceRecord.summary.total) * 100
                );
            }

            let records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
            records.push(attendanceRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(records));

            showAlert('Attendance saved successfully! Redirecting to login...', 'success');
            saveAttendanceBtn.innerHTML = originalText;

            localStorage.removeItem('attendanceLoggedIn');
            localStorage.removeItem('attendanceUsername');
            localStorage.removeItem('attendanceSubject');
            localStorage.removeItem('attendanceTimeSlot');
            localStorage.removeItem('attendanceDate');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }, 1200);
    }

    // ---------------- Print report ----------------
    function openReport() {
        const total = students.length;
        const present = students.filter(s => s.attendance === true).length;
        const absent = students.filter(s => s.attendance === false).length;
        const pending = students.filter(s => s.attendance === null).length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        const date = new Date(localStorage.getItem('attendanceDate') || new Date());
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const teacher = localStorage.getItem('attendanceUsername') || 'Teacher';

        function studentListHtml(list) {
            return list.map(s => {
                const status = s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending';
                const cls = s.attendance === true ? 'status-present' : s.attendance === false ? 'status-absent' : 'status-pending';
                return `
                    <div class="report-student-item">
                        <span>${s.enrollmentNo} — ${s.name}</span>
                        <span class="report-student-status ${cls}">${status}</span>
                    </div>
                `;
            }).join('');
        }

        let bodyHtml = `
            <div class="report-meta">
                <div><strong>Subject:</strong> ${selectedSubject.code} - ${selectedSubject.name}${isLab ? ' (Lab)' : ''}</div>
                <div><strong>Day / Time:</strong> ${selectedTimeSlot.day || ''} &nbsp;|&nbsp; ${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}</div>
                <div><strong>Date:</strong> ${formattedDate}</div>
                <div><strong>Faculty:</strong> ${teacher}</div>
            </div>

            <div class="report-summary">
                <div class="report-stat present">
                    <div class="report-stat-value">${present}</div>
                    <div class="report-stat-label">Present</div>
                </div>
                <div class="report-stat absent">
                    <div class="report-stat-value">${absent}</div>
                    <div class="report-stat-label">Absent</div>
                </div>
                <div class="report-stat percentage">
                    <div class="report-stat-value">${percentage}%</div>
                    <div class="report-stat-label">Attendance</div>
                </div>
            </div>
        `;

        if (pending > 0) {
            bodyHtml += `<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> ${pending} student(s) not yet marked — they will show as Pending in this report.</div>`;
        }

        if (isLab) {
            bodyHtml += `
                <div class="report-students">
                    <h3><i class="fas fa-layer-group"></i> Batch 1 – BCA Students (${roster.batch1.length})</h3>
                    <div class="report-students-list">${studentListHtml(students.filter(s => roster.batch1.some(b => b.id === s.id)))}</div>
                </div>
                <div class="report-students">
                    <h3><i class="fas fa-layer-group"></i> Batch 2 – B.Sc. IT Students (${roster.batch2.length})</h3>
                    <div class="report-students-list">${studentListHtml(students.filter(s => roster.batch2.some(b => b.id === s.id)))}</div>
                </div>
            `;
        } else {
            bodyHtml += `
                <div class="report-students">
                    <h3><i class="fas fa-users"></i> Student Attendance (${total})</h3>
                    <div class="report-students-list">${studentListHtml(students)}</div>
                </div>
            `;
        }

        printableReportBody.innerHTML = bodyHtml;
        reportModal.style.display = 'block';
    }

    function closeReport() {
        reportModal.style.display = 'none';
    }

    function showAlert(message, type = 'info') {
        alertDiv.className = `alert alert-${type}`;
        alertDiv.querySelector('#alert-message').textContent = message;
        alertDiv.style.display = 'flex';
    }

    init();
});