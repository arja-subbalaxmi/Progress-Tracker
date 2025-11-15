// ============================================
// Utility Functions
// ============================================

const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format date to YYYY-MM-DD
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Format date to readable string
    formatDateReadable(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    // Get today's date in YYYY-MM-DD format
    getToday() {
        return this.formatDate(new Date());
    },

    // Calculate days between two dates
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Get week start and end dates
    getWeekRange(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Sunday
        
        const weekStart = new Date(d.setDate(diff));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return {
            start: this.formatDate(weekStart),
            end: this.formatDate(weekEnd)
        };
    },

    // Get month start and end dates
    getMonthRange(date = new Date()) {
        const d = new Date(date);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        return {
            start: this.formatDate(monthStart),
            end: this.formatDate(monthEnd)
        };
    },

    // Get last N days dates
    getLastNDays(n) {
        const dates = [];
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(this.formatDate(date));
        }
        return dates;
    },

    // Calculate percentage
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },

    // Calculate average
    calculateAverage(numbers) {
        if (!numbers || numbers.length === 0) return 0;
        const sum = numbers.reduce((a, b) => a + b, 0);
        return Math.round((sum / numbers.length) * 10) / 10;
    },

    // Calculate study streak
    calculateStreak(logs) {
        if (!logs || logs.length === 0) return 0;
        
        const sortedLogs = logs
            .filter(log => log.studyHours > 0)
            .map(log => log.date)
            .sort()
            .reverse();
        
        if (sortedLogs.length === 0) return 0;
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (const logDate of sortedLogs) {
            const date = new Date(logDate);
            date.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
            } else if (diffDays > streak) {
                break;
            }
        }
        
        return streak;
    },

    // Get motivational quotes
    getMotivationalQuote() {
        const quotes = [
            "Success is the sum of small efforts repeated day in and day out.",
            "The only way to do great work is to love what you do.",
            "Don't watch the clock; do what it does. Keep going.",
            "The future depends on what you do today.",
            "Believe you can and you're halfway there.",
            "Study hard, for the well is deep, and our brains are shallow.",
            "The expert in anything was once a beginner.",
            "Your limitation—it's only your imagination.",
            "Great things never come from comfort zones.",
            "Dream it. Wish it. Do it.",
            "Success doesn't just find you. You have to go out and get it.",
            "The harder you work for something, the greater you'll feel when you achieve it.",
            "Dream bigger. Do bigger.",
            "Don't stop when you're tired. Stop when you're done.",
            "Wake up with determination. Go to bed with satisfaction.",
            "Do something today that your future self will thank you for.",
            "Little things make big days.",
            "It's going to be hard, but hard does not mean impossible.",
            "Don't wait for opportunity. Create it.",
            "Sometimes we're tested not to show our weaknesses, but to discover our strengths."
        ];
        
        const today = new Date().getDate();
        return quotes[today % quotes.length];
    },

    // Show notification
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Get status color based on percentage
    getStatusColor(percentage) {
        if (percentage < 30) return 'status-low';
        if (percentage < 70) return 'status-medium';
        return 'status-high';
    },

    // Download JSON file
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Parse JSON file
    async parseJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Sort table helper
    sortTable(table, column, ascending = true) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const sortedRows = rows.sort((a, b) => {
            const aValue = a.cells[column].textContent.trim();
            const bValue = b.cells[column].textContent.trim();
            
            // Try to parse as number
            const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
            const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return ascending ? aNum - bNum : bNum - aNum;
            }
            
            // String comparison
            return ascending 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
        });
        
        tbody.innerHTML = '';
        sortedRows.forEach(row => tbody.appendChild(row));
    },

    // Filter table rows
    filterTable(table, searchTerm, filterColumn = null) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const text = cells
                .filter((cell, index) => !filterColumn || index === filterColumn)
                .map(cell => cell.textContent.toLowerCase())
                .join(' ');
            
            if (text.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // Toggle dark mode
    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        Storage.saveSetting('darkMode', isDark);
        
        // Update all dark mode toggle buttons
        const buttons = document.querySelectorAll('#darkModeToggle, #darkModeSwitch');
        buttons.forEach(btn => {
            if (btn.type === 'checkbox') {
                btn.checked = isDark;
            } else {
                btn.textContent = isDark ? '☀️' : '🌙';
            }
        });
        
        return isDark;
    },

    // Initialize dark mode
    initDarkMode() {
        const settings = Storage.getSettings();
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            const buttons = document.querySelectorAll('#darkModeToggle, #darkModeSwitch');
            buttons.forEach(btn => {
                if (btn.type === 'checkbox') {
                    btn.checked = true;
                } else {
                    btn.textContent = '☀️';
                }
            });
        }
    },

    // Format time from minutes
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    },

    // Get calendar data for a month
    getCalendarData(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return {
            year,
            month,
            daysInMonth,
            startingDayOfWeek,
            firstDay,
            lastDay
        };
    },

    // Get study hours for date
    getStudyHoursForDate(date, logs) {
        const log = logs.find(l => l.date === date);
        return log ? log.studyHours : 0;
    }
};

// Make Utils available globally
window.Utils = Utils;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
