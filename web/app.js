// ==========================================================================
// Application State
// ==========================================================================
let state = {
    students: [],
    filteredStudents: [],
    selectedStudent: null,
    currentTab: 'dashboard',
    theme: 'dark',
    pageSize: 10,
    adminName: 'Samarth Wankhade',
    adminRole: 'Administrator',
    chartsNeedUpdate: false
};

let charts = {
    course: null,
    grade: null,
    gpa: null
};

const API_BASE_URL = '/api/students';

// Grade points map for GPA calculations
const GRADE_POINTS = {
    'A+': 4.3, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C': 2.0, 'D': 1.0, 'F': 0.0
};

// ==========================================================================
// DOM Elements
// ==========================================================================
const DOM = {
    // Nav
    navLinks: document.querySelectorAll('.nav-link'),
    tabs: document.querySelectorAll('.tab-content'),
    pageTitle: document.getElementById('page-title'),
    currentDate: document.getElementById('current-date'),
    themeToggle: document.getElementById('theme-toggle'),

    // Search and Filters
    globalSearch: document.getElementById('global-search'),
    courseFilter: document.getElementById('course-filter'),
    gradeFilter: document.getElementById('grade-filter'),

    // Stats
    statTotalStudents: document.getElementById('stat-total-students'),
    statAvgGrade: document.getElementById('stat-avg-grade'),
    statTopCourse: document.getElementById('stat-top-course'),
    statPassingRate: document.getElementById('stat-passing-rate'),

    // Table
    tableBody: document.getElementById('student-table-body'),

    // Modal & Form
    modal: document.getElementById('student-modal'),
    modalTitle: document.getElementById('modal-title'),
    form: document.getElementById('student-form'),
    formId: document.getElementById('student-id'),
    formName: document.getElementById('student-name'),
    formEmail: document.getElementById('student-email'),
    formRoll: document.getElementById('student-roll'),
    formCourse: document.getElementById('student-course'),
    formGrade: document.getElementById('student-grade'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnAddStudent: document.getElementById('btn-add-student'),

    // Toast
    toastContainer: document.getElementById('toast-container')
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    initTheme();
    initAdminProfile();
    setupEventListeners();
    fetchStudents();
});

// Setup Current Date
function initDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    DOM.currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// Setup Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

function initAdminProfile() {
    const savedName = localStorage.getItem('adminName') || 'Samarth Wankhade';
    const savedRole = localStorage.getItem('adminRole') || 'Administrator';
    state.adminName = savedName;
    state.adminRole = savedRole;
    
    // Update sidebar profile layout
    const profileNameEl = document.querySelector('.profile-name');
    const profileRoleEl = document.querySelector('.profile-role');
    if (profileNameEl) profileNameEl.textContent = savedName;
    if (profileRoleEl) profileRoleEl.textContent = savedRole;

    // Fill settings inputs if they exist
    const adminNameInput = document.getElementById('settings-admin-name');
    const adminRoleInput = document.getElementById('settings-admin-role');
    if (adminNameInput) adminNameInput.value = savedName;
    if (adminRoleInput) adminRoleInput.value = savedRole;
}

