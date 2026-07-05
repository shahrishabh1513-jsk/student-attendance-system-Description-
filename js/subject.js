document.addEventListener('DOMContentLoaded', function() {
            // CHECK IF USER IS LOGGED IN - If not, redirect to login page
            const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
            const username = localStorage.getItem('attendanceUsername');
            
            if (isLoggedIn !== 'true' || !username) {
                // Redirect to login page if not logged in
                window.location.href = "index.html";
                return;
            }
            
            // Subject Data from the images
            const subjects = {
                semester3: [
                    { code: "CLSC2140", name: "MINDFULNESS AND WELL-BEING", semester: 3 },
                    { code: "SSCA3021", name: "Data Science", semester: 3 },
                    { code: "SSCS3010", name: "Software Engineering", semester: 3 },
                    { code: "SSCS3021", name: "Blockchain Technology", semester: 3 }
                ],
                semester5: [
                    { code: "SSCS3910", name: "Project/Summer Internship (2023)", semester: 5 },
                    { code: "TMPC3010", name: "Corporate Grooming & Etiquette", semester: 5 },
                    { code: "CLSC2030", name: "IPDC-II", semester: 5 },
                    { code: "SSC42050", name: "Mobile Application Development", semester: 5 },
                    { code: "SSC52041", name: "Operating Systems", semester: 5 },
                    { code: "SSC52051", name: "Programming with Python", semester: 5 },
                    { code: "SSC52061", name: "Cryptography & Network Security", semester: 5 },
                    { code: "SSC52510", name: "Programming with .NET", semester: 5 }
                ]
            };

            // Time slots for lectures (9:15 AM to 4:15 PM)
            const timeSlots = [
                { start: "09:15", end: "10:15", lecture: "Lecture 1", duration: "60 mins" },
                { start: "10:15", end: "11:15", lecture: "Lecture 2", duration: "60 mins" },
                { start: "11:15", end: "11:45", lecture: "Break", duration: "30 mins", isBreak: true },
                { start: "11:45", end: "12:45", lecture: "Lecture 3", duration: "60 mins" },
                { start: "12:45", end: "13:45", lecture: "Lecture 4", duration: "60 mins" },
                { start: "13:45", end: "14:00", lecture: "Short Break", duration: "15 mins", isBreak: true },
                { start: "14:00", end: "15:00", lecture: "Lecture 5", duration: "60 mins" },
                { start: "15:00", end: "16:15", lecture: "Tutorial/Lab", duration: "75 mins" }
            ];

            // Selected data
            let selectedSubject = null;
            let selectedTimeSlot = null;

            // DOM Elements
            const semester3Container = document.getElementById('semester3-subjects');
            const semester5Container = document.getElementById('semester5-subjects');
            const timeSlotsContainer = document.getElementById('time-slots');
            const selectedInfoPanel = document.getElementById('selected-info');
            const takeAttendanceBtn = document.getElementById('take-attendance-btn');
            const backBtn = document.getElementById('back-btn');
            const alertDiv = document.getElementById('selection-alert');

            // Render Semester 3 Subjects
            subjects.semester3.forEach(subject => {
                const subjectCard = createSubjectCard(subject);
                semester3Container.appendChild(subjectCard);
            });

            // Render Semester 5 Subjects
            subjects.semester5.forEach(subject => {
                const subjectCard = createSubjectCard(subject);
                semester5Container.appendChild(subjectCard);
            });

            // Render Time Slots
            timeSlots.forEach((slot, index) => {
                const timeSlotElement = createTimeSlotElement(slot, index);
                timeSlotsContainer.appendChild(timeSlotElement);
            });

            // Create Subject Card Element
            function createSubjectCard(subject) {
                const card = document.createElement('div');
                card.className = 'subject-card';
                card.dataset.code = subject.code;
                card.dataset.name = subject.name;
                card.dataset.semester = subject.semester;
                
                card.innerHTML = `
                    <div class="select-indicator"></div>
                    <div class="subject-code">${subject.code}</div>
                    <div class="subject-name">${subject.name}</div>
                    <div class="subject-info">
                        <span>Semester ${subject.semester}</span>
                        <span>Click to select</span>
                    </div>
                `;
                
                card.addEventListener('click', () => selectSubject(subject, card));
                return card;
            }

            // Create Time Slot Element
            function createTimeSlotElement(slot, index) {
                const timeSlot = document.createElement('div');
                timeSlot.className = `time-slot ${slot.isBreak ? 'break-time' : ''}`;
                timeSlot.dataset.index = index;
                timeSlot.dataset.start = slot.start;
                timeSlot.dataset.end = slot.end;
                timeSlot.dataset.lecture = slot.lecture;
                timeSlot.dataset.duration = slot.duration;
                
                timeSlot.innerHTML = `
                    <div class="time-range">${formatTime(slot.start)} - ${formatTime(slot.end)}</div>
                    <div class="lecture-number">${slot.lecture}</div>
                    <div class="duration">${slot.duration}</div>
                `;
                
                if (!slot.isBreak) {
                    timeSlot.addEventListener('click', () => selectTimeSlot(slot, timeSlot));
                }
                
                return timeSlot;
            }

            // Format time for display
            function formatTime(timeStr) {
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour;
                return `${displayHour}:${minutes} ${ampm}`;
            }

            // Select Subject
            function selectSubject(subject, cardElement) {
                // Remove selected class from all subject cards
                document.querySelectorAll('.subject-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Add selected class to clicked card
                cardElement.classList.add('selected');
                
                // Update selected subject
                selectedSubject = subject;
                
                // Update selected info panel
                updateSelectedInfo();
                
                // Enable/disable take attendance button
                updateTakeAttendanceButton();
            }

            // Select Time Slot
            function selectTimeSlot(slot, slotElement) {
                // Remove selected class from all time slots
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('selected');
                });
                
                // Add selected class to clicked slot
                slotElement.classList.add('selected');
                
                // Update selected time slot
                selectedTimeSlot = slot;
                
                // Update selected info panel
                updateSelectedInfo();
                
                // Enable/disable take attendance button
                updateTakeAttendanceButton();
            }

            // Update Selected Info Panel
            function updateSelectedInfo() {
                if (selectedSubject || selectedTimeSlot) {
                    selectedInfoPanel.style.display = 'block';
                    
                    // Update subject info
                    if (selectedSubject) {
                        document.getElementById('selected-subject-name').textContent = selectedSubject.name;
                        document.getElementById('selected-subject-code').textContent = selectedSubject.code;
                    }
                    
                    // Update time slot info
                    if (selectedTimeSlot) {
                        document.getElementById('selected-time-slot').textContent = 
                            `${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}`;
                        document.getElementById('selected-lecture-number').textContent = selectedTimeSlot.lecture;
                    }
                } else {
                    selectedInfoPanel.style.display = 'none';
                }
            }

            // Update Take Attendance Button State
            function updateTakeAttendanceButton() {
                if (selectedSubject && selectedTimeSlot && !selectedTimeSlot.isBreak) {
                    takeAttendanceBtn.disabled = false;
                    hideAlert();
                } else {
                    takeAttendanceBtn.disabled = true;
                }
            }

            // Show Alert
            function showAlert(message) {
                alertDiv.querySelector('span').textContent = message;
                alertDiv.style.display = 'flex';
            }

            // Hide Alert
            function hideAlert() {
                alertDiv.style.display = 'none';
            }

            // Take Attendance Button Click
            takeAttendanceBtn.addEventListener('click', function() {
                if (!selectedSubject || !selectedTimeSlot) {
                    showAlert('Please select both a subject and a time slot to continue');
                    return;
                }
                
                if (selectedTimeSlot.isBreak) {
                    showAlert('Cannot take attendance during break time. Please select a lecture time slot.');
                    return;
                }
                
                // Store selected data in localStorage
                localStorage.setItem('attendanceSubject', JSON.stringify(selectedSubject));
                localStorage.setItem('attendanceTimeSlot', JSON.stringify(selectedTimeSlot));
                localStorage.setItem('attendanceDate', new Date().toISOString());
                
                // Show loading state
                const originalText = takeAttendanceBtn.innerHTML;
                takeAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
                takeAttendanceBtn.disabled = true;
                
                // Simulate processing delay
                setTimeout(() => {
                    // Redirect to student attendance page
                    window.location.href = "student.html";
                }, 1500);
            });

            // Back Button Click
            backBtn.addEventListener('click', function() {
                // Clear login data and redirect back to login page
                localStorage.removeItem('attendanceLoggedIn');
                localStorage.removeItem('attendanceUsername');
                localStorage.removeItem('attendanceSubject');
                localStorage.removeItem('attendanceTimeSlot');
                window.location.href = "index.html";
            });

            // Initialize with first subject and first time slot (for demo purposes)
            setTimeout(() => {
                const firstSubject = document.querySelector('.subject-card');
                const firstTimeSlot = document.querySelector('.time-slot:not(.break-time)');
                
                if (firstSubject && firstTimeSlot) {
                    firstSubject.click();
                    firstTimeSlot.click();
                }
            }, 500);
        });