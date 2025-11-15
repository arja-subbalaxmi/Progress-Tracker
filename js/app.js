// ============================================
// Main Application Logic
// ============================================

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ============================================
// App Initialization
// ============================================
function initializeApp() {
    // Initialize dark mode
    Utils.initDarkMode();
    
    // Setup sidebar toggle
    setupSidebar();
    
    // Setup dark mode toggle
    setupDarkModeToggle();
    
    // Initialize sample data if first time
    initializeSampleData();
    
    // Determine current page and initialize accordingly
    const currentPage = getCurrentPage();
    initializePage(currentPage);
}

// ============================================
// Sidebar Management
// ============================================
function setupSidebar() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
}

// ============================================
// Dark Mode Toggle
// ============================================
function setupDarkModeToggle() {
    const darkModeButtons = document.querySelectorAll('#darkModeToggle');
    darkModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            Utils.toggleDarkMode();
        });
    });
    
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) {
        darkModeSwitch.addEventListener('change', () => {
            Utils.toggleDarkMode();
        });
    }
}

// ============================================
// Get Current Page
// ============================================
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('daily-log')) return 'dailyLog';
    if (path.includes('subjects')) return 'subjects';
    if (path.includes('mock-tests')) return 'mockTests';
    if (path.includes('calendar')) return 'calendar';
    if (path.includes('analytics')) return 'analytics';
    if (path.includes('settings')) return 'settings';
    return 'dashboard';
}

// ============================================
// Initialize Page Based on Current Page
// ============================================
function initializePage(page) {
    switch(page) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'dailyLog':
            initializeDailyLog();
            break;
        case 'subjects':
            initializeSubjects();
            break;
        case 'mockTests':
            initializeMockTests();
            break;
        case 'calendar':
            initializeCalendar();
            break;
        case 'analytics':
            initializeAnalytics();
            break;
        case 'settings':
            initializeSettings();
            break;
    }
}

// ============================================
// DASHBOARD PAGE
// ============================================
function initializeDashboard() {
    updateMotivationalQuote();
    updateCountdowns();
    updateDashboardStats();
    updateGoalsProgress();
    updateRecentActivity();
    updateAchievements();
    Charts.initializePageCharts('dashboard');
    
    // Update countdowns every minute
    setInterval(updateCountdowns, 60000);
}

function updateMotivationalQuote() {
    const quoteElement = document.getElementById('quoteText');
    if (quoteElement) {
        quoteElement.textContent = Utils.getMotivationalQuote();
    }
}

function updateCountdowns() {
    const examDates = Storage.getExamDates();
    
    // GATE countdown
    updateCountdown('gate', examDates.gate);
    
    // NET countdown
    updateCountdown('net', examDates.net);
}

function updateCountdown(exam, dateString) {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
        document.getElementById(`${exam}Days`).textContent = '0';
        document.getElementById(`${exam}Hours`).textContent = '0';
        document.getElementById(`${exam}Minutes`).textContent = '0';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById(`${exam}Days`).textContent = days;
    document.getElementById(`${exam}Hours`).textContent = hours;
    document.getElementById(`${exam}Minutes`).textContent = minutes;
}

function updateDashboardStats() {
    const logs = Storage.getDailyLogs();
    const subjects = Storage.getSubjects();
    const mockTests = Storage.getMockTests();
    
    // Topics completed
    const topicsCompleted = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
    document.getElementById('topicsCompleted').textContent = topicsCompleted;
    
    // Problems solved
    const problemsSolved = logs.reduce((sum, l) => sum + (l.problemsSolved || 0), 0);
    document.getElementById('problemsSolved').textContent = problemsSolved;
    
    // Mock tests taken
    document.getElementById('mockTestsTaken').textContent = mockTests.length;
    
    // Study hours this week
    const weekRange = Utils.getWeekRange();
    const weekLogs = logs.filter(l => l.date >= weekRange.start && l.date <= weekRange.end);
    const weekHours = weekLogs.reduce((sum, l) => sum + l.studyHours, 0);
    document.getElementById('studyHoursWeek').textContent = weekHours + 'h';
    
    // Current streak
    const streak = Utils.calculateStreak(logs);
    document.getElementById('currentStreak').textContent = streak;
    
    // Average daily hours
    const totalHours = logs.reduce((sum, l) => sum + l.studyHours, 0);
    const avgHours = logs.length > 0 ? (totalHours / logs.length).toFixed(1) : 0;
    document.getElementById('avgDailyHours').textContent = avgHours + 'h';
}