function updateThemeIcon() {
    const icon = DOM.themeToggle.querySelector('i');
    if (state.theme === 'light') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// ==========================================================================
// Event Listeners
// ==========================================================================
function setupEventListeners() {
    // Theme switch
    DOM.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
        updateThemeIcon();
        showToast('Theme Updated', `Switched to ${state.theme} mode`, 'info');
        
        // Mark that charts need update when user switches to analytics tab
        if (state.currentTab !== 'analytics') {
            state.chartsNeedUpdate = true;
        }
        
        // Sync setting page theme dropdown
        const themeSelect = document.getElementById('settings-theme-select');
        if (themeSelect) themeSelect.value = state.theme;
        
        updateCharts();
    });

    // Navigation switching
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Search and filters
    DOM.globalSearch.addEventListener('input', applyFilters);
    DOM.courseFilter.addEventListener('change', applyFilters);
    DOM.gradeFilter.addEventListener('change', applyFilters);

    // Modal Control
    DOM.btnAddStudent.addEventListener('click', () => openModal());
    DOM.btnCancelModal.addEventListener('click', closeModal);
    DOM.btnCloseModal.addEventListener('click', closeModal);
    
    // Form Submit
    DOM.form.addEventListener('submit', handleFormSubmit);

    // Close modal when clicking overlay
    DOM.modal.addEventListener('click', (e) => {
        if (e.target === DOM.modal) {
            closeModal();
        }
    });

    // Realtime Input Validations on Form
    [DOM.formName, DOM.formEmail, DOM.formRoll, DOM.formCourse, DOM.formGrade].forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (group) group.classList.remove('has-error');
        });
    });

    // Setup View All link
    const linkViewAll = document.getElementById('link-view-all-students');
    if (linkViewAll) {
        linkViewAll.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('students');
        });
    }

    // Export CSV
    const btnExport = document.getElementById('btn-export-csv');
    if (btnExport) {
        btnExport.addEventListener('click', exportToCSV);
    }

    // Save admin settings form
    const adminSettingsForm = document.getElementById('admin-settings-form');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', saveAdminProfile);
    }

    // Wipe database
    const btnWipe = document.getElementById('btn-wipe-database');
    if (btnWipe) {
        btnWipe.addEventListener('click', wipeDatabase);
    }

    // Settings Theme Select
    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) {
        themeSelect.value = state.theme;
        themeSelect.addEventListener('change', () => {
            const nextTheme = themeSelect.value;
            state.theme = nextTheme;
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('theme', nextTheme);
            updateThemeIcon();
            showToast('Theme Updated', `Switched to ${nextTheme} mode`, 'info');
            
            // Mark that charts need update when user switches to analytics tab
            if (state.currentTab !== 'analytics') {
                state.chartsNeedUpdate = true;
            }
            
            updateCharts();
        });
    }

    // Settings Page Size Select
    const pageSizeSelect = document.getElementById('settings-page-size');
    if (pageSizeSelect) {
        pageSizeSelect.value = state.pageSize;
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = pageSizeSelect.value;
            renderTable();
            showToast('Display Updated', `Showing up to ${state.pageSize} student records`, 'info');
        });
    }
}

