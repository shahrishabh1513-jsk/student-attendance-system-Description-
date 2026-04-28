document.addEventListener('DOMContentLoaded', function() {
    // ========== AUTHENTICATION & SESSION CHECK ==========
    const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
    const username = localStorage.getItem('attendanceUsername');
    const selectedSubject = JSON.parse(localStorage.getItem('attendanceSubject') || 'null');
    const selectedTimeSlot = JSON.parse(localStorage.getItem('attendanceTimeSlot') || 'null');
    
    if (isLoggedIn !== 'true' || !username || !selectedSubject || !selectedTimeSlot) {
        // Redirect to subject selection if not properly set up
        window.location.href = "subject.html";
        return;
    }

    // ========== DOM ELEMENTS ==========
    const classButtons = document.querySelectorAll('.btn-class');
    const studentTableBody = document.getElementById('student-table-body');
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    const backBtn = document.getElementById('back-btn');
    const alertDiv = document.getElementById('attendance-alert');
    const alertMessageSpan = document.getElementById('alert-message');
    const searchInput = document.getElementById('search-student');
    const markAllPresentBtn = document.getElementById('mark-all-present');
    const markAllAbsentBtn = document.getElementById('mark-all-absent');
    
    // Statistics elements
    const totalStudentsElem = document.getElementById('total-students');
    const presentCountElem = document.getElementById('present-count');
    const absentCountElem = document.getElementById('absent-count');
    const pendingCountElem = document.getElementById('pending-count');
    const attendanceProgress = document.getElementById('attendance-progress');
    
    // Display elements
    const selectedSubjectName = document.getElementById('selected-subject-name');
    const selectedLecture = document.getElementById('selected-lecture');
    const currentDateSpan = document.getElementById('current-date');
    const currentTimeSpan = document.getElementById('current-time');
    
    // ========== STATE VARIABLES ==========
    let students = [];
    let filteredStudents = [];
    let selectedClass = null;
    
    // ========== HELPER FUNCTIONS ==========
    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (currentDateSpan) {
            currentDateSpan.textContent = now.toLocaleDateString('en-US', options);
        }
        if (currentTimeSpan) {
            currentTimeSpan.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    }
    
    // ========== GENERATE STUDENT LISTS (80+ STUDENTS PER CLASS) ==========
    function generateStudentList(prefix, startRoll, count) {
        const firstNames = [
            "Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Arjun", "Reyansh", "Sai", "Advik", "Ishaan",
            "Myra", "Kabir", "Rohan", "Sneha", "Kavya", "Dhruv", "Yash", "Nidhi", "Parth", "Jiya",
            "Om", "Shreya", "Tanvi", "Krish", "Laksh", "Ved", "Anvi", "Ritika", "Samarth", "Ira",
            "Aryan", "Vanya", "Shaurya", "Prisha", "Yuvraj", "Aadhya", "Rudra", "Sara", "Ayaan", "Ishita",
            "Kiaan", "Anushka", "Shaan", "Mahira", "Reyansh", "Saanvi", "Atharv", "Pari", "Krishna", "Anaya"
        ];
        const lastNames = [
            "Patel", "Sharma", "Verma", "Reddy", "Joshi", "Gupta", "Singh", "Kumar", "Desai", "Mehta",
            "Shah", "Nair", "Iyer", "Malhotra", "Choudhary", "Yadav", "Jha", "Saxena", "Tripathi", "Rao"
        ];
        
        let students = [];
        for (let i = 1; i <= count; i++) {
            const fName = firstNames[i % firstNames.length];
            const lName = lastNames[i % lastNames.length];
            const name = `${fName} ${lName}`;
            const enrollmentNo = `${prefix}${String(1000 + startRoll + i).slice(-4)}`;
            students.push({ name, enrollmentNo });
        }
        return students;
    }
    
    // Generate 85+ students for each class
    const class5AStudents = generateStudentList("5A", 1, 87);
    const class5BStudents = generateStudentList("5B", 88, 85);
    const class5CStudents = generateStudentList("5C", 173, 89);
    
    const classData = {
        "5A": class5AStudents,
        "5B": class5BStudents,
        "5C": class5CStudents
    };
    
    // ========== UPDATE ATTENDANCE INFORMATION DISPLAY ==========
    function updateAttendanceInfo() {
        if (selectedSubject && selectedSubjectName) {
            selectedSubjectName.textContent = `${selectedSubject.code} - ${selectedSubject.name}`;
        }
        if (selectedLecture && selectedTimeSlot) {
            selectedLecture.textContent = `${selectedTimeSlot.lecture} (${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)})`;
        }
    }
    
    // ========== LOAD STUDENTS FOR SELECTED CLASS ==========
    function loadClassStudents(className) {
        const baseStudents = classData[className];
        const attendanceKey = `attendance_${className}_${selectedSubject.code}`;
        const savedAttendance = JSON.parse(localStorage.getItem(attendanceKey) || '{}');
        
        students = baseStudents.map((student, index) => {
            const nameParts = student.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts[1] || '';
            const initials = (firstName[0] + (lastName[0] || firstName[1] || 'S')).toUpperCase();
            
            return {
                id: index,
                srNo: index + 1,
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                classDivision: `BSc IT ${className}`,
                attendance: savedAttendance[student.enrollmentNo] !== undefined ? savedAttendance[student.enrollmentNo] : null,
                initials: initials
            };
        });
        
        filteredStudents = [...students];
        renderStudentTable();
        updateStatistics();
        checkAllMarked();
    }
    
    // ========== SAVE ATTENDANCE TO LOCALSTORAGE ==========
    function saveAttendanceToLocal() {
        const attendanceKey = `attendance_${selectedClass}_${selectedSubject.code}`;
        const attendanceData = {};
        students.forEach(student => {
            attendanceData[student.enrollmentNo] = student.attendance;
        });
        localStorage.setItem(attendanceKey, JSON.stringify(attendanceData));
    }
    
    // ========== RENDER STUDENT TABLE ==========
    function renderStudentTable() {
        if (!studentTableBody) return;
        
        studentTableBody.innerHTML = '';
        
        if (filteredStudents.length === 0) {
            studentTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-search" style="font-size: 2rem; color: var(--gray);"></i>
                        <p style="margin-top: 1rem; color: var(--gray);">No students found matching your search</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            
            let statusDisplay = '';
            if (student.attendance === true) {
                statusDisplay = '<span class="status-badge status-present"><i class="fas fa-check-circle"></i> Present</span>';
            } else if (student.attendance === false) {
                statusDisplay = '<span class="status-badge status-absent"><i class="fas fa-times-circle"></i> Absent</span>';
            } else {
                statusDisplay = '<span class="status-badge status-pending"><i class="fas fa-hourglass-half"></i> Pending</span>';
            }
            
            const presentBtnClass = student.attendance === true ? 'btn-present active' : 'btn-present';
            const absentBtnClass = student.attendance === false ? 'btn-absent active' : 'btn-absent';
            
            row.innerHTML = `
                <td style="font-weight: 600;">${student.srNo}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="brand-icon" style="width: 36px; height: 36px; font-size: 0.9rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            ${student.initials}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${student.name}</div>
                            <div style="font-size: 0.7rem; color: var(--gray);">Roll: ${student.srNo}</div>
                        </div>
                    </div>
                </td>
                <td><code style="background: var(--light-bg); padding: 4px 8px; border-radius: 6px;">${student.enrollmentNo}</code></td>
                <td>${student.classDivision}</td>
                <td>${statusDisplay}</td>
                <td>
                    <div class="attendance-actions" style="display: flex; gap: 8px;">
                        <button class="${presentBtnClass}" data-id="${student.id}" data-status="present">
                            <i class="fas fa-check"></i> Present
                        </button>
                        <button class="${absentBtnClass}" data-id="${student.id}" data-status="absent">
                            <i class="fas fa-times"></i> Absent
                        </button>
                    </div>
                </td>
            `;
            
            studentTableBody.appendChild(row);
        });
        
        // Add event listeners to attendance buttons
        document.querySelectorAll('.btn-present, .btn-absent').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const studentId = parseInt(this.getAttribute('data-id'));
                const status = this.classList.contains('btn-present');
                markAttendance(studentId, status);
            });
        });
    }
    
    // ========== MARK ATTENDANCE FOR A STUDENT ==========
    function markAttendance(studentId, isPresent) {
        const studentIndex = students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            students[studentIndex].attendance = isPresent;
            
            const filteredIndex = filteredStudents.findIndex(s => s.id === studentId);
            if (filteredIndex !== -1) {
                filteredStudents[filteredIndex].attendance = isPresent;
            }
            
            saveAttendanceToLocal();
            renderStudentTable();
            updateStatistics();
            checkAllMarked();
            
            // Add haptic feedback animation
            const row = document.querySelector(`button[data-id="${studentId}"]`).closest('tr');
            if (row) {
                row.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                setTimeout(() => {
                    row.style.backgroundColor = '';
                }, 200);
            }
        }
    }
    
    // ========== MARK ALL STUDENTS ==========
    function markAllStudents(status) {
        students = students.map(student => ({
            ...student,
            attendance: status
        }));
        filteredStudents = filteredStudents.map(student => ({
            ...student,
            attendance: status
        }));
        saveAttendanceToLocal();
        renderStudentTable();
        updateStatistics();
        checkAllMarked();
    }
    
    // ========== UPDATE STATISTICS ==========
    function updateStatistics() {
        const total = students.length;
        const present = students.filter(s => s.attendance === true).length;
        const absent = students.filter(s => s.attendance === false).length;
        const pending = students.filter(s => s.attendance === null).length;
        
        if (totalStudentsElem) totalStudentsElem.textContent = total;
        if (presentCountElem) presentCountElem.textContent = present;
        if (absentCountElem) absentCountElem.textContent = absent;
        if (pendingCountElem) pendingCountElem.textContent = pending;
        
        // Update progress bar
        const markedCount = present + absent;
        const progressPercentage = total > 0 ? (markedCount / total) * 100 : 0;
        if (attendanceProgress) {
            attendanceProgress.style.width = `${progressPercentage}%`;
        }
    }
    
    // ========== CHECK IF ALL ATTENDANCE IS MARKED ==========
    function checkAllMarked() {
        const pending = students.filter(s => s.attendance === null).length;
        if (saveAttendanceBtn) {
            saveAttendanceBtn.disabled = pending !== 0;
        }
        
        if (pending === 0) {
            if (alertDiv) alertDiv.style.display = 'none';
            if (saveAttendanceBtn) {
                saveAttendanceBtn.style.background = 'linear-gradient(95deg, var(--success), #059669)';
            }
        } else {
            if (alertDiv) {
                alertDiv.style.display = 'flex';
                if (alertMessageSpan) {
                    alertMessageSpan.textContent = `${pending} student(s) pending. Please mark attendance for all students.`;
                }
            }
            if (saveAttendanceBtn) {
                saveAttendanceBtn.style.background = '';
            }
        }
    }
    
    // ========== SELECT CLASS FUNCTION ==========
    function selectClass(className) {
        selectedClass = className;
        localStorage.setItem('selectedClass', className);
        
        classButtons.forEach(btn => {
            if (btn.getAttribute('data-class') === className) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        if (searchInput) {
            searchInput.disabled = false;
            searchInput.placeholder = `Search ${className} students by name or enrollment number...`;
        }
        
        loadClassStudents(className);
        hideAlert();
    }
    
    // ========== SAVE ATTENDANCE RECORD ==========
    function saveAttendance() {
        const pending = students.filter(s => s.attendance === null).length;
        if (pending > 0) {
            showAlert(`Cannot save: ${pending} student(s) still pending. Please mark all attendance.`, 'warning');
            return;
        }
        
        // Create attendance record
        const attendanceRecord = {
            id: Date.now(),
            subject: selectedSubject,
            timeSlot: selectedTimeSlot,
            date: new Date().toISOString(),
            class: selectedClass,
            teacher: username,
            students: students.map(s => ({
                name: s.name,
                enrollmentNo: s.enrollmentNo,
                attendance: s.attendance
            })),
            summary: {
                total: students.length,
                present: students.filter(s => s.attendance === true).length,
                absent: students.filter(s => s.attendance === false).length,
                percentage: 0
            }
        };
        
        attendanceRecord.summary.percentage = Math.round(
            (attendanceRecord.summary.present / attendanceRecord.summary.total) * 100
        );
        
        // Get existing records
        let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        attendanceRecords.push(attendanceRecord);
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        
        // Show success message
        if (saveAttendanceBtn) {
            const originalText = saveAttendanceBtn.innerHTML;
            saveAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveAttendanceBtn.disabled = true;
            
            setTimeout(() => {
                showAlert('✅ Attendance saved successfully! Redirecting to login...', 'success');
                saveAttendanceBtn.innerHTML = originalText;
                
                // Clear session and redirect
                setTimeout(() => {
                    localStorage.removeItem('attendanceLoggedIn');
                    localStorage.removeItem('attendanceUsername');
                    localStorage.removeItem('attendanceSubject');
                    localStorage.removeItem('attendanceTimeSlot');
                    localStorage.removeItem('attendanceDate');
                    localStorage.removeItem('selectedClass');
                    window.location.href = "index.html";
                }, 2000);
            }, 1000);
        }
    }
    
    // ========== ALERT FUNCTIONS ==========
    function showAlert(message, type = 'info') {
        if (alertDiv) {
            alertDiv.style.display = 'flex';
            if (alertMessageSpan) alertMessageSpan.textContent = message;
            if (type === 'success') {
                alertDiv.style.background = '#d1fae5';
                alertDiv.style.color = '#065f46';
            } else if (type === 'warning') {
                alertDiv.style.background = '#fef3c7';
                alertDiv.style.color = '#92400e';
            } else {
                alertDiv.style.background = '';
                alertDiv.style.color = '';
            }
            setTimeout(() => {
                if (type !== 'success') alertDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    function hideAlert() {
        if (alertDiv) alertDiv.style.display = 'none';
    }
    
    // ========== SETUP EVENT LISTENERS ==========
    function setupEventListeners() {
        // Class selection buttons
        classButtons.forEach(button => {
            button.addEventListener('click', function() {
                const className = this.getAttribute('data-class');
                selectClass(className);
            });
        });
        
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                if (searchTerm === '') {
                    filteredStudents = [...students];
                } else {
                    filteredStudents = students.filter(student =>
                        student.name.toLowerCase().includes(searchTerm) ||
                        student.enrollmentNo.toLowerCase().includes(searchTerm) ||
                        student.srNo.toString().includes(searchTerm)
                    );
                }
                renderStudentTable();
            });
        }
        
        // Mark all buttons
        if (markAllPresentBtn) {
            markAllPresentBtn.addEventListener('click', () => markAllStudents(true));
        }
        if (markAllAbsentBtn) {
            markAllAbsentBtn.addEventListener('click', () => markAllStudents(false));
        }
        
        // Save attendance button
        if (saveAttendanceBtn) {
            saveAttendanceBtn.addEventListener('click', saveAttendance);
        }
        
        // Back button
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                window.location.href = "subject.html";
            });
        }
    }
    
    // ========== INITIALIZATION ==========
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 60000);
        updateAttendanceInfo();
        setupEventListeners();
        
        // Load previously selected class or default to 5A
        const savedClass = localStorage.getItem('selectedClass');
        if (savedClass && (savedClass === '5A' || savedClass === '5B' || savedClass === '5C')) {
            selectClass(savedClass);
        } else {
            selectClass('5A');
        }
    }
    
    init();
});