document.addEventListener('DOMContentLoaded', function() {
    // ========== AUTHENTICATION CHECK ==========
    const isLoggedIn = localStorage.getItem('attendanceLoggedIn');
    const username = localStorage.getItem('attendanceUsername');
    
    if (isLoggedIn !== 'true' || !username) {
        // Redirect to login page if not logged in
        window.location.href = "index.html";
        return;
    }

    // ========== SUBJECT DATABASE - EXPANDED WITH MORE SUBJECTS ==========
    // Semester 1 - Foundation Courses (6 subjects)
    const semester1Subjects = [
        { code: "FIT101", name: "Fundamentals of Information Technology", semester: 1, credits: 4 },
        { code: "WDD102", name: "Web Design & Development Basics", semester: 1, credits: 4 },
        { code: "DLC103", name: "Digital Logic & Computer Organization", semester: 1, credits: 4 },
        { code: "COM104", name: "Communication Skills & Technical Writing", semester: 1, credits: 3 },
        { code: "MAT105", name: "Mathematics for Computing", semester: 1, credits: 4 },
        { code: "PRG106", name: "Programming Fundamentals with C", semester: 1, credits: 4 },
        { code: "DBMS107", name: "Introduction to Database Systems", semester: 1, credits: 3 }
    ];

    // Semester 3 - Core Computing (7 subjects)
    const semester3Subjects = [
        { code: "DS301", name: "Data Science & Analytics", semester: 3, credits: 4 },
        { code: "SE302", name: "Software Engineering & Project Management", semester: 3, credits: 4 },
        { code: "BC303", name: "Blockchain Technology & Applications", semester: 3, credits: 4 },
        { code: "MWB304", name: "Mindfulness & Well-being for Professionals", semester: 3, credits: 2 },
        { code: "CC305", name: "Cloud Computing Fundamentals", semester: 3, credits: 4 },
        { code: "DSA306", name: "Data Structures & Algorithms", semester: 3, credits: 4 },
        { code: "CN307", name: "Computer Networks", semester: 3, credits: 4 }
    ];

    // Semester 5 - Advanced Technologies (8 subjects)
    const semester5Subjects = [
        { code: "MAD501", name: "Mobile Application Development (Android/iOS)", semester: 5, credits: 4 },
        { code: "PYTHON502", name: "Advanced Programming with Python", semester: 5, credits: 4 },
        { code: "OS503", name: "Operating Systems Concepts", semester: 5, credits: 4 },
        { code: "DOTNET504", name: "Programming with .NET Framework", semester: 5, credits: 4 },
        { code: "CNS505", name: "Cryptography & Network Security", semester: 5, credits: 4 },
        { code: "CGE506", name: "Corporate Grooming & Etiquette", semester: 5, credits: 2 },
        { code: "PROJ507", name: "Project / Summer Internship", semester: 5, credits: 6 },
        { code: "AIML508", name: "Introduction to AI & Machine Learning", semester: 5, credits: 4 }
    ];

    // Semester 7 - Specializations (7 subjects)
    const semester7Subjects = [
        { code: "AI701", name: "Artificial Intelligence & Deep Learning", semester: 7, credits: 4 },
        { code: "DEVOPS702", name: "DevOps & Continuous Integration", semester: 7, credits: 4 },
        { code: "BIGDATA703", name: "Big Data Analytics with Hadoop/Spark", semester: 7, credits: 4 },
        { code: "QC704", name: "Quantum Computing Fundamentals", semester: 7, credits: 3 },
        { code: "RM705", name: "Research Methodology & IPR", semester: 7, credits: 3 },
        { code: "IOT706", name: "Internet of Things & Smart Systems", semester: 7, credits: 4 },
        { code: "CYBER707", name: "Cyber Security & Ethical Hacking", semester: 7, credits: 4 }
    ];

    // ========== LECTURE TIME SLOTS ==========
    // Full day schedule from 9:15 AM to 4:15 PM
    const timeSlots = [
        { start: "09:15", end: "10:15", lecture: "Lecture 1 - Morning", duration: "60 mins", order: 1 },
        { start: "10:15", end: "11:15", lecture: "Lecture 2 - Late Morning", duration: "60 mins", order: 2 },
        { start: "11:15", end: "11:45", lecture: "Break", duration: "30 mins", isBreak: true, order: 3 },
        { start: "11:45", end: "12:45", lecture: "Lecture 3 - Pre-Lunch", duration: "60 mins", order: 4 },
        { start: "12:45", end: "13:45", lecture: "Lecture 4 - Early Afternoon", duration: "60 mins", order: 5 },
        { start: "13:45", end: "14:15", lecture: "Lunch Break", duration: "30 mins", isBreak: true, order: 6 },
        { start: "14:15", end: "15:15", lecture: "Lecture 5 - Post-Lunch", duration: "60 mins", order: 7 },
        { start: "15:15", end: "16:15", lecture: "Tutorial / Lab Session", duration: "60 mins", order: 8 }
    ];

    // ========== STATE VARIABLES ==========
    let selectedSubject = null;
    let selectedTimeSlot = null;

    // ========== DOM ELEMENTS ==========
    const sem1Container = document.getElementById('sem1-subjects');
    const sem3Container = document.getElementById('sem3-subjects');
    const sem5Container = document.getElementById('sem5-subjects');
    const sem7Container = document.getElementById('sem7-subjects');
    const timeSlotsContainer = document.getElementById('time-slots-list');
    const selectedInfoPanel = document.getElementById('selected-info-panel');
    const selectedSubjectDisplay = document.getElementById('selected-subject-display');
    const selectedTimeDisplay = document.getElementById('selected-time-display');
    const takeAttendanceBtn = document.getElementById('take-attendance-btn');
    const backBtn = document.getElementById('back-btn');
    const alertDiv = document.getElementById('selection-alert');
    const currentDateSpan = document.getElementById('current-date');

    // ========== HELPER FUNCTIONS ==========
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function updateCurrentDate() {
        if (currentDateSpan) {
            const now = new Date();
            currentDateSpan.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // ========== CREATE SUBJECT CARD ==========
    function createSubjectCard(subject) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.setAttribute('data-code', subject.code);
        card.setAttribute('data-name', subject.name);
        card.setAttribute('data-semester', subject.semester);
        
        card.innerHTML = `
            <div>
                <strong style="color: var(--primary);">${subject.code}</strong>
                <div style="font-size: 0.85rem; margin-top: 4px;">${subject.name}</div>
                <div style="font-size: 0.7rem; color: var(--gray); margin-top: 4px;">
                    <i class="fas fa-star"></i> Semester ${subject.semester} | ${subject.credits} Credits
                </div>
            </div>
            <i class="fas fa-check-circle" style="color: var(--success); font-size: 1.2rem;"></i>
        `;
        
        card.addEventListener('click', () => selectSubject(subject, card));
        return card;
    }

    // ========== CREATE TIME SLOT CARD ==========
    function createTimeSlotCard(slot) {
        const timeCard = document.createElement('div');
        timeCard.className = 'time-slot';
        if (slot.isBreak) {
            timeCard.style.opacity = '0.6';
            timeCard.style.cursor = 'not-allowed';
            timeCard.style.background = '#fef3c7';
        }
        timeCard.setAttribute('data-start', slot.start);
        timeCard.setAttribute('data-end', slot.end);
        timeCard.setAttribute('data-lecture', slot.lecture);
        
        timeCard.innerHTML = `
            <div style="text-align: center;">
                <div style="font-weight: 700; font-size: 1rem;">
                    <i class="far fa-clock"></i> ${formatTime(slot.start)} - ${formatTime(slot.end)}
                </div>
                <div style="font-size: 0.8rem; margin-top: 5px;">${slot.lecture}</div>
                <div style="font-size: 0.7rem; color: var(--gray);">${slot.duration}</div>
            </div>
        `;
        
        if (!slot.isBreak) {
            timeCard.addEventListener('click', () => selectTimeSlot(slot, timeCard));
        }
        
        return timeCard;
    }

    // ========== SELECT SUBJECT HANDLER ==========
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
        
        // Show success feedback
        cardElement.style.transform = 'scale(0.98)';
        setTimeout(() => {
            cardElement.style.transform = '';
        }, 150);
    }

    // ========== SELECT TIME SLOT HANDLER ==========
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
        
        // Show success feedback
        slotElement.style.transform = 'scale(0.98)';
        setTimeout(() => {
            slotElement.style.transform = '';
        }, 150);
    }

    // ========== UPDATE SELECTED INFO PANEL ==========
    function updateSelectedInfo() {
        if (selectedSubject || selectedTimeSlot) {
            selectedInfoPanel.style.display = 'flex';
            
            if (selectedSubject) {
                selectedSubjectDisplay.innerHTML = `<i class="fas fa-book"></i> ${selectedSubject.code} - ${selectedSubject.name}`;
            } else {
                selectedSubjectDisplay.innerHTML = '<span style="color: var(--gray);">No subject selected</span>';
            }
            
            if (selectedTimeSlot) {
                selectedTimeDisplay.innerHTML = `<i class="fas fa-clock"></i> ${selectedTimeSlot.lecture} (${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)})`;
            } else {
                selectedTimeDisplay.innerHTML = '<span style="color: var(--gray);">No time slot selected</span>';
            }
        } else {
            selectedInfoPanel.style.display = 'none';
        }
    }

    // ========== UPDATE TAKE ATTENDANCE BUTTON ==========
    function updateTakeAttendanceButton() {
        if (selectedSubject && selectedTimeSlot && !selectedTimeSlot.isBreak) {
            takeAttendanceBtn.disabled = false;
            hideAlert();
        } else {
            takeAttendanceBtn.disabled = true;
            if (selectedTimeSlot && selectedTimeSlot.isBreak) {
                showAlert('Cannot take attendance during break time. Please select a lecture time slot.');
            }
        }
    }

    // ========== ALERT FUNCTIONS ==========
    function showAlert(message) {
        if (alertDiv) {
            const alertSpan = alertDiv.querySelector('span');
            if (alertSpan) alertSpan.textContent = message;
            alertDiv.style.display = 'flex';
            setTimeout(() => {
                alertDiv.style.opacity = '1';
            }, 10);
        }
    }

    function hideAlert() {
        if (alertDiv) {
            alertDiv.style.display = 'none';
        }
    }

    // ========== RENDER ALL SUBJECTS ==========
    function renderSubjects() {
        // Semester 1
        semester1Subjects.forEach(subject => {
            if (sem1Container) sem1Container.appendChild(createSubjectCard(subject));
        });
        
        // Semester 3
        semester3Subjects.forEach(subject => {
            if (sem3Container) sem3Container.appendChild(createSubjectCard(subject));
        });
        
        // Semester 5
        semester5Subjects.forEach(subject => {
            if (sem5Container) sem5Container.appendChild(createSubjectCard(subject));
        });
        
        // Semester 7
        semester7Subjects.forEach(subject => {
            if (sem7Container) sem7Container.appendChild(createSubjectCard(subject));
        });
    }

    // ========== RENDER TIME SLOTS ==========
    function renderTimeSlots() {
        if (timeSlotsContainer) {
            timeSlots.forEach(slot => {
                timeSlotsContainer.appendChild(createTimeSlotCard(slot));
            });
        }
    }

    // ========== TAKE ATTENDANCE BUTTON CLICK ==========
    if (takeAttendanceBtn) {
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
            takeAttendanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Attendance Portal...';
            takeAttendanceBtn.disabled = true;
            
            // Add visual feedback
            takeAttendanceBtn.style.transform = 'scale(0.98)';
            
            // Redirect to student attendance page after delay
            setTimeout(() => {
                window.location.href = "student.html";
            }, 800);
        });
    }

    // ========== BACK BUTTON CLICK ==========
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            // Clear login session and redirect to login page
            localStorage.removeItem('attendanceLoggedIn');
            localStorage.removeItem('attendanceUsername');
            localStorage.removeItem('attendanceSubject');
            localStorage.removeItem('attendanceTimeSlot');
            localStorage.removeItem('attendanceDate');
            localStorage.removeItem('selectedClass');
            
            window.location.href = "index.html";
        });
    }

    // ========== INITIALIZATION ==========
    function init() {
        updateCurrentDate();
        renderSubjects();
        renderTimeSlots();
        
        // Auto-select first non-break time slot by default for better UX
        setTimeout(() => {
            const firstValidSlot = document.querySelector('.time-slot:not([style*="opacity: 0.6"])');
            if (firstValidSlot && !selectedTimeSlot) {
                firstValidSlot.click();
            }
        }, 300);
    }
    
    init();
});