function updateGoalsProgress() {
    const goals = Storage.getGoals();
    const logs = Storage.getDailyLogs();
    const subjects = Storage.getSubjects();
    const mockTests = Storage.getMockTests();
    
    // Get current month data
    const monthRange = Utils.getMonthRange();
    const monthLogs = logs.filter(l => l.date >= monthRange.start && l.date <= monthRange.end);
    
    // Calculate actual values
    const actualHours = monthLogs.reduce((sum, l) => sum + l.studyHours, 0);
    const actualTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
    const actualTests = mockTests.filter(t => t.date >= monthRange.start && t.date <= monthRange.end).length;
    const actualProblems = monthLogs.reduce((sum, l) => sum + (l.problemsSolved || 0), 0);
    
    // Update display
    document.getElementById('goalStudyHours').textContent = `${actualHours} / ${goals.monthly.studyHours}`;
    document.getElementById('goalTopics').textContent = `${actualTopics} / ${goals.monthly.topicsComplete}`;
    document.getElementById('goalMockTests').textContent = `${actualTests} / ${goals.monthly.mockTests}`;
    document.getElementById('goalProblems').textContent = `${actualProblems} / ${goals.monthly.problemsSolved}`;
    
    // Calculate overall progress percentage
    const hoursPercent = (actualHours / goals.monthly.studyHours) * 100;
    const topicsPercent = (actualTopics / goals.monthly.topicsComplete) * 100;
    const testsPercent = (actualTests / goals.monthly.mockTests) * 100;
    const problemsPercent = (actualProblems / goals.monthly.problemsSolved) * 100;
    
    const overallPercent = Math.min(100, (hoursPercent + topicsPercent + testsPercent + problemsPercent) / 4);
    
    document.getElementById('monthlyGoalPercent').textContent = Math.round(overallPercent) + '%';
    document.getElementById('monthlyGoalProgress').style.width = overallPercent + '%';
}

function updateRecentActivity() {
    const logs = Storage.getDailyLogs();
    const activityList = document.getElementById('recentActivity');
    
    if (!activityList) return;
    
    if (logs.length === 0) {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }
    
    const recentLogs = logs.slice(0, 5);
    activityList.innerHTML = recentLogs.map(log => `
        <div class="activity-item fade-in">
            <div>
                <strong>${log.subject}</strong> - ${log.studyHours}h
                <p>${log.topics || 'No topics specified'}</p>
            </div>
            <div class="activity-date">${Utils.formatDateReadable(log.date)}</div>
        </div>
    `).join('');
}

function updateAchievements() {
    const logs = Storage.getDailyLogs();
    const streak = Utils.calculateStreak(logs);
    const totalHours = logs.reduce((sum, l) => sum + l.studyHours, 0);
    const problemsSolved = logs.reduce((sum, l) => sum + (l.problemsSolved || 0), 0);
    
    const achievements = [
        { icon: '🔥', title: 'First Steps', desc: 'Log your first study session', unlocked: logs.length > 0 },
        { icon: '📚', title: 'Consistent Learner', desc: '7 day streak', unlocked: streak >= 7 },
        { icon: '⭐', title: 'Dedication', desc: '30 day streak', unlocked: streak >= 30 },
        { icon: '💯', title: 'Century', desc: '100 hours studied', unlocked: totalHours >= 100 },
        { icon: '💻', title: 'Problem Solver', desc: '100 problems solved', unlocked: problemsSolved >= 100 },
        { icon: '🎯', title: 'Test Taker', desc: 'Complete 10 mock tests', unlocked: Storage.getMockTests().length >= 10 }
    ];
    
    const achievementsList = document.getElementById('achievementsList');
    if (!achievementsList) return;
    
    achievementsList.innerHTML = achievements.map(ach => `
        <div class="achievement-badge ${ach.unlocked ? '' : 'locked'}">
            <div class="achievement-icon">${ach.icon}</div>
            <h4>${ach.title}</h4>
            <p>${ach.desc}</p>
        </div>
    `).join('');
}

// ============================================
// DAILY LOG PAGE
// ============================================
function initializeDailyLog() {
    setupDailyLogForm();
    setupPomodoroTimer();
    loadRecentLogs();
}

function setupDailyLogForm() {
    const form = document.getElementById('dailyLogForm');
    const dateInput = document.getElementById('logDate');
    
    // Set default date to today
    if (dateInput) {
        dateInput.value = Utils.getToday();
        dateInput.max = Utils.getToday();
    }
    
    // Setup star rating
    setupStarRating();
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleDailyLogSubmit);
    }
    
    // Clear form button
    const clearBtn = document.getElementById('clearForm');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            form.reset();
            dateInput.value = Utils.getToday();
            resetStarRating();
        });
    }
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const energyInput = document.getElementById('energyLevel');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            energyInput.value = rating;
            updateStarDisplay(rating);
        });
    });
    
    // Set default rating
    updateStarDisplay(3);
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

function resetStarRating() {
    updateStarDisplay(3);
    document.getElementById('energyLevel').value = 3;
}

function handleDailyLogSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const log = {
        id: Utils.generateId(),
        date: formData.get('date'),
        studyHours: parseFloat(formData.get('studyHours')),
        examFocus: formData.get('examFocus'),
        subject: formData.get('subject'),
        problemsSolved: parseInt(formData.get('problemsSolved')) || 0,
        platform: formData.get('platform') || '',
        topics: formData.get('topics') || '',
        mockTestScore: formData.get('mockTestScore') ? parseInt(formData.get('mockTestScore')) : null,
        energyLevel: parseInt(formData.get('energyLevel')),
        notes: formData.get('notes') || '',
        checklist: {
            studyHours: formData.get('studyHoursCheck') === 'on',
            problemTarget: formData.get('problemTargetCheck') === 'on',
            revision: formData.get('revisionCheck') === 'on',
            formulaSheets: formData.get('formulaSheetsCheck') === 'on',
            aptitude: formData.get('aptitudeCheck') === 'on',
            exercise: formData.get('exerciseCheck') === 'on',
            sleep: formData.get('sleepCheck') === 'on'
        }
    };
    
    // Check if log already exists for this date
    const existingLog = Storage.getDailyLogByDate(log.date);
    if (existingLog) {
        log.id = existingLog.id;
    }
    
    if (Storage.saveDailyLog(log)) {
        Utils.showNotification('Daily log saved successfully!', 'success');
        e.target.reset();
        document.getElementById('logDate').value = Utils.getToday();
        resetStarRating();
        loadRecentLogs();
        
        // Update subject hours
        updateSubjectHours(log.subject, log.studyHours);
    } else {
        Utils.showNotification('Failed to save daily log', 'error');
    }
}

