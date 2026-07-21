/**
 * data.js
 * Central data store for the Attendance Management System.
 * Semester 7 — BCA (Batch 1) + B.Sc. IT (Batch 2)
 */

const COLLEGE_NAME = "School of Sciences";
const SYSTEM_NAME = "Student Attendance Management System";

/* ------------------------------------------------------------------ */
/*  STUDENTS                                                          */
/* ------------------------------------------------------------------ */
/* Course + Batch are derived automatically from the enrollment code:
   ...CA... -> BCA -> Batch 1
   ...IT... -> B.Sc. IT -> Batch 2                                    */

function detectCourse(enrollmentNo) {
    if (/CA\d+$/i.test(enrollmentNo)) return "BCA";
    if (/IT\d+$/i.test(enrollmentNo)) return "BSc IT";
    return "Unknown";
}

function detectBatch(course) {
    return course === "BCA" ? 1 : course === "BSc IT" ? 2 : 0;
}

const RAW_STUDENTS = [
    // Batch 1 — BCA (23 students)
    ["23SS02CA001", "Gautam G.A. Anand Murthy G.S."],
    ["23SS02CA002", "Aghera Dhruviben Navneetbhai"],
    ["23SS02CA007", "Barad Trusha Kirankumar"],
    ["23SS02CA017", "Chaudhari Hardik Ravjibhai"],
    ["23SS02CA027", "Amankumar Rameshchand Gautam"],
    ["23SS02CA051", "Maniya Hastiben Jiteshbhai"],
    ["23SS02CA060", "Parmar Krishrajsinh Yogendrasinh"],
    ["23SS02CA064", "Vikash Girajashankar Paswan"],
    ["23SS02CA065", "Dhruv Kumar Patel"],
    ["23SS02CA066", "Patel Ankit Pradip"],
    ["23SS02CA074", "Rajvi Prasad"],
    ["23SS02CA077", "Rupavatiya Harsh Rajeshbhai"],
    ["23SS02CA078", "Saiyed Isma Zulfikarali"],
    ["23SS02CA084", "Shailesh Santoshbhai Agrawal"],
    ["23SS02CA085", "Sharbidre Gaurav Rajesh Shashikant"],
    ["23SS02CA089", "Singh Saurabh Ajitsingh"],
    ["23SS02CA090", "Singh Gulshankumar Ramcharitra"],
    ["23SS02CA093", "Jaimish M Solanki"],
    ["23SS02CA098", "Ayushman Tripathi"],
    ["23SS02CA104", "Mitul Sanjay Vasoya"],
    ["23SS02CA118", "Ahir Neel Rajeshbhai"],
    ["23SS02CA119", "Malek Noorfatima Salauddin"],
    ["24IC08CA002", "Khan Iqrar Mo. Ibrar"],

    // Batch 2 — B.Sc. IT (39 students)
    ["23SS02IT007", "Anaghan Krunal Bharatbhai"],
    ["23SS02IT014", "Bhaidu Sadiya Shabbir"],
    ["23SS02IT018", "Kakadiya Bansariben Bhaveshbhai"],
    ["23SS02IT034", "Chauhan Vishwaben Ashwinsinh"],
    ["23SS02IT038", "Krish Desai"],
    ["23SS02IT061", "Gehlot Bhumin Kamleshbhai"],
    ["23SS02IT067", "Golakiya Kevins Shailesh Bhai"],
    ["23SS02IT068", "Goyani Nandish Rameshbhai"],
    ["23SS02IT069", "Gujarati Harshil Pareshkumar"],
    ["23SS02IT075", "Ramani Vinas Hasmukhbhai"],
    ["23SS02IT078", "Italiya Priyanshi Pravinbhai"],
    ["23SS02IT083", "Patel Riyakumari Jitendrabhai"],
    ["23SS02IT093", "Tanmay Kheni"],
    ["23SS02IT094", "Khunt Ayushkumar Prafulbhai"],
    ["23SS02IT107", "Lathiya Khush Devrajbhai"],
    ["23SS02IT117", "Mavani Krish Maheshbhai"],
    ["23SS02IT122", "Moradiya Om Bharatbhai"],
    ["23SS02IT137", "Patel Khushubu Vasantkumar"],
    ["23SS02IT141", "Patel Shreya Dharmeshbhai"],
    ["23SS02IT150", "Patel Krina Sanjaybhai"],
    ["23SS02IT153", "Patel Chaitanyakumar Bhupendrabhai"],
    ["23SS02IT154", "Khushi Patel"],
    ["23SS02IT156", "Dholariya Arshitaben Prakashbhai"],
    ["23SS02IT157", "Purohit Parthkumar Anilbhai"],
    ["23SS02IT159", "Raddadiya Ishitaben Bhaveshbhai"],
    ["23SS02IT160", "Raj Jaydeepsinh Mahendrasinh"],
    ["23SS02IT165", "Rakholiya Krishna Rajnikant"],
    ["23SS02IT166", "Rakholiya Tushar Girdharbhai"],
    ["23SS02IT181", "Shah Rishabh Alpeshbhai"],
    ["23SS02IT185", "Singh Vishal Virender"],
    ["23SS02IT187", "Patel Devan Sunil"],
    ["23SS02IT188", "Sutariya Jay Nareshbhai"],
    ["23SS02IT197", "Vanani Milan Haribhai"],
    ["23SS02IT218", "Parmar Dhruvi Balvantsinh"],
    ["23SS02IT219", "Noormohmmed"],
    ["23SS02IT222", "Varun Manojbhai Vaghasiya"],
    ["23SS02IT238", "Mavani Archi Jitendrabhai"],
    ["23SS02IT240", "Shakib Ahmed Mohammad Faruk Bhor"],
    ["23SS02IT242", "Jasani Sneha Kalpeshbhai"],
];

