// ============================================
// Local Storage Management
// ============================================

const Storage = {
    // Keys
    KEYS: {
        DAILY_LOGS: 'studyTracker_dailyLogs',
        SUBJECTS: 'studyTracker_subjects',
        MOCK_TESTS: 'studyTracker_mockTests',
        GOALS: 'studyTracker_goals',
        EXAM_DATES: 'studyTracker_examDates',
        REMINDERS: 'studyTracker_reminders',
        SETTINGS: 'studyTracker_settings'
    },

    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all app data
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // ============================================
    // Daily Logs Operations
    // ============================================
    getDailyLogs() {
        return this.get(this.KEYS.DAILY_LOGS) || [];
    },

    saveDailyLog(log) {
        const logs = this.getDailyLogs();
        const existingIndex = logs.findIndex(l => l.id === log.id);
        
        if (existingIndex >= 0) {
            logs[existingIndex] = log;
        } else {
            logs.push(log);
        }
        
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        return this.set(this.KEYS.DAILY_LOGS, logs);
    },

    deleteDailyLog(id) {
        const logs = this.getDailyLogs();
        const filtered = logs.filter(l => l.id !== id);
        return this.set(this.KEYS.DAILY_LOGS, filtered);
    },

    getDailyLogByDate(date) {
        const logs = this.getDailyLogs();
        return logs.find(l => l.date === date);
    },

    // ============================================
    // Subjects Operations
    // ============================================
    getSubjects() {
        return this.get(this.KEYS.SUBJECTS) || [];
    },

    saveSubject(subject) {
        const subjects = this.getSubjects();
        const existingIndex = subjects.findIndex(s => s.id === subject.id);
        
        if (existingIndex >= 0) {
            subjects[existingIndex] = subject;
        } else {
            subjects.push(subject);
        }
        
        return this.set(this.KEYS.SUBJECTS, subjects);
    },

    deleteSubject(id) {
        const subjects = this.getSubjects();
        const filtered = subjects.filter(s => s.id !== id);
        return this.set(this.KEYS.SUBJECTS, filtered);
    },

    getSubjectByName(name) {
        const subjects = this.getSubjects();
        return subjects.find(s => s.name === name);
    },

    // ============================================
    // Mock Tests Operations
    // ============================================
    getMockTests() {
        return this.get(this.KEYS.MOCK_TESTS) || [];
    },

    saveMockTest(test) {
        const tests = this.getMockTests();
        const existingIndex = tests.findIndex(t => t.id === test.id);
        
        if (existingIndex >= 0) {
            tests[existingIndex] = test;
        } else {
            tests.push(test);
        }
        
        tests.sort((a, b) => new Date(b.date) - new Date(a.date));
        return this.set(this.KEYS.MOCK_TESTS, tests);
    },

    deleteMockTest(id) {
        const tests = this.getMockTests();
        const filtered = tests.filter(t => t.id !== id);
        return this.set(this.KEYS.MOCK_TESTS, filtered);
    },

    // ============================================
    // Goals Operations
    // ============================================
    getGoals() {
        const defaultGoals = {
            monthly: {
                studyHours: 250,
                topicsComplete: 15,
                mockTests: 8,
                problemsSolved: 500
            }
        };
        return this.get(this.KEYS.GOALS) || defaultGoals;
    },

    saveGoals(goals) {
        return this.set(this.KEYS.GOALS, goals);
    },

    // ============================================
    // Exam Dates Operations
    // ============================================
    getExamDates() {
        const defaultDates = {
            gate: '2026-02-01',
            net: '2025-12-15'
        };
        return this.get(this.KEYS.EXAM_DATES) || defaultDates;
    },

    saveExamDates(dates) {
        return this.set(this.KEYS.EXAM_DATES, dates);
    },

    // ============================================
    // Reminders Operations
    // ============================================
    getReminders() {
        return this.get(this.KEYS.REMINDERS) || [];
    },

    saveReminder(reminder) {
        const reminders = this.getReminders();
        const existingIndex = reminders.findIndex(r => r.id === reminder.id);
        
        if (existingIndex >= 0) {
            reminders[existingIndex] = reminder;
        } else {
            reminders.push(reminder);
        }
        
        reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
        return this.set(this.KEYS.REMINDERS, reminders);
    },

    deleteReminder(id) {
        const reminders = this.getReminders();
        const filtered = reminders.filter(r => r.id !== id);
        return this.set(this.KEYS.REMINDERS, filtered);
    },

    // ============================================
    // Settings Operations
    // ============================================
    getSettings() {
        const defaultSettings = {
            darkMode: false
        };
        return this.get(this.KEYS.SETTINGS) || defaultSettings;
    },

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.set(this.KEYS.SETTINGS, settings);
    },

    // ============================================
    // Export/Import Operations
    // ============================================
    exportAllData() {
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            dailyLogs: this.getDailyLogs(),
            subjects: this.getSubjects(),
            mockTests: this.getMockTests(),
            goals: this.getGoals(),
            examDates: this.getExamDates(),
            reminders: this.getReminders(),
            settings: this.getSettings()
        };
        return data;
    },

    importAllData(data) {
        try {
            if (data.dailyLogs) this.set(this.KEYS.DAILY_LOGS, data.dailyLogs);
            if (data.subjects) this.set(this.KEYS.SUBJECTS, data.subjects);
            if (data.mockTests) this.set(this.KEYS.MOCK_TESTS, data.mockTests);
            if (data.goals) this.set(this.KEYS.GOALS, data.goals);
            if (data.examDates) this.set(this.KEYS.EXAM_DATES, data.examDates);
            if (data.reminders) this.set(this.KEYS.REMINDERS, data.reminders);
            if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};

// Make Storage available globally
window.Storage = Storage;
