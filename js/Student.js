 document.addEventListener('DOMContentLoaded', function() {
        // Check if user is logged in and has selected subject
        const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
        const selectedSubject = JSON.parse(localStorage.getItem('attendanceSubject') || 'null');
        const selectedTimeSlot = JSON.parse(localStorage.getItem('attendanceTimeSlot') || 'null');
        
        if (isLoggedIn !== 'true' || !selectedSubject || !selectedTimeSlot) {
            // Redirect to subject selection if not properly set up
            window.location.href = "subject.html";
            return;
        }

        // DOM Elements
        const classButtons = document.querySelectorAll('.btn-class');
        const attendanceInfo = document.getElementById('attendance-info');
        const studentTableBody = document.getElementById('student-table-body');
        const saveAttendanceBtn = document.getElementById('save-attendance-btn');
        const backBtn = document.getElementById('back-btn');
        const alertDiv = document.getElementById('attendance-alert');
        const searchInput = document.getElementById('search-student');
        
        // Statistics elements
        const totalStudentsElem = document.getElementById('total-students');
        const presentCountElem = document.getElementById('present-count');
        const absentCountElem = document.getElementById('absent-count');
        const pendingCountElem = document.getElementById('pending-count');
        
        // Current user and date/time
        const loggedInUser = document.getElementById('logged-in-user');
        const currentDateElem = document.getElementById('current-date');
        const currentTimeElem = document.getElementById('current-time');
        
        // Student data
        let students = [];
        let filteredStudents = [];
        let selectedClass = null;
        
        // Student data for different classes
        const classData = {
            "5A": generateClass5AStudents(),
            "5B": generateClass5BStudents(),
            "5C": generateClass5CStudents()
        };
        
        // Initialize
        function init() {
            // Set logged in user
            const username = localStorage.getItem('attendanceUsername') || 'Teacher';
            loggedInUser.textContent = username;
            
            // Update date and time
            updateDateTime();
            setInterval(updateDateTime, 60000);
            
            // Load attendance info
            loadAttendanceInfo();
            
            // Setup event listeners
            setupEventListeners();
            
            // Try to load previously selected class
            const savedClass = localStorage.getItem('selectedClass');
            if (savedClass) {
                selectClass(savedClass);
            } else {
                showAlert('Please select a class to view students');
            }
        }
        
        // Update date and time
        function updateDateTime() {
            const now = new Date();
            currentDateElem.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            currentTimeElem.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Load attendance information
        function loadAttendanceInfo() {
            const subject = JSON.parse(localStorage.getItem('attendanceSubject'));
            const timeSlot = JSON.parse(localStorage.getItem('attendanceTimeSlot'));
            const date = new Date(localStorage.getItem('attendanceDate') || new Date());
            
            if (!subject || !timeSlot) {
                showAlert('No subject selected. Redirecting...', 'warning');
                setTimeout(() => {
                    window.location.href = "subject.html";
                }, 2000);
                return;
            }
            
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Format time
            function formatTime(timeStr) {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            
            attendanceInfo.innerHTML = `
                <h3 class="info-title">
                    <i class="fas fa-info-circle"></i> Attendance Details
                </h3>
                <div class="info-details">
                    <div class="detail-item">
                        <div class="detail-label">Subject</div>
                        <div class="detail-value">${subject.code} - ${subject.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Lecture</div>
                        <div class="detail-value">${timeSlot.lecture}</div>
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
        }
        
        // Generate students for Class 5A
        function generateClass5AStudents() {
            const class5AStudents = [
                { name: "PATEL NEEL ALPESHBHAI", enrollmentNo: "SOS001" },
                { name: "AJUDIYA RAJAN V", enrollmentNo: "SOS002" },
                { name: "ALAGIYA GARCI", enrollmentNo: "SOS003" },
                { name: "AMBALIYA JENCY RAJESHBHAI", enrollmentNo: "SOS004" },
                { name: "ANAGHAN KRUNAL BHARATBHAI", enrollmentNo: "SOS005" },
                { name: "ANYALA RIYA PARESHBHAI", enrollmentNo: "SOS006" },
                { name: "DOBARIYA KAVY ASHOKBHAI", enrollmentNo: "SOS007" },
                { name: "BABARIYA DISHITA BHAYESHBHAI", enrollmentNo: "SOS008" },
                { name: "BHAIDU SADIYA", enrollmentNo: "SOS009" },
                { name: "BHALANI DHRUVKUMAR RAKESHBHAI", enrollmentNo: "SOS010" },
                { name: "GOPANI UMANG BHARATBHAI", enrollmentNo: "SOS011" },
                { name: "KAKADIYA BANSARIBEN BHAYESHBHAI", enrollmentNo: "SOS012" },
                { name: "VADACHIAK PARTHIY BHAYESHBHAI", enrollmentNo: "SOS013" },
                { name: "BIJINGARADIYA SENIL RAJESHBHAI", enrollmentNo: "SOS014" },
                { name: "BHUT PAL RAJESHBHAI", enrollmentNo: "SOS015" },
                { name: "SHIBOYA DAIZY BIPINBHAI", enrollmentNo: "SOS016" },
                { name: "BORDA KSHTIJI MAHESHKUMAR", enrollmentNo: "SOS017" },
                { name: "BUTANI KRISH MAHESHBHAI", enrollmentNo: "SOS018" },
                { name: "CHABHADIAYA AYUSHI MANOJBHAI", enrollmentNo: "SOS019" },
                { name: "CHALALIYA SOHAMKUMAR VIJAYBHAI", enrollmentNo: "SOS020" },
                { name: "CHALODIYA SNEVI BHARATBHAI", enrollmentNo: "SOS021" },
                { name: "CHALODIYA AKSHIT BHARATBHAI", enrollmentNo: "SOS022" },
                { name: "CHANCHAD VRAJ MANOJBHAI", enrollmentNo: "SOS023" },
                { name: "CHANDPARA VRAJ MAHENDRABHAI", enrollmentNo: "SOS024" },
                { name: "CHAUHAN VISHWA ASHWINSINH", enrollmentNo: "SOS025" },
                { name: "CHODVADIYA DEVANSHEE SANJAYBHAI", enrollmentNo: "SOS026" },
                { name: "DALIYA SAHIL SHANTHBHAI", enrollmentNo: "SOS027" },
                { name: "DESAI KRISH PRAKASHBHAI", enrollmentNo: "SOS028" },
                { name: "DHAMELIYA MEERA MUKESHBHAI", enrollmentNo: "SOS029" },
                { name: "LAKHANI KHUSHALI DHARMENDRABHAI", enrollmentNo: "SOS030" },
                { name: "DHOLALAKIYA KRISH ARVINDBHAI", enrollmentNo: "SOS031" },
                { name: "DHOLA NIDHI DILJPBHAI", enrollmentNo: "SOS032" },
                { name: "DHOLARIYA PRIYANSI MUKESHBHAI", enrollmentNo: "SOS033" },
                { name: "TEJANI FENI DIVYESHBHAI", enrollmentNo: "SOS034" },
                { name: "DOBARIYA MANASVI PARESHBHAI", enrollmentNo: "SOS035" },
                { name: "DOBARIYA DHRUV MARESHBHAI", enrollmentNo: "SOS036" },
                { name: "DOBARIYA MANASVI MAHENDRABHAI", enrollmentNo: "SOS037" }
            ];
            
            return class5AStudents;
        }
        
        // Generate students for Class 5B
        function generateClass5BStudents() {
            const class5BStudents = [
                { name: "COYANI OM KANTIBHAI", enrollmentNo: "SOS038" },
                { name: "KATHROTTYA RAJ SHIVLAUBHAI", enrollmentNo: "SOS039" },
                { name: "KHAMPARA ISHANKUMAR HITESHBHAI", enrollmentNo: "SOS040" },
                { name: "KHENI YASH VIPULBHAI", enrollmentNo: "SOS041" },
                { name: "KHENI TANMAY", enrollmentNo: "SOS042" },
                { name: "KHUNT AYUSHKUMAR PRAFULBHAI", enrollmentNo: "SOS043" },
                { name: "KHUNT JENISH", enrollmentNo: "SOS044" },
                { name: "KIKANI MITUL RAMESHBHAI", enrollmentNo: "SOS045" },
                { name: "KUVADIYA ON SANJAYBHAI", enrollmentNo: "SOS046" },
                { name: "LAKHANI RADHEN", enrollmentNo: "SOS047" },
                { name: "LAKHANI AKSH MUKESHBHAI", enrollmentNo: "SOS048" },
                { name: "LAKHANI AKSHIT", enrollmentNo: "SOS049" },
                { name: "LAKHANI ABHAY ASHOKBHAI", enrollmentNo: "SOS050" },
                { name: "LAKKAD HIR BIPINBHAI", enrollmentNo: "SOS051" },
                { name: "LATHTYA KHUSH DEVRAJBHAI", enrollmentNo: "SOS052" },
                { name: "LUKHI SNEHAL", enrollmentNo: "SOS053" },
                { name: "MORADIYA DEEP MAHENDRABHAI", enrollmentNo: "SOS054" },
                { name: "VAGHANI NEEL MAHESHBHAI", enrollmentNo: "SOS055" },
                { name: "MANGUKITYA PURV BAKULBHAI", enrollmentNo: "SOS056" },
                { name: "MAYANI KRISH MAHESHBHAI", enrollmentNo: "SOS057" },
                { name: "MESHIYA MEET HITENDRABHAI", enrollmentNo: "SOS058" },
                { name: "MIYANI KHUSHI GHANSHYAMBHAI", enrollmentNo: "SOS059" },
                { name: "MONPARA NENCY MUKESHBHAI", enrollmentNo: "SOS060" },
                { name: "MONPARA KHUSHI DINESHBHAI", enrollmentNo: "SOS061" },
                { name: "MORADIYA ON BHARATBHAI", enrollmentNo: "SOS062" },
                { name: "MOSLA SNEHA PARKAJBHAI", enrollmentNo: "SOS063" },
                { name: "MOTISARIYA YASU YÖCESHBHAI", enrollmentNo: "SOS064" },
                { name: "MAYADIYA JANKI RASKBHAI", enrollmentNo: "SOS065" },
                { name: "PANCHAL RUCHIT BHARATBHAI", enrollmentNo: "SOS066" },
                { name: "PANDAY DARSHAK KANUBHAI", enrollmentNo: "SOS067" },
                { name: "SAVANI HETVI PARESHBHAI", enrollmentNo: "SOS068" },
                { name: "PARMAR PARTH RITESHBHAI", enrollmentNo: "SOS069" },
                { name: "PAKSANA PRIYANK SURESHBHAI", enrollmentNo: "SOS070" },
                { name: "PATEL DIRIUY SUNILBHAI", enrollmentNo: "SOS071" },
                { name: "PATEL KHUSHUBU VASANTBHAI", enrollmentNo: "SOS072" },
                { name: "PATEL SUCHIT KALPESHBHAI", enrollmentNo: "SOS073" },
                { name: "PATEL YASH SUBESHKUMAR", enrollmentNo: "SOS074" }
            ];
            
            return class5BStudents;
        }
        
        // Generate students for Class 5C
        function generateClass5CStudents() {
            const class5CStudents = [
                { name: "RUPAPARA TULSI AJAY KUMAR", enrollmentNo: "SOS075" },
                { name: "RUPAPARA TULSI NILESHBHAI", enrollmentNo: "SOS076" },
                { name: "SANGANI DHRUVIN BAKULBHAI", enrollmentNo: "SOS077" },
                { name: "KOTHIYA MEET SANJAYBHAI", enrollmentNo: "SOS078" },
                { name: "SAVALIYA GARVI JITESHBHAI", enrollmentNo: "SOS079" },
                { name: "SAVALIYA AVUSHI PARESHBHAI", enrollmentNo: "SOS080" },
                { name: "SAVANI MADHAYIBEN DIPARBHAI", enrollmentNo: "SOS081" },
                { name: "SHAH RISHABI ALPESHBHAI", enrollmentNo: "SOS082" },
                { name: "SHAIKH AAZINBANU VASIPHUSHEN", enrollmentNo: "SOS083" },
                { name: "SHELADIYA MATRI VIPULBHAI", enrollmentNo: "SOS084" },
                { name: "SINGH VISHAL VIKENDER", enrollmentNo: "SOS085" },
                { name: "PATEL DEVAN SUNIL", enrollmentNo: "SOS086" },
                { name: "SUTARIYA JAY NARESHBHAI", enrollmentNo: "SOS087" },
                { name: "TALAIYIA DHRUVI RATBHAI", enrollmentNo: "SOS088" },
                { name: "TALAIYIA PRINCE SURESHBHAI", enrollmentNo: "SOS089" },
                { name: "TEJAWI DHRUVI ISHIVARBHAI", enrollmentNo: "SOS090" },
                { name: "THAKOR NILKANTI PRABHATSINH", enrollmentNo: "SOS091" },
                { name: "THUMMAR EAV JICNESHBHAI", enrollmentNo: "SOS092" },
                { name: "VANANI MILAN HARIBHAI", enrollmentNo: "SOS093" },
                { name: "VARSADIYA VISHY RAMESHBAHI", enrollmentNo: "SOS094" },
                { name: "VEKARIYA VRAJ KALPESHBHAI", enrollmentNo: "SOS095" },
                { name: "BALAR VISHWA VINUBHAI", enrollmentNo: "SOS096" },
                { name: "DONDA DHARMIK VIPULBHAI", enrollmentNo: "SOS097" },
                { name: "VIRANI DHRUVINA ALPESHBHAI", enrollmentNo: "SOS098" },
                { name: "VIRANI RUCHI RAJESH", enrollmentNo: "SOS099" },
                { name: "PATEL JIYA HARSHADBHAI", enrollmentNo: "SOS100" },
                { name: "KAMANI RIDHAM KANTILAL", enrollmentNo: "SOS101" },
                { name: "KHENI TISHA HARESHBHAI", enrollmentNo: "SOS102" },
                { name: "KEVADIYA ARYANKUMAR SANJAYBHAI", enrollmentNo: "SOS103" },
                { name: "DORDAWALA ALEFIYA MOIZBHAI", enrollmentNo: "SOS104" },
                { name: "MANDAYIYA SUHANI DILJPBHAI", enrollmentNo: "SOS105" },
                { name: "PATEL MAHEK HIMMATBHAI", enrollmentNo: "SOS106" },
                { name: "KAKADIYA VANSHIKA NARENDRABHAI", enrollmentNo: "SOS107" },
                { name: "PARMAR DHRUVI RALVANTSINH", enrollmentNo: "SOS108" },
                { name: "BASIR NOORMOHMMED", enrollmentNo: "SOS109" },
                { name: "MIYANI DHARM HITESIIKUMAR", enrollmentNo: "SOS110" },
                { name: "SANGANI AARCHI CHANDRESH", enrollmentNo: "SOS111" },
                { name: "VAGHASIYA VARUN MANOJBHAI", enrollmentNo: "SOS112" },
                { name: "PADSALA JAY VIPULBHAI", enrollmentNo: "SOS113" },
                { name: "JAIN SAMRIDDHI AMIT", enrollmentNo: "SOS114" },
                { name: "DESAI OM MUKESHBHAI", enrollmentNo: "SOS115" },
                { name: "IDRIS YAZID HARUNA HARUNA GARBA", enrollmentNo: "SOS116" },
                { name: "BOL SIMON GATWECH BOL", enrollmentNo: "SOS117" },
                { name: "JUMA ANDREA PASQUALE MARKO", enrollmentNo: "SOS118" },
                { name: "HIRANI MIRAL RAJANIBHAI", enrollmentNo: "SOS119" },
                { name: "KANANI UTSAV VIPULBHAI", enrollmentNo: "SOS120" },
                { name: "BELADIYA JAY ASHOKBHAI", enrollmentNo: "SOS121" },
                { name: "DONGA TIKTIKUMAR KALPESHBHAI", enrollmentNo: "SOS122" },
                { name: "MAYANI ARCHI JITENDRA", enrollmentNo: "SOS123" },
                { name: "MISTRY SANSKRUTI SHYAMLAI.", enrollmentNo: "SOS124" },
                { name: "SHORAMA SHAKIB AHMED NOHAMMAD FARUK", enrollmentNo: "SOS125" },
                { name: "NOWANKI PETER SUBEK DANIEL DANIEL SWAKA", enrollmentNo: "SOS126" },
                { name: "JASANI SNEHA KALPESHBHAI", enrollmentNo: "SOS127" },
                { name: "KAKADIYA HILKUMAR SHAILESHBHAI", enrollmentNo: "SOS128" },
                { name: "WOA MODONG HARRIET JOHN WOJA", enrollmentNo: "SOS129" },
                { name: "KATHIRIYA SARTHAK KIRTBHAI", enrollmentNo: "SOS130" },
                { name: "DAULIOJO AMEER ABDALKAREEM OSMAN DAWOUD ABD", enrollmentNo: "SOS131" },
                { name: "DOOH DOOH GODDYSON TEMBE TEMBE NGARIWA THOM", enrollmentNo: "SOS132" },
                { name: "SAVANI UTSAV RAMESHBHAI", enrollmentNo: "SOS133" },
                { name: "CHAUHAN UMANO DINESHBHAI", enrollmentNo: "SOS134" },
                { name: "KOTADIYA YASHKUMAR BHARATBHAI", enrollmentNo: "SOS135" },
                { name: "GARYEAZOHN STANLEY S GARYEAZOHN SILIME L GARYEA", enrollmentNo: "SOS136" },
                { name: "PARMAR TISA RAJIV", enrollmentNo: "SOS137" },
                { name: "BALA MOHAMMAD HASNAIN ABRARAHMED", enrollmentNo: "SOS138" },
                { name: "CHAUDHARI HARDIK RAVIBHAI", enrollmentNo: "SOS139" },
                { name: "KHUNT VIDHI HILESHBHAI", enrollmentNo: "SOS140" },
                { name: "ALHASSAN ALAMIN MUHAMMAD", enrollmentNo: "SOS141" },
                { name: "ANTALIYA PREET PRAVINBHAI", enrollmentNo: "SOS142" },
                { name: "PAYNE EMMANUEL O.", enrollmentNo: "SOS143" },
                { name: "GEORGE SAVIOR TAHMEN", enrollmentNo: "SOS144" }
            ];
            
            return class5CStudents;
        }
        
        // Select class
        function selectClass(className) {
            // Update selected class
            selectedClass = className;
            localStorage.setItem('selectedClass', className);
            
            // Update UI
            classButtons.forEach(btn => {
                if (btn.getAttribute('data-class') === className) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Enable search
            searchInput.disabled = false;
            searchInput.placeholder = `Search ${className} students by name or enrollment number...`;
            
            // Load students for selected class
            loadClassStudents(className);
            
            // Hide alert
            hideAlert();
        }
        
        // Load students for a class
        function loadClassStudents(className) {
            // Get base student data for the class
            const baseStudents = classData[className];
            
            // Try to load saved attendance for this class
            const savedAttendanceKey = `attendance_${selectedClass}_${JSON.parse(localStorage.getItem('attendanceSubject')).code}`;
            const savedAttendance = JSON.parse(localStorage.getItem(savedAttendanceKey) || '{}');
            
            // Transform to our student format
            students = baseStudents.map((student, index) => {
                const nameParts = student.name.split(' ');
                const initials = (nameParts[0][0] + (nameParts.length > 1 ? nameParts[1][0] : nameParts[0][1])).toUpperCase();
                
                return {
                    id: index + 1,
                    srNo: index + 1,
                    enrollmentNo: student.enrollmentNo,
                    name: student.name,
                    classDivision: `BSc IT ${className}`,
                    attendance: savedAttendance[student.enrollmentNo] || null,
                    initials: initials
                };
            });
            
            filteredStudents = [...students];
            renderStudentTable();
            updateStatistics();
            checkAllMarked();
        }
        
        // Save attendance for current class
        function saveClassAttendance() {
            const attendanceKey = `attendance_${selectedClass}_${JSON.parse(localStorage.getItem('attendanceSubject')).code}`;
            const attendanceData = {};
            
            students.forEach(student => {
                attendanceData[student.enrollmentNo] = student.attendance;
            });
            
            localStorage.setItem(attendanceKey, JSON.stringify(attendanceData));
        }
        
        // Render student table
        function renderStudentTable() {
            studentTableBody.innerHTML = '';
            
            if (filteredStudents.length === 0) {
                studentTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="text-muted">No students found</div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            filteredStudents.forEach((student, index) => {
                const row = document.createElement('tr');
                
                // Determine attendance status display
                let statusDisplay = '';
                if (student.attendance === true) {
                    statusDisplay = '<span class="attendance-status status-present">Present</span>';
                } else if (student.attendance === false) {
                    statusDisplay = '<span class="attendance-status status-absent">Absent</span>';
                } else {
                    statusDisplay = '<span class="attendance-status status-pending">Pending</span>';
                }
                
                // Determine button states
                const presentBtnClass = student.attendance === true ? 'btn-present active' : 'btn-present';
                const absentBtnClass = student.attendance === false ? 'btn-absent active' : 'btn-absent';
                
                row.innerHTML = `
                    <td>${student.srNo}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="student-avatar">${student.initials}</div>
                            <div>
                                <div style="font-weight: 600;">${student.name}</div>
                                <div style="font-size: 0.85rem; color: var(--medium-gray);">Class: ${student.classDivision}</div>
                            </div>
                        </div>
                    </td>
                    <td>${student.enrollmentNo}</td>
                    <td>${student.classDivision}</td>
                    <td>${statusDisplay}</td>
                    <td>
                        <div class="attendance-actions">
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
                button.addEventListener('click', function() {
                    const studentId = parseInt(this.getAttribute('data-id'));
                    const status = this.getAttribute('data-status') === 'present';
                    markAttendance(studentId, status);
                });
            });
        }
        
        // Mark attendance for a student
        function markAttendance(studentId, isPresent) {
            // Update student data
            const studentIndex = students.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
                students[studentIndex].attendance = isPresent;
                
                // Update filtered students
                const filteredIndex = filteredStudents.findIndex(s => s.id === studentId);
                if (filteredIndex !== -1) {
                    filteredStudents[filteredIndex].attendance = isPresent;
                }
                
                // Save to localStorage
                saveClassAttendance();
                
                // Re-render table
                renderStudentTable();
                
                // Update statistics
                updateStatistics();
                
                // Check if all attendance is marked
                checkAllMarked();
            }
        }
        
        // Update statistics
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
        
        // Check if all attendance is marked
        function checkAllMarked() {
            const pending = students.filter(s => s.attendance === null).length;
            if (pending === 0) {
                saveAttendanceBtn.disabled = false;
                hideAlert();
            } else {
                saveAttendanceBtn.disabled = true;
                showAlert(`${pending} student(s) still pending. Please mark attendance for all students.`, 'warning');
            }
        }
        
        // Setup event listeners
        function setupEventListeners() {
            // Class selection buttons
            classButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const className = this.getAttribute('data-class');
                    selectClass(className);
                });
            });
            
            // Search functionality
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                
                if (searchTerm.trim() === '') {
                    filteredStudents = [...students];
                } else {
                    filteredStudents = students.filter(student => 
                        student.name.toLowerCase().includes(searchTerm) ||
                        student.enrollmentNo.toLowerCase().includes(searchTerm)
                    );
                }
                
                renderStudentTable();
            });
            
            // Save attendance button
            saveAttendanceBtn.addEventListener('click', function() {
                saveAttendance();
            });
            
            // Back button - Modified to go back to index.html
            backBtn.addEventListener('click', function() {
                // Clear all session data and go back to login page
                localStorage.removeItem('attendanceLoggedIn');
                localStorage.removeItem('attendanceUsername');
                localStorage.removeItem('attendanceSubject');
                localStorage.removeItem('attendanceTimeSlot');
                localStorage.removeItem('attendanceDate');
                localStorage.removeItem('selectedClass');
                
                // Go back to login page (index.html)
                window.location.href = "index.html";
            });
        }
        
        // Save attendance - Modified to redirect to index.html
        function saveAttendance() {
            // Show loading state
            const originalText = saveAttendanceBtn.innerHTML;
            saveAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveAttendanceBtn.disabled = true;
            
            // Simulate save process
            setTimeout(() => {
                // Create attendance record
                const attendanceRecord = {
                    id: Date.now(),
                    subject: JSON.parse(localStorage.getItem('attendanceSubject')),
                    timeSlot: JSON.parse(localStorage.getItem('attendanceTimeSlot')),
                    date: new Date().toISOString(),
                    class: selectedClass,
                    students: students,
                    summary: {
                        total: students.length,
                        present: students.filter(s => s.attendance === true).length,
                        absent: students.filter(s => s.attendance === false).length,
                        percentage: 0
                    }
                };
                
                // Calculate percentage
                if (attendanceRecord.summary.total > 0) {
                    attendanceRecord.summary.percentage = Math.round(
                        (attendanceRecord.summary.present / attendanceRecord.summary.total) * 100
                    );
                }
                
                // Get existing records
                let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
                
                // Add new record
                attendanceRecords.push(attendanceRecord);
                
                // Save to localStorage
                localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
                
                // Show success message
                showAlert('Attendance saved successfully! Redirecting to login...', 'success');
                
                // Reset button
                saveAttendanceBtn.innerHTML = originalText;
                saveAttendanceBtn.disabled = true;
                
                // Clear all session data
                localStorage.removeItem('attendanceLoggedIn');
                localStorage.removeItem('attendanceUsername');
                localStorage.removeItem('attendanceSubject');
                localStorage.removeItem('attendanceTimeSlot');
                localStorage.removeItem('attendanceDate');
                localStorage.removeItem('selectedClass');
                
                // Redirect to index.html after 2 seconds
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
                
            }, 1500);
        }
        
        // Show alert
        function showAlert(message, type = 'info') {
            alertDiv.className = `alert alert-${type}`;
            alertDiv.querySelector('#alert-message').textContent = message;
            alertDiv.style.display = 'flex';
        }
        
        // Hide alert
        function hideAlert() {
            alertDiv.style.display = 'none';
        }
        
        // Initialize the page
        init();
    });