function updateSubjectHours(subjectName, hours) {
    const subject = Storage.getSubjectByName(subjectName);
    if (subject) {
        subject.hoursSpent = (subject.hoursSpent || 0) + hours;
        subject.lastStudied = Utils.getToday();
        Storage.saveSubject(subject);
    }
}

function loadRecentLogs() {
    const logs = Storage.getDailyLogs();
    const tbody = document.getElementById('recentLogs');
    
    if (!tbody) return;
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.slice(0, 10).map(log => `
        <tr>
            <td>${Utils.formatDateReadable(log.date)}</td>
            <td>${log.studyHours}h</td>
            <td>${log.subject}</td>
            <td>${log.topics.substring(0, 50)}${log.topics.length > 50 ? '...' : ''}</td>
            <td>${log.problemsSolved}</td>
            <td>${'★'.repeat(log.energyLevel)}${'☆'.repeat(5 - log.energyLevel)}</td>
            <td class="table-actions">
                <button class="action-btn delete" onclick="deleteDailyLog('${log.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function deleteDailyLog(id) {
    if (Utils.confirm('Are you sure you want to delete this log?')) {
        if (Storage.deleteDailyLog(id)) {
            Utils.showNotification('Log deleted successfully', 'success');
            loadRecentLogs();
        }
    }
}

// ============================================
// POMODORO TIMER
// ============================================
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;

function setupPomodoroTimer() {
    const startBtn = document.getElementById('pomodoroStart');
    const resetBtn = document.getElementById('pomodoroReset');
    const display = document.getElementById('pomodoroDisplay');
    const modeRadios = document.querySelectorAll('input[name="timerMode"]');
    
    if (!startBtn || !resetBtn || !display) return;
    
    startBtn.addEventListener('click', () => {
        if (pomodoroInterval) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            startBtn.textContent = 'Start';
        } else {
            pomodoroInterval = setInterval(updatePomodoroTimer, 1000);
            startBtn.textContent = 'Pause';
        }
    });
    
    resetBtn.addEventListener('click', () => {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        const selectedMode = document.querySelector('input[name="timerMode"]:checked').value;
        pomodoroSeconds = parseInt(selectedMode) * 60;
        updatePomodoroDisplay();
        startBtn.textContent = 'Start';
    });
    
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            pomodoroSeconds = parseInt(e.target.value) * 60;
            updatePomodoroDisplay();
            startBtn.textContent = 'Start';
        });
    });
}

function updatePomodoroTimer() {
    pomodoroSeconds--;
    
    if (pomodoroSeconds <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        Utils.showNotification('Pomodoro session completed!', 'success');
        document.getElementById('pomodoroStart').textContent = 'Start';
        const selectedMode = document.querySelector('input[name="timerMode"]:checked');
        if (selectedMode.value === '25') {
            // Switch to break
            document.querySelector('input[name="timerMode"][value="5"]').checked = true;
            pomodoroSeconds = 5 * 60;
        } else {
            // Switch to work
            document.querySelector('input[name="timerMode"][value="25"]').checked = true;
            pomodoroSeconds = 25 * 60;
        }
    }
    
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroSeconds / 60);
    const seconds = pomodoroSeconds % 60;
    const display = document.getElementById('pomodoroDisplay');
    if (display) {
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ============================================
// SUBJECTS PAGE
// ============================================
function initializeSubjects() {
    loadSubjects();
    setupSubjectModal();
}

function loadSubjects() {
    const subjects = Storage.getSubjects();
    const grid = document.getElementById('subjectsGrid');
    
    if (!grid) return;
    
    if (subjects.length === 0) {
        grid.innerHTML = '<p class="no-data">No subjects added yet. Click "Add Subject" to get started.</p>';
        document.getElementById('overallCompletion').textContent = '0%';
        return;
    }
    
    // Calculate overall completion
    const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
    const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
    const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    document.getElementById('overallCompletion').textContent = overallPercent + '%';
    
    grid.innerHTML = subjects.map(subject => {
        const percentage = subject.totalTopics > 0 
            ? Math.round((subject.completedTopics / subject.totalTopics) * 100) 
            : 0;
        const statusClass = Utils.getStatusColor(percentage);
        
        return `
            <div class="subject-card ${statusClass} fade-in">
                <div class="subject-header">
                    <h3>${subject.name}</h3>
                    <div class="subject-actions">
                        <button class="icon-btn" onclick="editSubject('${subject.id}')" title="Edit">✏️</button>
                        <button class="icon-btn" onclick="deleteSubject('${subject.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="subject-stats">
                    <div class="stat-row">
                        <span>Topics:</span>
                        <span>${subject.completedTopics} / ${subject.totalTopics}</span>
                    </div>
                    <div class="stat-row">
                        <span>Hours Spent:</span>
                        <span>${subject.hoursSpent || 0}h</span>
                    </div>
                    <div class="stat-row">
                        <span>Last Studied:</span>
                        <span>${subject.lastStudied ? Utils.formatDateReadable(subject.lastStudied) : 'Never'}</span>
                    </div>
                </div>
                <div class="subject-progress">
                    <div class="progress-text">
                        <span>Progress</span>
                        <span>${percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupSubjectModal() {
    const addBtn = document.getElementById('addSubjectBtn');
    const modal = document.getElementById('subjectModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelModal');
    const form = document.getElementById('subjectForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add New Subject';
            form.reset();
            document.getElementById('subjectId').value = '';
            modal.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (form) {
        form.addEventListener('submit', handleSubjectSubmit);
    }
}

function handleSubjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const subjectId = formData.get('subjectId');
    
    const subject = {
        id: subjectId || Utils.generateId(),
        name: formData.get('subjectName'),
        totalTopics: parseInt(formData.get('totalTopics')),
        completedTopics: parseInt(formData.get('completedTopics')),
        hoursSpent: parseFloat(formData.get('hoursSpent')) || 0,
        lastStudied: null
    };
    
    if (Storage.saveSubject(subject)) {
        Utils.showNotification('Subject saved successfully!', 'success');
        document.getElementById('subjectModal').classList.remove('active');
        loadSubjects();
    } else {
        Utils.showNotification('Failed to save subject', 'error');
    }
}

function editSubject(id) {
    const subjects = Storage.getSubjects();
    const subject = subjects.find(s => s.id === id);
    
    if (!subject) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Subject';
    document.getElementById('subjectId').value = subject.id;
    document.getElementById('subjectName').value = subject.name;
    document.getElementById('totalTopics').value = subject.totalTopics;
    document.getElementById('completedTopics').value = subject.completedTopics;
    document.getElementById('hoursSpent').value = subject.hoursSpent || 0;
    
    document.getElementById('subjectModal').classList.add('active');
}

function deleteSubject(id) {
    if (Utils.confirm('Are you sure you want to delete this subject?')) {
        if (Storage.deleteSubject(id)) {
            Utils.showNotification('Subject deleted successfully', 'success');
            loadSubjects();
        }
    }
}

// ============================================
// MOCK TESTS PAGE
// ============================================
function initializeMockTests() {
    loadMockTests();
    updateMockTestStats();
    setupMockTestModal();
    setupMockTestFilters();
    Charts.initializePageCharts('mockTests');
}

function loadMockTests() {
    const tests = Storage.getMockTests();
    const tbody = document.getElementById('mockTestsBody');
    
    if (!tbody) return;
    
    if (tests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No mock tests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = tests.map(test => {
        const percentage = Math.round((test.score / test.totalMarks) * 100);
        return `
            <tr>
                <td>${Utils.formatDateReadable(test.date)}</td>
                <td>${test.exam}</td>
                <td>${test.score}</td>
                <td>${test.totalMarks}</td>
                <td><strong>${percentage}%</strong></td>
                <td>${test.rank || '-'}</td>
                <td class="table-actions">
                    <button class="action-btn edit" onclick="editMockTest('${test.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteMockTest('${test.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateMockTestStats() {
    const tests = Storage.getMockTests();
    
    document.getElementById('totalTests').textContent = tests.length;
    
    if (tests.length === 0) {
        document.getElementById('avgScore').textContent = '0%';
        document.getElementById('bestScore').textContent = '0%';
        document.getElementById('worstScore').textContent = '0%';
        return;
    }
    
    const percentages = tests.map(t => (t.score / t.totalMarks) * 100);
    const avg = Utils.calculateAverage(percentages);
    const best = Math.max(...percentages);
    const worst = Math.min(...percentages);
    
    document.getElementById('avgScore').textContent = Math.round(avg) + '%';
    document.getElementById('bestScore').textContent = Math.round(best) + '%';
    document.getElementById('worstScore').textContent = Math.round(worst) + '%';
}

function setupMockTestModal() {
    const addBtn = document.getElementById('addMockTestBtn');
    const modal = document.getElementById('mockTestModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelModal');
    const form = document.getElementById('mockTestForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add Mock Test';
            form.reset();
            document.getElementById('testId').value = '';
            document.getElementById('testDate').value = Utils.getToday();
            modal.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (form) {
        form.addEventListener('submit', handleMockTestSubmit);
    }
}

function handleMockTestSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const testId = formData.get('testId');
    
    const test = {
        id: testId || Utils.generateId(),
        date: formData.get('date'),
        exam: formData.get('exam'),
        score: parseFloat(formData.get('score')),
        totalMarks: parseFloat(formData.get('totalMarks')),
        rank: formData.get('rank') ? parseInt(formData.get('rank')) : null,
        notes: formData.get('notes') || ''
    };
    
    if (Storage.saveMockTest(test)) {
        Utils.showNotification('Mock test saved successfully!', 'success');
        document.getElementById('mockTestModal').classList.remove('active');
        loadMockTests();
        updateMockTestStats();
        Charts.refreshPageCharts('mockTests');
    } else {
        Utils.showNotification('Failed to save mock test', 'error');
    }
}

function editMockTest(id) {
    const tests = Storage.getMockTests();
    const test = tests.find(t => t.id === id);
    
    if (!test) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Mock Test';
    document.getElementById('testId').value = test.id;
    document.getElementById('testDate').value = test.date;
    document.getElementById('testExam').value = test.exam;
    document.getElementById('testScore').value = test.score;
    document.getElementById('totalMarks').value = test.totalMarks;
    document.getElementById('testRank').value = test.rank || '';
    document.getElementById('testNotes').value = test.notes || '';
    
    document.getElementById('mockTestModal').classList.add('active');
}

function deleteMockTest(id) {
    if (Utils.confirm('Are you sure you want to delete this mock test?')) {
        if (Storage.deleteMockTest(id)) {
            Utils.showNotification('Mock test deleted successfully', 'success');
            loadMockTests();
            updateMockTestStats();
            Charts.refreshPageCharts('mockTests');
        }
    }
}

function setupMockTestFilters() {
    const searchInput = document.getElementById('searchTests');
    const filterExam = document.getElementById('filterExam');
    
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce((e) => {
            filterMockTests();
        }, 300));
    }
    
    if (filterExam) {
        filterExam.addEventListener('change', () => {
            filterMockTests();
        });
    }
}

function filterMockTests() {
    const searchTerm = document.getElementById('searchTests').value.toLowerCase();
    const examFilter = document.getElementById('filterExam').value;
    const tbody = document.getElementById('mockTestsBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;
        
        const examCell = cells[1].textContent;
        const rowText = Array.from(cells).map(c => c.textContent.toLowerCase()).join(' ');
        
        const matchesSearch = rowText.includes(searchTerm);
        const matchesExam = !examFilter || examCell === examFilter;
        
        row.style.display = matchesSearch && matchesExam ? '' : 'none';
    });
}

// Table sorting
function sortTable(columnIndex) {
    const table = document.getElementById('mockTestsTable');
    if (table) {
        Utils.sortTable(table, columnIndex);
    }
}

// ============================================
// CALENDAR PAGE
// ============================================
let currentCalendarDate = new Date();

function initializeCalendar() {
    renderCalendar();
    setupCalendarNavigation();
    updateMonthlyStats();
}

function setupCalendarNavigation() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
            updateMonthlyStats();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
            updateMonthlyStats();
        });
    }
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const calendarData = Utils.getCalendarData(year, month);
    const logs = Storage.getDailyLogs();
    
    // Update month title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Render days
    const daysContainer = document.getElementById('calendarDays');
    let daysHTML = '';
    
    // Empty cells before first day
    for (let i = 0; i < calendarData.startingDayOfWeek; i++) {
        daysHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Days of month
    for (let day = 1; day <= calendarData.daysInMonth; day++) {
        const date = Utils.formatDate(new Date(year, month, day));
        const hours = Utils.getStudyHoursForDate(date, logs);
        
        let dayClass = 'calendar-day';
        if (hours === 0) dayClass += ' no-study';
        else if (hours < 5) dayClass += ' light-study';
        else if (hours < 8) dayClass += ' medium-study';
        else dayClass += ' heavy-study';
        
        if (date === Utils.getToday()) dayClass += ' today';
        
        daysHTML += `
            <div class="${dayClass}" onclick="showDayDetails('${date}')">
                <div class="day-number">${day}</div>
                ${hours > 0 ? `<div class="day-hours">${hours}h</div>` : ''}
            </div>
        `;
    }
    
    daysContainer.innerHTML = daysHTML;
}

function showDayDetails(date) {
    const logs = Storage.getDailyLogs();
    const log = logs.find(l => l.date === date);
    
    const detailsSection = document.getElementById('dayDetails');
    const selectedDateSpan = document.getElementById('selectedDate');
    const contentDiv = document.getElementById('dayDetailsContent');
    
    selectedDateSpan.textContent = Utils.formatDateReadable(date);
    
    if (!log) {
        contentDiv.innerHTML = '<p class="no-data">No study log for this date</p>';
    } else {
        contentDiv.innerHTML = `
            <div class="day-log-details">
                <div class="stat-row">
                    <span><strong>Study Hours:</strong></span>
                    <span>${log.studyHours}h</span>
                </div>
                <div class="stat-row">
                    <span><strong>Subject:</strong></span>
                    <span>${log.subject}</span>
                </div>
                <div class="stat-row">
                    <span><strong>Exam Focus:</strong></span>
                    <span>${log.examFocus}</span>
                </div>
                <div class="stat-row">
                    <span><strong>Problems Solved:</strong></span>
                    <span>${log.problemsSolved}</span>
                </div>
                <div class="stat-row">
                    <span><strong>Energy Level:</strong></span>
                    <span>${'★'.repeat(log.energyLevel)}${'☆'.repeat(5 - log.energyLevel)}</span>
                </div>
                ${log.topics ? `
                    <div class="mt-2">
                        <strong>Topics Studied:</strong>
                        <p>${log.topics}</p>
                    </div>
                ` : ''}
                ${log.notes ? `
                    <div class="mt-2">
                        <strong>Notes:</strong>
                        <p>${log.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    detailsSection.style.display = 'block';
}

function updateMonthlyStats() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthRange = Utils.getMonthRange(new Date(year, month, 1));
    
    const logs = Storage.getDailyLogs();
    const monthLogs = logs.filter(l => l.date >= monthRange.start && l.date <= monthRange.end);
    
    const studyDays = monthLogs.filter(l => l.studyHours > 0).length;
    const totalHours = monthLogs.reduce((sum, l) => sum + l.studyHours, 0);
    const avgHours = studyDays > 0 ? (totalHours / studyDays).toFixed(1) : 0;
    
    // Calculate longest streak in month
    const sortedDates = monthLogs
        .filter(l => l.studyHours > 0)
        .map(l => l.date)
        .sort();
    
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    
    document.getElementById('monthStudyDays').textContent = studyDays;
    document.getElementById('monthTotalHours').textContent = totalHours + 'h';
    document.getElementById('monthAvgHours').textContent = avgHours + 'h';
    document.getElementById('monthStreak').textContent = longestStreak;
}

// ============================================
// ANALYTICS PAGE
// ============================================
function initializeAnalytics() {
    updateAnalyticsStats();
    updateConsistencyAnalysis();
    updateSubjectPerformance();
    updateInsights();
    Charts.initializePageCharts('analytics');
}

function updateAnalyticsStats() {
    const logs = Storage.getDailyLogs();
    
    const totalHours = logs.reduce((sum, l) => sum + l.studyHours, 0);
    const totalDays = logs.filter(l => l.studyHours > 0).length;
    const avgDaily = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;
    const longestStreak = Utils.calculateStreak(logs);
    const totalProblems = logs.reduce((sum, l) => sum + (l.problemsSolved || 0), 0);
    const totalTests = Storage.getMockTests().length;
    
    document.getElementById('totalStudyHours').textContent = totalHours + 'h';
    document.getElementById('avgDailyStudy').textContent = avgDaily + 'h';
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('longestStreak').textContent = longestStreak;
    document.getElementById('totalProblems').textContent = totalProblems;
    document.getElementById('totalMockTests').textContent = totalTests;
}

function updateConsistencyAnalysis() {
    const logs = Storage.getDailyLogs();
    const currentStreak = Utils.calculateStreak(logs);
    
    document.getElementById('currentStreakAnalytics').textContent = currentStreak + ' days';
    
    // Month consistency
    const monthRange = Utils.getMonthRange();
    const monthLogs = logs.filter(l => l.date >= monthRange.start && l.date <= monthRange.end);
    const daysInMonth = new Date().getDate(); // Days so far this month
    const studyDays = monthLogs.filter(l => l.studyHours > 0).length;
    const monthPercent = Math.round((studyDays / daysInMonth) * 100);
    
    document.getElementById('monthConsistency').textContent = monthPercent + '%';
    
    // Week consistency
    const weekRange = Utils.getWeekRange();
    const weekLogs = logs.filter(l => l.date >= weekRange.start && l.date <= weekRange.end);
    const weekStudyDays = weekLogs.filter(l => l.studyHours > 0).length;
    
    document.getElementById('weekConsistency').textContent = `${weekStudyDays}/7`;
}

function updateSubjectPerformance() {
    const subjects = Storage.getSubjects();
    const logs = Storage.getDailyLogs();
    const tbody = document.getElementById('subjectPerformanceTable');
    
    if (!tbody) return;
    
    if (subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No data available</td></tr>';
        return;
    }
    
    tbody.innerHTML = subjects.map(subject => {
        const percentage = subject.totalTopics > 0 
            ? Math.round((subject.completedTopics / subject.totalTopics) * 100) 
            : 0;
        
        // Calculate avg energy for this subject
        const subjectLogs = logs.filter(l => l.subject === subject.name);
        const avgEnergy = subjectLogs.length > 0 
            ? Utils.calculateAverage(subjectLogs.map(l => l.energyLevel))
            : 0;
        
        const statusClass = Utils.getStatusColor(percentage);
        const statusText = percentage < 30 ? '🔴 Low' : percentage < 70 ? '🟡 Medium' : '🟢 High';
        
        return `
            <tr>
                <td><strong>${subject.name}</strong></td>
                <td>${subject.hoursSpent || 0}h</td>
                <td>${percentage}%</td>
                <td>${avgEnergy > 0 ? '★'.repeat(Math.round(avgEnergy)) : '-'}</td>
                <td>${statusText}</td>
            </tr>
        `;
    }).join('');
}

function updateInsights() {
    const logs = Storage.getDailyLogs();
    const subjects = Storage.getSubjects();
    const tests = Storage.getMockTests();
    
    const insights = [];
    
    // Study pattern insights
    if (logs.length > 0) {
        const totalHours = logs.reduce((sum, l) => sum + l.studyHours, 0);
        const avgHours = totalHours / logs.length;
        
        if (avgHours >= 8) {
            insights.push({
                icon: '🌟',
                title: 'Excellent Study Pattern',
                description: `You're averaging ${avgHours.toFixed(1)} hours per day. Keep it up!`
            });
        } else if (avgHours < 5) {
            insights.push({
                icon: '⚠️',
                title: 'Increase Study Time',
                description: `Current average is ${avgHours.toFixed(1)}h/day. Aim for at least 6-8 hours.`
            });
        }
    }
    
    // Subject completion insights
    const incompleteSubjects = subjects.filter(s => {
        const percent = s.totalTopics > 0 ? (s.completedTopics / s.totalTopics) * 100 : 0;
        return percent < 50;
    });
    
    if (incompleteSubjects.length > 0) {
        insights.push({
            icon: '📚',
            title: 'Focus on Weak Subjects',
            description: `${incompleteSubjects.length} subject(s) need more attention: ${incompleteSubjects.map(s => s.name).join(', ')}`
        });
    }
    
    // Mock test insights
    if (tests.length >= 3) {
        const recent3 = tests.slice(0, 3);
        const percentages = recent3.map(t => (t.score / t.totalMarks) * 100);
        const improving = percentages[0] > percentages[2];
        
        if (improving) {
            insights.push({
                icon: '📈',
                title: 'Performance Improving',
                description: 'Your mock test scores show an upward trend. Great progress!'
            });
        } else {
            insights.push({
                icon: '📉',
                title: 'Review Your Strategy',
                description: 'Recent mock test scores show a decline. Consider revising weak areas.'
            });
        }
    }
    
    // Streak insights
    const streak = Utils.calculateStreak(logs);
    if (streak >= 7) {
        insights.push({
            icon: '🔥',
            title: 'Amazing Consistency!',
            description: `You've studied ${streak} days in a row. Consistency is key to success!`
        });
    }
    
    const insightsGrid = document.getElementById('insightsGrid');
    if (insightsGrid) {
        if (insights.length === 0) {
            insightsGrid.innerHTML = '<p class="no-data">Keep logging your study data to see personalized insights!</p>';
        } else {
            insightsGrid.innerHTML = insights.map(insight => `
                <div class="insight-card fade-in">
                    <h4>${insight.icon} ${insight.title}</h4>
                    <p>${insight.description}</p>
                </div>
            `).join('');
        }
    }
}

// ============================================
// SETTINGS PAGE
// ============================================
function initializeSettings() {
    loadGoalsSettings();
    loadExamDatesSettings();
    loadReminders();
    setupSettingsForms();
}

function loadGoalsSettings() {
    const goals = Storage.getGoals();
    
    document.getElementById('goalStudyHours').value = goals.monthly.studyHours;
    document.getElementById('goalTopics').value = goals.monthly.topicsComplete;
    document.getElementById('goalMockTests').value = goals.monthly.mockTests;
    document.getElementById('goalProblems').value = goals.monthly.problemsSolved;
}

function loadExamDatesSettings() {
    const examDates = Storage.getExamDates();
    
    document.getElementById('gateDate').value = examDates.gate;
    document.getElementById('netDate').value = examDates.net;
}

function setupSettingsForms() {
    // Goals form
    const goalsForm = document.getElementById('goalsForm');
    if (goalsForm) {
        goalsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const goals = {
                monthly: {
                    studyHours: parseInt(e.target.studyHours.value),
                    topicsComplete: parseInt(e.target.topicsComplete.value),
                    mockTests: parseInt(e.target.mockTests.value),
                    problemsSolved: parseInt(e.target.problemsSolved.value)
                }
            };
            
            if (Storage.saveGoals(goals)) {
                Utils.showNotification('Goals updated successfully!', 'success');
            }
        });
    }
    
    // Exam dates form
    const examDatesForm = document.getElementById('examDatesForm');
    if (examDatesForm) {
        examDatesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const dates = {
                gate: e.target.gateDate.value,
                net: e.target.netDate.value
            };
            
            if (Storage.saveExamDates(dates)) {
                Utils.showNotification('Exam dates updated successfully!', 'success');
            }
        });
    }
    
    // Data management buttons
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    document.getElementById('importDataBtn')?.addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput')?.addEventListener('change', importData);
    document.getElementById('clearDataBtn')?.addEventListener('click', clearAllData);
    
    // Reminder modal
    setupReminderModal();
}

