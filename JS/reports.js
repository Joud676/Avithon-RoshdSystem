document.addEventListener('DOMContentLoaded', function() {
            initializeCharts();
            updateRealTimeData();
            
            // Update data every 30 seconds
            setInterval(updateRealTimeData, 30000);
        });

        // Chart instances
        let comparisonChart, complianceChart;

        // Initialize all charts
        function initializeCharts() {
            // APU vs GPU Comparison Chart
            const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
            comparisonChart = new Chart(comparisonCtx, {
                type: 'line',
                data: {
                    labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                    datasets: [{
                        label: 'استهلاك APU (كجم CO₂)',
                        data: [120, 135, 142, 128, 155, 167, 145],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'استهلاك GPU (كجم CO₂)',
                        data: [45, 52, 48, 42, 58, 62, 55],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    family: 'Cairo',
                                    size: 12
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: {
                                    family: 'Cairo'
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    family: 'Cairo'
                                }
                            }
                        }
                    }
                }
            });

            // Compliance Rate Pie Chart
            const complianceCtx = document.getElementById('complianceChart').getContext('2d');
            complianceChart = new Chart(complianceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['ملتزم بالحدود', 'تجاوز الحدود', 'تحت المراقبة'],
                    datasets: [{
                        data: [73, 18, 9],
                        backgroundColor: [
                            '#10b981',
                            '#ef4444',
                            '#f59e0b'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: 'Cairo',
                                    size: 11
                                },
                                padding: 15
                            }
                        }
                    }
                }
            });
        }

        // Update real-time data
        function updateRealTimeData() {
            // Simulate real-time data updates
            const totalEmissions = (800 + Math.random() * 100).toFixed(1);
            const savedEmissions = (300 + Math.random() * 50).toFixed(1);
            const urgentAlerts = Math.floor(20 + Math.random() * 10);
            const gpuUtilization = Math.floor(70 + Math.random() * 20);

            document.getElementById('totalEmissions').textContent = totalEmissions;
            document.getElementById('savedEmissions').textContent = savedEmissions;
            document.getElementById('urgentAlerts').textContent = urgentAlerts;
            document.getElementById('gpuUtilization').textContent = gpuUtilization + '%';

            // Update KPIs
            document.getElementById('avgApuTime').textContent = (15 + Math.random() * 10).toFixed(1);
            document.getElementById('dailyAlerts').textContent = (2 + Math.random() * 2).toFixed(1);
            document.getElementById('gpuUsage').textContent = gpuUtilization + '%';
            document.getElementById('fuelSavings').textContent = Math.floor(400 + Math.random() * 100);
        }

        // Filter data by time period
        function filterData(period) {
            // Remove active class from all buttons
            document.querySelectorAll('.date-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            event.target.classList.add('active');

            // Update charts based on selected period
            updateChartsForPeriod(period);
        }

        // Update charts for specific time period
        function updateChartsForPeriod(period) {
            let labels, apuData, gpuData;

            switch(period) {
                case 'today':
                    labels = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
                    apuData = [25, 45, 65, 52, 48, 30];
                    gpuData = [12, 18, 28, 22, 20, 15];
                    break;
                case 'week':
                    labels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
                    apuData = [120, 135, 142, 128, 155, 167, 145];
                    gpuData = [45, 52, 48, 42, 58, 62, 55];
                    break;
                case 'month':
                    labels = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'];
                    apuData = [980, 1150, 1320, 1180];
                    gpuData = [420, 480, 520, 460];
                    break;
                case 'quarter':
                    labels = ['يناير', 'فبراير', 'مارس'];
                    apuData = [4200, 3890, 4350];
                    gpuData = [1680, 1560, 1740];
                    break;
            }

            // Update comparison chart
            comparisonChart.data.labels = labels;
            comparisonChart.data.datasets[0].data = apuData;
            comparisonChart.data.datasets[1].data = gpuData;
            comparisonChart.update();
        }

        // Download report function
        function downloadReport(format) {
            // Show loading state
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
            btn.disabled = true;

            // Simulate download process
            setTimeout(() => {
                // Create download link
                const link = document.createElement('a');
                const filename = `rushd-report-${new Date().toISOString().split('T')[0]}.${format}`;
                
                if (format === 'pdf') {
                    // Simulate PDF generation
                    alert('تم إنشاء تقرير PDF بنجاح!\nاسم الملف: ' + filename);
                } else if (format === 'excel') {
                    // Simulate Excel generation
                    alert('تم إنشاء تقرير Excel بنجاح!\nاسم الملف: ' + filename);
                }

                // Reset button
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }

        // Add hover effects to stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Animate numbers on page load
        function animateNumbers() {
            const numbers = document.querySelectorAll('.stat-value, .kpi-value');
            numbers.forEach(num => {
                const target = parseFloat(num.textContent);
                const increment = target / 50;
                let current = 0;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    num.textContent = current.toFixed(1);
                }, 30);
            });
        }

        // Start number animation after page load
        setTimeout(animateNumbers, 500);