// Tab switcher
function switchTab(tabId) {
    DOM.navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    DOM.tabs.forEach(tab => {
        if (tab.id === `tab-${tabId}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    state.currentTab = tabId;
    
    // Update title
    const titles = {
        'dashboard': 'Student Dashboard',
        'students': 'Student Registry',
        'analytics': 'Performance Reports',
        'settings': 'System Settings'
    };
    DOM.pageTitle.textContent = titles[tabId] || 'Overview';

    if (tabId === 'analytics') {
        // Update charts with latest theme if theme was changed while away from this tab
        setTimeout(updateCharts, 50);
        state.chartsNeedUpdate = false;
    }

    if (tabId === 'settings') {
        const adminNameInput = document.getElementById('settings-admin-name');
        const adminRoleInput = document.getElementById('settings-admin-role');
        if (adminNameInput) adminNameInput.value = state.adminName;
        if (adminRoleInput) adminRoleInput.value = state.adminRole;
    }
}

// ==========================================================================
// REST API Communication (AJAX CRUD)
// ==========================================================================

// GET - Read
async function fetchStudents() {
    renderTableLoading();
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        state.students = data;
        state.filteredStudents = [...data];
        
        calculateStats();
        populateCourseFilter();
        renderTable();
        renderRecentStudents();
        renderDepartmentSummary();
        updateCharts();
    } catch (error) {
        console.error('Error fetching students:', error);
        showToast('Error Loading Data', 'Could not connect to the backend server.', 'error');
        renderTableError();
    }
}

// POST / PUT - Save/Update
async function saveStudent(studentData) {
    const isEdit = !!studentData.id;
    const url = API_BASE_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast(isEdit ? 'Student Updated' : 'Student Added', result.message, 'success');
            closeModal();
            fetchStudents(); // Refresh registry
        } else {
            showToast('Submission Failed', result.message || 'Error occurred while saving.', 'error');
            
            // If the roll number is duplicate, focus and highlight the roll field
            if (result.message && result.message.toLowerCase().includes('roll number')) {
                highlightField(DOM.formRoll, result.message);
            }
        }
    } catch (error) {
        console.error('Error saving student:', error);
        showToast('Server Connection Error', 'Could not save student data to database.', 'error');
    }
}

// DELETE - Delete
async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete the student record for "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('Student Deleted', result.message, 'success');
            fetchStudents(); // Refresh registry
        } else {
            showToast('Deletion Failed', result.message || 'Could not delete student.', 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Server Connection Error', 'Could not process delete request.', 'error');
    }
}

// ==========================================================================
// Dashboard Computations (Statistics)
// ==========================================================================
function calculateStats() {
    const total = state.students.length;
    DOM.statTotalStudents.textContent = total;

    if (total === 0) {
        DOM.statAvgGrade.textContent = '-';
        DOM.statTopCourse.textContent = '-';
        DOM.statPassingRate.textContent = '0%';
        return;
    }

    // 1. Average Grade / GPA
    let totalGPA = 0;
    let countedGrades = 0;
    state.students.forEach(student => {
        const gpa = GRADE_POINTS[student.grade];
        if (gpa !== undefined) {
            totalGPA += gpa;
            countedGrades++;
        }
    });
    const avgGPA = countedGrades > 0 ? (totalGPA / countedGrades) : 0;
    
    // Find closest Letter Grade to average GPA
    let closestGrade = '-';
    let minDifference = Infinity;
    Object.keys(GRADE_POINTS).forEach(grade => {
        const diff = Math.abs(GRADE_POINTS[grade] - avgGPA);
        if (diff < minDifference) {
            minDifference = diff;
            closestGrade = grade;
        }
    });
    DOM.statAvgGrade.innerHTML = `${closestGrade} <span style="font-size:0.9rem;font-weight:400;color:var(--text-muted)">(${avgGPA.toFixed(2)} GPA)</span>`;

    // 2. Popular Course
    const courseCounts = {};
    state.students.forEach(s => {
        const course = s.course.trim();
        courseCounts[course] = (courseCounts[course] || 0) + 1;
    });

    let topCourse = '-';
    let maxCount = 0;
    Object.keys(courseCounts).forEach(course => {
        if (courseCounts[course] > maxCount) {
            maxCount = courseCounts[course];
            topCourse = course;
        }
    });
    DOM.statTopCourse.textContent = topCourse.length > 15 ? topCourse.substring(0, 15) + '...' : topCourse;
    DOM.statTopCourse.title = topCourse;

    // 3. Passing Rate (Grades other than F)
    const passingCount = state.students.filter(s => s.grade !== 'F').length;
    const passingRate = (passingCount / total) * 100;
    DOM.statPassingRate.textContent = `${passingRate.toFixed(1)}%`;
}

// Fixed list of available courses
const COURSES = [
    'BE Computer Science',
    'BE Information Technology',
    'BE Electronics and Telecommunication',
    'BE Mechanical Engineering',
    'BE Chemical Engineering'
];

// Populate course filter dropdown with fixed courses
function populateCourseFilter() {
    const selectedCourse = DOM.courseFilter.value;

    DOM.courseFilter.innerHTML = '<option value="">All Courses</option>';
    COURSES.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        DOM.courseFilter.appendChild(option);
    });

    // Preserve previous selection if it still exists
    if (COURSES.includes(selectedCourse)) {
        DOM.courseFilter.value = selectedCourse;
    }
}

// ==========================================================================
// Filtering & Searching Logic
// ==========================================================================
function applyFilters() {
    const searchVal = DOM.globalSearch.value.toLowerCase().trim();
    const courseVal = DOM.courseFilter.value;
    const gradeVal = DOM.gradeFilter.value;

    state.filteredStudents = state.students.filter(student => {
        // Course Filter
        if (courseVal && student.course.trim() !== courseVal) return false;
        
        // Grade Filter
        if (gradeVal && student.grade !== gradeVal) return false;

        // Search Query
        if (searchVal) {
            const matchesName = student.name.toLowerCase().includes(searchVal);
            const matchesRoll = student.rollNumber.toLowerCase().includes(searchVal);
            const matchesCourse = student.course.toLowerCase().includes(searchVal);
            const matchesEmail = student.email.toLowerCase().includes(searchVal);
            return matchesName || matchesRoll || matchesCourse || matchesEmail;
        }

        return true;
    });

    renderTable();
}

// ==========================================================================
// Rendering HTML Layout Views
// ==========================================================================
function renderTable() {
    DOM.tableBody.innerHTML = '';

    if (state.filteredStudents.length === 0) {
        DOM.tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-muted)">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 12px; display: block"></i>
                    No student records found matching the criteria.
                </td>
            </tr>
        `;
        return;
    }

    let studentsToRender = state.filteredStudents;
    if (state.pageSize !== 'all') {
        const limit = parseInt(state.pageSize);
        studentsToRender = state.filteredStudents.slice(0, limit);
    }

    studentsToRender.forEach(student => {
        const row = document.createElement('tr');
        
        // Initials avatar
        const initials = student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        
        // Grade class mapping for badges
        let gradeClass = 'average';
        if (['A+', 'A', 'A-'].includes(student.grade)) gradeClass = 'excellent';
        else if (['B+', 'B', 'B-'].includes(student.grade)) gradeClass = 'good';
        else if (student.grade === 'F') gradeClass = 'fail';

        row.innerHTML = `
            <td>#${student.id}</td>
            <td>
                <div class="student-avatar-info">
                    <div class="student-initials-avatar">${initials}</div>
                    <div class="student-detail-meta">
                        <span class="student-name">${escapeHTML(student.name)}</span>
                        <span class="student-email">${escapeHTML(student.email)}</span>
                    </div>
                </div>
            </td>
            <td><code>${escapeHTML(student.rollNumber)}</code></td>
            <td>${escapeHTML(student.course)}</td>
            <td>
                <span class="grade-badge ${gradeClass}">${student.grade}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" data-id="${student.id}" title="Edit Student">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete" data-id="${student.id}" data-name="${student.name}" title="Delete Student">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;

        // Register edit/delete actions inside row
        row.querySelector('.edit').addEventListener('click', () => openModal(student));
        row.querySelector('.delete').addEventListener('click', () => deleteStudent(student.id, student.name));

        DOM.tableBody.appendChild(row);
    });
}

function renderTableLoading() {
    DOM.tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="loading-row">
                <div class="spinner"></div>
                <p>Loading database records...</p>
            </td>
        </tr>
    `;
}

function renderTableError() {
    DOM.tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 48px; color: var(--danger)">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px; display: block"></i>
                Failed to communicate with database server. Ensure backend is running.
            </td>
        </tr>
    `;
}

// ==========================================================================
// Modal & Form Logic
// ==========================================================================
function openModal(student = null) {
    state.selectedStudent = student;
    resetFormErrors();

    if (student) {
        // Edit Mode
        DOM.modalTitle.textContent = 'Edit Student Details';
        DOM.formId.value = student.id;
        DOM.formName.value = student.name;
        DOM.formEmail.value = student.email;
        DOM.formRoll.value = student.rollNumber;
        DOM.formCourse.value = student.course;
        DOM.formGrade.value = student.grade;
        DOM.formRoll.setAttribute('disabled', 'true'); // Keep Roll Number unique and immutable during edit
    } else {
        // Add Mode
        DOM.modalTitle.textContent = 'Add New Student';
        DOM.form.reset();
        DOM.formId.value = '';
        DOM.formRoll.removeAttribute('disabled');
    }

    DOM.modal.classList.add('active');
    DOM.formName.focus();
}

function closeModal() {
    DOM.modal.classList.remove('active');
    state.selectedStudent = null;
    DOM.form.reset();
}

function resetFormErrors() {
    [DOM.formName, DOM.formEmail, DOM.formRoll, DOM.formCourse, DOM.formGrade].forEach(input => {
        const group = input.closest('.form-group');
        if (group) group.classList.remove('has-error');
    });
}

function highlightField(input, message) {
    const group = input.closest('.form-group');
    if (group) {
        group.classList.add('has-error');
        const errorLabel = group.querySelector('.error-msg');
        if (errorLabel) {
            errorLabel.textContent = message;
        }
    }
    input.focus();
}

function handleFormSubmit(e) {
    e.preventDefault();
    resetFormErrors();

    // Field Validations
    let isValid = true;

    if (!DOM.formName.value.trim()) {
        highlightField(DOM.formName, 'Student name is required');
        isValid = false;
    }

    const email = DOM.formEmail.value.trim();
    if (!email) {
        highlightField(DOM.formEmail, 'Email is required');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        highlightField(DOM.formEmail, 'Enter a valid email address');
        isValid = false;
    }

    if (!DOM.formRoll.value.trim()) {
        highlightField(DOM.formRoll, 'Roll Number is required');
        isValid = false;
    }

    if (!DOM.formCourse.value.trim()) {
        highlightField(DOM.formCourse, 'Course is required');
        isValid = false;
    }

    if (!DOM.formGrade.value) {
        highlightField(DOM.formGrade, 'Grade is required');
        isValid = false;
    }

    if (!isValid) return;

    // Gather Student Object
    const studentData = {
        name: DOM.formName.value.trim(),
        email: DOM.formEmail.value.trim(),
        rollNumber: DOM.formRoll.value.trim(),
        course: DOM.formCourse.value.trim(),
        grade: DOM.formGrade.value
    };

    if (state.selectedStudent) {
        studentData.id = parseInt(DOM.formId.value);
    }

    saveStudent(studentData);
}

// ==========================================================================
// Toast Notifications Engine
// ==========================================================================
function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    else if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    DOM.toastContainer.appendChild(toast);

    // Slide-in animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
        dismissToast(toast);
    }, 4000);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(dismissTimer);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.remove('show');
    // Remove element from DOM after transition complete
    toast.addEventListener('transitionend', () => {
        toast.remove();
    });
}

// HTML Escaping Helper
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================================================
// Chart.js Student Analytics Engine
// ==========================================================================
function updateCharts() {
    // Only render if tab is analytics
    if (state.currentTab !== 'analytics') return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded yet');
        return;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#9ca3af' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const tooltipBg = isDark ? '#1f2937' : '#ffffff';
    const tooltipColor = isDark ? '#f3f4f6' : '#0f172a';
    const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    // Compute Course Distribution Data
    const courseCounts = COURSES.map(course => {
        return state.students.filter(s => s.course.trim() === course).length;
    });

    // Compute Grade Distribution Data
    const gradeLabels = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'D', 'F'];
    const gradeCounts = gradeLabels.map(grade => {
        return state.students.filter(s => s.grade === grade).length;
    });

    // Compute GPA by Course Data
    const gpaAverages = COURSES.map(course => {
        const courseStudents = state.students.filter(s => s.course.trim() === course);
        if (courseStudents.length === 0) return 0;
        const totalGPA = courseStudents.reduce((sum, s) => sum + (GRADE_POINTS[s.grade] || 0), 0);
        return parseFloat((totalGPA / courseStudents.length).toFixed(2));
    });

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        family: 'Plus Jakarta Sans',
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: tooltipBg,
                titleColor: tooltipColor,
                bodyColor: textColor,
                borderColor: tooltipBorder,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    family: 'Plus Jakarta Sans',
                    weight: '700'
                },
                bodyFont: {
                    family: 'Plus Jakarta Sans'
                }
            }
        }
    };

    // Course Enrollment Chart (Doughnut)
    if (charts.course) {
        charts.course.destroy();
    }
    const courseCanvas = document.getElementById('course-chart');
    if (courseCanvas) {
        const courseCtx = courseCanvas.getContext('2d');
        charts.course = new Chart(courseCtx, {
            type: 'doughnut',
            data: {
                labels: COURSES,
                datasets: [{
                    data: courseCounts,
                    backgroundColor: [
                        '#6366f1', // Indigo
                        '#14b8a6', // Teal
                        '#10b981', // Emerald
                        '#f59e0b', // Amber
                        '#ef4444'  // Rose
                    ],
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? '#111827' : '#ffffff'
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    legend: {
                        ...commonOptions.plugins.legend,
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Grade Distribution Chart (Vertical Bar)
    if (charts.grade) {
        charts.grade.destroy();
    }
    const gradeCanvas = document.getElementById('grade-chart');
    if (gradeCanvas) {
        const gradeCtx = gradeCanvas.getContext('2d');
        charts.grade = new Chart(gradeCtx, {
            type: 'bar',
            data: {
                labels: gradeLabels,
                datasets: [{
                    label: 'Number of Students',
                    data: gradeCounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.75)',
                    borderColor: '#6366f1',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    hoverBackgroundColor: '#6366f1'
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    legend: {
                        display: false // No need for legend on single dataset
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', weight: '500' }
                        }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans' },
                            stepSize: 1,
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // GPA by Course Chart (Horizontal Bar)
    if (charts.gpa) {
        charts.gpa.destroy();
    }
    const gpaCanvas = document.getElementById('gpa-chart');
    if (gpaCanvas) {
        const gpaCtx = gpaCanvas.getContext('2d');
        charts.gpa = new Chart(gpaCtx, {
            type: 'bar',
            data: {
                labels: COURSES.map(c => c.replace('BE ', '')), // Shorten names for clean fit
                datasets: [{
                    label: 'Average GPA',
                    data: gpaAverages,
                    backgroundColor: 'rgba(20, 184, 166, 0.75)',
                    borderColor: '#14b8a6',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    hoverBackgroundColor: '#14b8a6'
                }]
            },
            options: {
                ...commonOptions,
                indexAxis: 'y',
                plugins: {
                    ...commonOptions.plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans' }
                        },
                        max: 4.3,
                        suggestedMax: 4.0
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: textColor,
                            font: { family: 'Plus Jakarta Sans', weight: '500' }
                        }
                    }
                }
            }
        });
    }
}

// ==========================================================================
// Dashboard Recent & Summary Renderers
// ==========================================================================
function renderRecentStudents() {
    const recentBody = document.getElementById('recent-students-body');
    if (!recentBody) return;
    
    recentBody.innerHTML = '';
    
    // Last 4 registered students
    const recent = state.students.slice(0, 4);
    
    if (recent.length === 0) {
        recentBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">
                    No student records available.
                </td>
            </tr>
        `;
        return;
    }
    
    recent.forEach(student => {
        const row = document.createElement('tr');
        const initials = student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        
        row.innerHTML = `
            <td>
                <div class="student-avatar-info">
                    <div class="student-initials-avatar" style="width:30px; height:30px; font-size:0.75rem;">${initials}</div>
                    <div class="student-detail-meta">
                        <span class="student-name" style="font-size:0.85rem;">${escapeHTML(student.name)}</span>
                    </div>
                </div>
            </td>
            <td><code>${escapeHTML(student.rollNumber)}</code></td>
            <td style="font-size:0.85rem;">${escapeHTML(student.course.replace('BE ', ''))}</td>
        `;
        recentBody.appendChild(row);
    });
}

function renderDepartmentSummary() {
    const deptBody = document.getElementById('dept-summary-body');
    if (!deptBody) return;
    
    deptBody.innerHTML = '';
    
    COURSES.forEach(course => {
        const courseStudents = state.students.filter(s => s.course.trim() === course);
        const count = courseStudents.length;
        
        let avgGPA = 0;
        if (count > 0) {
            const totalPoints = courseStudents.reduce((sum, s) => sum + (GRADE_POINTS[s.grade] || 0), 0);
            avgGPA = parseFloat((totalPoints / count).toFixed(2));
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 500;">${course.replace('BE ', '')}</td>
            <td><span class="grade-badge good">${count} Students</span></td>
            <td><span class="grade-badge excellent">${avgGPA > 0 ? avgGPA.toFixed(2) : '-'}</span></td>
        `;
        deptBody.appendChild(row);
    });
}

// ==========================================================================
// CSV Exporter Utility
// ==========================================================================
function exportToCSV() {
    if (state.filteredStudents.length === 0) {
        showToast('Export Failed', 'No student records to export.', 'error');
        return;
    }
    
    const headers = ['ID', 'Name', 'Email', 'Roll Number', 'Course/Department', 'Grade'];
    const csvRows = [headers.join(',')];
    
    state.filteredStudents.forEach(student => {
        const row = [
            student.id,
            `"${student.name.replace(/"/g, '""')}"`,
            `"${student.email.replace(/"/g, '""')}"`,
            `"${student.rollNumber.replace(/"/g, '""')}"`,
            `"${student.course.replace(/"/g, '""')}"`,
            student.grade
        ];
        csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `acet_students_registry_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('CSV Exported', 'Registry spreadsheet downloaded successfully', 'success');
}

// ==========================================================================
// Settings Operations
// ==========================================================================
function saveAdminProfile(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('settings-admin-name').value.trim();
    const role = document.getElementById('settings-admin-role').value.trim();
    
    if (!name || !role) {
        showToast('Save Failed', 'Name and Role are required', 'error');
        return;
    }
    
    localStorage.setItem('adminName', name);
    localStorage.setItem('adminRole', role);
    
    state.adminName = name;
    state.adminRole = role;
    
    // Update sidebar profile
    const profileNameEl = document.querySelector('.profile-name');
    const profileRoleEl = document.querySelector('.profile-role');
    if (profileNameEl) profileNameEl.textContent = name;
    if (profileRoleEl) profileRoleEl.textContent = role;
    
    showToast('Profile Saved', 'Administrator profile updated successfully', 'success');
}

async function wipeDatabase() {
    if (!confirm("⚠️ WARNING: This will drop current tables and re-initialize the database with clean sample records. This action cannot be undone.\n\nAre you sure you want to reset the database?")) {
        return;
    }
    
    try {
        const response = await fetch('/api/students/reset', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
            showToast('Database Reset', result.message, 'success');
            fetchStudents(); // reload all data
        } else {
            showToast('Reset Failed', result.message || 'Could not reset database.', 'error');
        }
    } catch (error) {
        console.error('Error resetting database:', error);
        showToast('Connection Error', 'Could not communicate with the database reset API.', 'error');
    }
}