function exportData() {
    const data = Storage.exportAllData();
    const filename = `study-tracker-backup-${Utils.formatDate(new Date())}.json`;
    Utils.downloadJSON(data, filename);
    Utils.showNotification('Data exported successfully!', 'success');
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const data = await Utils.parseJSONFile(file);
        
        if (Utils.confirm('This will replace all existing data. Continue?')) {
            if (Storage.importAllData(data)) {
                Utils.showNotification('Data imported successfully! Reloading...', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                Utils.showNotification('Failed to import data', 'error');
            }
        }
    } catch (error) {
        Utils.showNotification('Invalid file format', 'error');
    }
    
    e.target.value = '';
}

function clearAllData() {
    if (Utils.confirm('⚠️ WARNING: This will permanently delete ALL your data. This action cannot be undone. Are you absolutely sure?')) {
        if (Utils.confirm('Last chance! Click OK to permanently delete everything.')) {
            if (Storage.clearAll()) {
                Utils.showNotification('All data cleared', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        }
    }
}

function loadReminders() {
    const reminders = Storage.getReminders();
    const list = document.getElementById('remindersList');
    
    if (!list) return;
    
    if (reminders.length === 0) {
        list.innerHTML = '<p class="no-data">No reminders set</p>';
        return;
    }
    
    list.innerHTML = reminders.map(reminder => `
        <div class="reminder-item">
            <div class="reminder-content">
                <h4>${reminder.title}</h4>
                <p class="reminder-date">${Utils.formatDateReadable(reminder.date)}</p>
                ${reminder.notes ? `<p>${reminder.notes}</p>` : ''}
            </div>
            <button class="action-btn delete" onclick="deleteReminder('${reminder.id}')">Delete</button>
        </div>
    `).join('');
}

function setupReminderModal() {
    const addBtn = document.getElementById('addReminderBtn');
    const modal = document.getElementById('reminderModal');
    const closeBtn = document.getElementById('closeReminderModal');
    const cancelBtn = document.getElementById('cancelReminderModal');
    const form = document.getElementById('reminderForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            form.reset();
            modal.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const reminder = {
                id: Utils.generateId(),
                title: e.target.title.value,
                date: e.target.date.value,
                notes: e.target.notes.value || ''
            };
            
            if (Storage.saveReminder(reminder)) {
                Utils.showNotification('Reminder added!', 'success');
                modal.classList.remove('active');
                loadReminders();
            }
        });
    }
}

