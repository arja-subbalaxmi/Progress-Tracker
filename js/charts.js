// ============================================
// Chart.js Implementations
// ============================================

const Charts = {
    // Chart instances storage
    instances: {},

    // Default chart options
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        }
    },

    // Destroy existing chart if it exists
    destroyChart(chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },

    // ============================================
    // Weekly Study Hours Chart (Dashboard)
    // ============================================
    createWeeklyHoursChart(canvasId) {
        this.destroyChart(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const logs = Storage.getDailyLogs();
        const last7Days = Utils.getLastNDays(7);
        
        const data = last7Days.map(date => {
            const log = logs.find(l => l.date === date);
            return log ? log.studyHours : 0;
        });

        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });

        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Hours',
                    data: data,
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} hours`;
                            }
                        }
                    }
                }
            }
        });
    },

    // ============================================
    // Subject Progress Pie Chart (Dashboard)
    // ============================================
    createSubjectProgressChart(canvasId) {
        this.destroyChart(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const subjects = Storage.getSubjects();
        
        if (subjects.length === 0) {
            // Show "no data" message
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Inter';
            ctx.fillStyle = '#9CA3AF';
            ctx.textAlign = 'center';
            ctx.fillText('No subjects added yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const data = subjects.map(s => {
            const percentage = s.totalTopics > 0 
                ? (s.completedTopics / s.totalTopics) * 100 
                : 0;
            return percentage;
        });

        const labels = subjects.map(s => s.name);
        const colors = [
            '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
        ];

        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, subjects.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = Math.round(context.parsed);
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        });
    },

    // ============================================
    // Mock Test Performance Trend Chart
    // ============================================
    createPerformanceTrendChart(canvasId) {
        this.destroyChart(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const tests = Storage.getMockTests();
        
        if (tests.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Inter';
            ctx.fillStyle = '#9CA3AF';
            ctx.textAlign = 'center';
            ctx.fillText('No mock tests recorded yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Sort by date (oldest first for trend)
        const sortedTests = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));

        const data = sortedTests.map(t => {
            return (t.score / t.totalMarks) * 100;
        });

        const labels = sortedTests.map(t => {
            const d = new Date(t.date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score %',
                    data: data,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#10B981'
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Score: ${Math.round(context.parsed.y)}%`;
                            }
                        }
                    }
                }
            }
        });
    },

    // ============================================
    // Weekday Productivity Chart (Analytics)
    // ============================================
    createWeekdayChart(canvasId) {
        this.destroyChart(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const logs = Storage.getDailyLogs();
        
        // Aggregate hours by day of week
        const weekdayHours = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
        const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

        logs.forEach(log => {
            const date = new Date(log.date);
            const day = date.getDay();
            weekdayHours[day] += log.studyHours;
            weekdayCounts[day]++;
        });

        const avgHours = weekdayHours.map((hours, index) => {
            return weekdayCounts[index] > 0 ? hours / weekdayCounts[index] : 0;
        });

        const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Hours',
                    data: avgHours,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(20, 184, 166, 0.8)'
                    ],
                    borderRadius: 8,
                    borderWidth: 2
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Avg: ${context.parsed.y.toFixed(1)} hours`;
                            }
                        }
                    }
                }
            }
        });
    },

    // ============================================
    // Subject Time Distribution Chart (Analytics)
    // ============================================
    createSubjectTimeChart(canvasId) {
        this.destroyChart(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const subjects = Storage.getSubjects();
        
        if (subjects.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Inter';
            ctx.fillStyle = '#9CA3AF';
            ctx.textAlign = 'center';
            ctx.fillText('No subjects added yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const data = subjects.map(s => s.hoursSpent);
        const labels = subjects.map(s => s.name);
        const colors = [
            '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
        ];

        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, subjects.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}h (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // ============================================
    // Study Hours Trend Chart (Analytics)
    // ============================================
    createTrendChart(canvasId, days = 30) {
        this.destroyChart(canvasId);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const logs = Storage.getDailyLogs();
        const lastNDays = Utils.getLastNDays(days);
        
        const data = lastNDays.map(date => {
            const log = logs.find(l => l.date === date);
            return log ? log.studyHours : 0;
        });

        const labels = lastNDays.map((date, index) => {
            if (days === 30 && index % 5 !== 0) return ''; // Show every 5th label for 30 days
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Hours',
                    data: data,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4F46E5'
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                const date = lastNDays[index];
                                return Utils.formatDateReadable(date);
                            },
                            label: function(context) {
                                return `${context.parsed.y} hours`;
                            }
                        }
                    }
                }
            }
        });
    },

    // ============================================
    // Initialize all charts on a page
    // ============================================
    initializePageCharts(page) {
        switch(page) {
            case 'dashboard':
                this.createWeeklyHoursChart('weeklyHoursChart');
                this.createSubjectProgressChart('subjectProgressChart');
                break;
            case 'mockTests':
                this.createPerformanceTrendChart('performanceTrendChart');
                break;
            case 'analytics':
                this.createWeekdayChart('weekdayChart');
                this.createSubjectTimeChart('subjectTimeChart');
                this.createTrendChart('trendChart', 30);
                break;
        }
    },

    // ============================================
    // Refresh all charts on a page
    // ============================================
    refreshPageCharts(page) {
        this.initializePageCharts(page);
    }
};

// Make Charts available globally
window.Charts = Charts;