const STUDENTS = RAW_STUDENTS.map(([enrollmentNo, name], index) => {
    const course = detectCourse(enrollmentNo);
    return {
        id: index + 1,
        enrollmentNo,
        name,
        course,
        batch: detectBatch(course),
    };
});

const BATCH_LABELS = {
    1: "Batch 1 — BCA",
    2: "Batch 2 — B.Sc. IT",
};

/* ------------------------------------------------------------------ */
/*  WEEKLY TIMETABLE                                                   */
/* ------------------------------------------------------------------ */
/* type: "Lab" slots require a batch to be picked before attendance.
   type: "Theory" slots include every student, both batches together. */

const TIMETABLE = {
    Tuesday: [
        { start: "09:50", end: "10:45", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
        { start: "10:45", end: "11:40", subject: "DevOps & Agile Foundation", type: "Theory" },
        { start: "11:40", end: "12:35", subject: "Full Stack Development", type: "Theory" },
        { start: "12:35", end: "13:30", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
        { start: "13:30", end: "15:20", subject: "Image Processing Lab", type: "Lab" },
        { start: "15:20", end: "16:15", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
    ],
    Wednesday: [
        { start: "09:50", end: "10:45", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
        { start: "10:45", end: "12:35", subject: "Cryptography & Network Security Lab", type: "Lab" },
        { start: "12:35", end: "13:30", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
        { start: "13:30", end: "14:25", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
        { start: "14:25", end: "15:20", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
        { start: "15:20", end: "16:15", subject: "Augmented Reality & Virtual Reality", type: "Theory" },
    ],
    Thursday: [
        { start: "11:40", end: "12:35", subject: "DevOps & Agile Foundation", type: "Theory" },
        { start: "14:25", end: "15:20", subject: "Cryptography & Network Security", type: "Theory" },
        { start: "15:20", end: "17:10", subject: "DevOps & Agile Foundation Lab", type: "Lab" },
    ],
    Friday: [
        { start: "10:45", end: "12:35", subject: "Image Processing", type: "Theory" },
        { start: "15:20", end: "17:10", subject: "Full Stack Development Lab", type: "Lab" },
    ],
    Saturday: [
        { start: "10:45", end: "11:40", subject: "Image Processing", type: "Theory" },
        { start: "11:40", end: "12:35", subject: "DevOps & Agile Foundation", type: "Theory" },
        { start: "13:30", end: "15:20", subject: "Full Stack Development", type: "Theory" },
        { start: "15:20", end: "17:10", subject: "Cryptography & Network Security", type: "Theory" },
    ],
};

const WEEK_DAYS = Object.keys(TIMETABLE);