function deleteReminder(id) {
    if (Utils.confirm('Delete this reminder?')) {
        if (Storage.deleteReminder(id)) {
            Utils.showNotification('Reminder deleted', 'success');
            loadReminders();
        }
    }
}

// ============================================
// SAMPLE DATA INITIALIZATION
// ============================================
function initializeSampleData() {
    // Only add sample data if this is the first time
    const logs = Storage.getDailyLogs();
    if (logs.length > 0) return; // Data already exists
    
    // Sample subjects
    const sampleSubjects = [
        { id: Utils.generateId(), name: 'Data Structures', totalTopics: 12, completedTopics: 8, hoursSpent: 45, lastStudied: '2025-11-14' },
        { id: Utils.generateId(), name: 'Algorithms', totalTopics: 15, completedTopics: 10, hoursSpent: 52, lastStudied: '2025-11-13' },
        { id: Utils.generateId(), name: 'Database Management', totalTopics: 10, completedTopics: 6, hoursSpent: 30, lastStudied: '2025-11-12' },
        { id: Utils.generateId(), name: 'Operating Systems', totalTopics: 12, completedTopics: 5, hoursSpent: 28, lastStudied: '2025-11-11' },
        { id: Utils.generateId(), name: 'Computer Networks', totalTopics: 10, completedTopics: 7, hoursSpent: 35, lastStudied: '2025-11-10' }
    ];
    
    sampleSubjects.forEach(subject => Storage.saveSubject(subject));
    
    // Sample daily logs (last 14 days)
    const subjects = ['Data Structures', 'Algorithms', 'Database Management', 'Operating Systems', 'Computer Networks'];
    const exams = ['GATE', 'UGC NET', 'SEBI Grade A'];
    
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const log = {
            id: Utils.generateId(),
            date: Utils.formatDate(date),
            studyHours: Math.floor(Math.random() * 5) + 4, // 4-8 hours
            examFocus: exams[Math.floor(Math.random() * exams.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            problemsSolved: Math.floor(Math.random() * 30) + 10, // 10-40 problems
            platform: 'LeetCode, GFG',
            topics: 'Arrays, Linked Lists, Trees, Dynamic Programming',
            mockTestScore: i % 4 === 0 ? Math.floor(Math.random() * 30) + 60 : null,
            energyLevel: Math.floor(Math.random() * 2) + 3, // 3-5
            notes: 'Good progress. Need to review weak areas.',
            checklist: {
                studyHours: Math.random() > 0.3,
                problemTarget: Math.random() > 0.4,
                revision: Math.random() > 0.5,
                formulaSheets: Math.random() > 0.6,
                aptitude: Math.random() > 0.5,
                exercise: Math.random() > 0.4,
                sleep: Math.random() > 0.3
            }
        };
        
        Storage.saveDailyLog(log);
    }
    
    // Sample mock tests
    const sampleTests = [
        { id: Utils.generateId(), date: '2025-11-10', exam: 'GATE', score: 72, totalMarks: 100, rank: 450, notes: 'Good performance in algorithms' },
        { id: Utils.generateId(), date: '2025-11-05', exam: 'UGC NET', score: 65, totalMarks: 100, rank: 320, notes: 'Need to improve database concepts' },
        { id: Utils.generateId(), date: '2025-10-28', exam: 'GATE', score: 68, totalMarks: 100, rank: 520, notes: 'OS weak areas identified' },
        { id: Utils.generateId(), date: '2025-10-20', exam: 'SEBI Grade A', score: 70, totalMarks: 100, rank: 280, notes: 'Aptitude section strong' },
        { id: Utils.generateId(), date: '2025-10-12', exam: 'GATE', score: 63, totalMarks: 100, rank: 650, notes: 'Networks section needs work' }
    ];
    
    sampleTests.forEach(test => Storage.saveMockTest(test));
    
    // Sample reminders
    const sampleReminders = [
        { id: Utils.generateId(), title: 'GATE Registration Deadline', date: '2025-11-30', notes: 'Don\'t forget to register!' },
        { id: Utils.generateId(), title: 'Mock Test Series', date: '2025-11-20', notes: 'Start full-length mock tests' }
    ];
    
    sampleReminders.forEach(reminder => Storage.saveReminder(reminder));
    
    console.log('Sample data initialized!');
}

// Make functions available globally for onclick handlers
window.deleteDailyLog = deleteDailyLog;
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.editMockTest = editMockTest;
window.deleteMockTest = deleteMockTest;
window.sortTable = sortTable;
window.showDayDetails = showDayDetails;
window.deleteReminder = deleteReminder;
