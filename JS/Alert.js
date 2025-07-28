let alerts = [
                        {
                id: 4,
                flightNumber: "QR2468",
                airline: "القطرية",
                type: "timeout",
                typeName: "تجاوز وقت التشغيل",
                priority: "red",
                priorityName: "طارئ",
                priorityOrder: 1,
                time: "2025-07-28 14:45",
                description: "الطائرة تجاوزت الحد الأقصى المسموح لاستخدام وحدة APU. يجب التدخل الفوري من فريق الصيانة لفحص الوحدة ومنع أي أضرار محتملة.",
                status: "active",
                gate: "D03",
                equipmentId: "APU-005"
            },
            {
                id: 1,
                flightNumber: "SV1234",
                airline: "الخطوط السعودية",
                type: "timeout",
                typeName: "تجاوز وقت التشغيل",
                priority: "red",
                priorityName: "طارئ",
                priorityOrder: 1,
                time: "2025-07-28 14:30",
                description: "تجاوزت الطائرة الوقت المحدد لاستخدام وحدة GPU بمدة 25 دقيقة. يتطلب إيقاف التشغيل فوراً لتجنب إتلاف المعدات وضمان السلامة العامة في المطار.",
                status: "active",
                gate: "A12",
                equipmentId: "GPU-001"
            },

            {
                id: 6,
                flightNumber: "RJ3456",
                airline: "الملكية الأردنية",
                type: "double",
                typeName: "تشغيل مزدوج",
                priority: "red",
                priorityName: "طارئ",
                priorityOrder: 1,
                time: "2025-07-28 15:00",
                description: "تشغيل متزامن لوحدتي GPU و APU مما يشكل خطراً على سلامة الطائرة والمعدات. يتطلب إيقاف فوري وفحص شامل.",
                status: "active",
                gate: "F11",
                equipmentId: "GPU-007, APU-008"
            },
            {
                id: 8,
                flightNumber: "LH7890",
                airline: "لوفتهانزا",
                type: "fuel_system",
                typeName: "نظام الوقود",
                priority: "red",
                priorityName: "طارئ",
                priorityOrder: 1,
                time: "2025-07-28 15:30",
                description: "تسرب طفيف في نظام توصيل الوقود. تم إيقاف العملية فوراً وتفعيل بروتوكولات السلامة. يتطلب فحص فوري من فريق متخصص.",
                status: "active",
                gate: "H02",
                equipmentId: "FUEL-010"
            },
            {
                id: 2,
                flightNumber: "MS7890",
                airline: "مصر للطيران",
                type: "double",
                typeName: "تشغيل مزدوج",
                priority: "yellow",
                priorityName: "متوسط",
                priorityOrder: 2,
                time: "2025-07-28 14:15",
                description: "تم رصد تشغيل وحدتي GPU في نفس الوقت للطائرة MS7890. هذا قد يؤدي إلى هدر في الطاقة وزيادة التكاليف التشغيلية غير المبررة.",
                status: "active",
                gate: "B07",
                equipmentId: "GPU-002, GPU-003"
            },
            {
                id: 5,
                flightNumber: "FZ9876",
                airline: "فلاي دبي",
                type: "power_delay",
                typeName: "تأخر الطاقة الأرضية",
                priority: "yellow",
                priorityName: "متوسط",
                priorityOrder: 2,
                time: "2025-07-28 14:20",
                description: "تأخير في توصيل الطاقة الأرضية بسبب ازدحام شديد في المدرج وتأخر في عمليات الهبوط والإقلاع المجدولة.",
                status: "active",
                gate: "E09",
                equipmentId: "GPU-006"
            },
            {
                id: 7,
                flightNumber: "TK5678",
                airline: "التركية",
                type: "maintenance",
                typeName: "صيانة مطلوبة",
                priority: "yellow",
                priorityName: "متوسط",
                priorityOrder: 2,
                time: "2025-07-28 15:15",
                description: "وحدة GPU تُظهر مؤشرات تحتاج لصيانة دورية. ينصح بإجراء فحص تقني قبل الاستخدام التالي لضمان الأداء الأمثل.",
                status: "active",
                gate: "G05",
                equipmentId: "GPU-009"
            },
            {
                id: 3,
                flightNumber: "EK4567",
                airline: "الإمارات",
                type: "power_delay",
                typeName: "تأخر الطاقة الأرضية",
                priority: "blue",
                priorityName: "منخفض",
                priorityOrder: 3,
                time: "2025-07-28 13:45",
                description: "تأخر في توصيل الطاقة الأرضية لمدة 10 دقائق بسبب عطل فني بسيط في كابل الاتصال. تم حل المشكلة وإعادة التشغيل بنجاح.",
                status: "closed",
                gate: "C15",
                equipmentId: "APU-004"
            }
        ];

        let currentAlertId = null;

        function updateTime() {
            const now = new Date();
            const timeString = now.toLocaleString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('currentTime').textContent = timeString;
        }

        function updateStats(filteredAlerts) {
            const total = filteredAlerts.length;
            const active = filteredAlerts.filter(a => a.status === 'active').length;
            const urgent = filteredAlerts.filter(a => a.priority === 'red' && a.status === 'active').length;

            document.getElementById('totalAlerts').textContent = total;
            document.getElementById('activeAlerts').textContent = active;
            document.getElementById('urgentAlerts').textContent = urgent;
        }

        function sortAlertsByPriority(alerts) {
            return alerts.sort((a, b) => {
                if (a.status !== b.status) {
                    return a.status === 'active' ? -1 : 1;
                }
                if (a.priorityOrder !== b.priorityOrder) {
                    return a.priorityOrder - b.priorityOrder;
                }
                return new Date(b.time) - new Date(a.time);
            });
        }

        function createSparkleEffect(element) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.width = '4px';
            sparkle.style.height = '4px';
            sparkle.style.left = Math.random() * element.offsetWidth + 'px';
            sparkle.style.top = Math.random() * element.offsetHeight + 'px';
            element.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1500);
        }

        function renderAlerts() {
            const alertsList = document.getElementById('alertsList');
            const typeFilter = document.getElementById('alertTypeFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            const priorityFilter = document.getElementById('priorityFilter').value;

            let filteredAlerts = alerts.filter(alert => {
                return (typeFilter === '' || alert.type === typeFilter) &&
                       (statusFilter === '' || alert.status === statusFilter) &&
                       (priorityFilter === '' || alert.priority === priorityFilter);
            });

            filteredAlerts = sortAlertsByPriority(filteredAlerts);

            updateStats(filteredAlerts);

            if (filteredAlerts.length === 0) {
                alertsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="empty-title">لا توجد تنبيهات</div>
                        <div class="empty-message">لا توجد تنبيهات تطابق معايير البحث المحددة.<br>جرب تغيير المرشحات أو انتظر التحديث التلقائي.</div>
                    </div>
                `;
                return;
            }

            alertsList.innerHTML = filteredAlerts.map(alert => {
                const priorityIcons = {
                    red: 'fas fa-exclamation-triangle',
                    yellow: 'fas fa-exclamation-circle',
                    blue: 'fas fa-info-circle'
                };

                return `
                    <div class="alert-item priority-${alert.priority} ${alert.status === 'closed' ? 'closed' : ''}" data-id="${alert.id}">
                        <div class="priority-indicator"></div>
                        <div class="alert-header">
                            <div class="priority-badge">
                                <i class="${priorityIcons[alert.priority]}"></i>
                                ${alert.priorityName}
                            </div>
                            <div class="flight-info">
                                <div class="flight-number">
                                    <i class="fas fa-plane"></i>
                                    ${alert.flightNumber}
                                </div>
                                <div class="alert-type">${alert.typeName}</div>
                                <div style="font-size: 0.8rem; color: #95a5a6; margin-top: 3px;">
                                    ${alert.airline} • البوابة: ${alert.gate}
                                </div>
                            </div>
                            <div class="alert-time">
                                <div style="margin-bottom: 3px;">وقت الإنشاء</div>
                                <div class="time-value">${alert.time}</div>
                            </div>
                            <div class="status-badge status-${alert.status}">
                                ${alert.status === 'active' ? 'نشط' : 'مغلق'}
                            </div>
                            <div class="severity-icon">
                                <i class="${priorityIcons[alert.priority]}"></i>
                            </div>
                        </div>
                        <div class="alert-description">
                            <div class="equipment-info">المعدات المتأثرة: ${alert.equipmentId}</div>
                            ${alert.description}
                        </div>
                        <div class="alert-actions">
                            ${alert.status === 'active' ? `
                                <button class="action-btn btn-confirm" onclick="confirmAlert(${alert.id})">
                                    <i class="fas fa-check"></i>
                                    تأكيد المعالجة
                                </button>
                            ` : ''}
                            <button class="action-btn btn-note" onclick="addNote(${alert.id})">
                                <i class="fas fa-sticky-note"></i>
                                إضافة ملاحظات
                            </button>
                            ${alert.status === 'active' ? `
                                <button class="action-btn btn-assign" onclick="assignAlert(${alert.id})">
                                    <i class="fas fa-users"></i>
                                    إعادة توجيه
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            setTimeout(() => {
                document.querySelectorAll('.alert-item.priority-red .priority-badge').forEach(badge => {
                    if (Math.random() > 0.7) {
                        createSparkleEffect(badge);
                    }
                });
            }, 500);
        }

        function confirmAlert(alertId) {
            const alert = alerts.find(a => a.id === alertId);
            if (alert) {
                alert.status = 'closed';
                renderAlerts();
                showNotification('تم تأكيد معالجة التنبيه بنجاح', 'success');
            }
        }

        function addNote(alertId) {
            currentAlertId = alertId;
            document.getElementById('noteText').value = '';
            document.getElementById('noteModal').style.display = 'block';
        }

        function assignAlert(alertId) {
            currentAlertId = alertId;
            document.getElementById('teamSelect').value = '';
            document.getElementById('assignNote').value = '';
            document.getElementById('assignModal').style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
            currentAlertId = null;
        }

        function saveNote() {
            const noteText = document.getElementById('noteText').value.trim();
            if (noteText) {
                showNotification('تم حفظ الملاحظة بنجاح', 'success');
                closeModal('noteModal');
            } else {
                showNotification('يرجى كتابة ملاحظة قبل الحفظ', 'error');
            }
        }

        function assignTask() {
            const team = document.getElementById('teamSelect').value;
            const note = document.getElementById('assignNote').value.trim();
            
            if (team) {
                const teamNames = {
                    'maintenance': 'فريق الصيانة التقنية',
                    'operations': 'فريق العمليات الجوية',
                    'ground_support': 'فريق الدعم الأرضي',
                    'electrical': 'فريق الأنظمة الكهربائية',
                    'safety': 'فريق السلامة والأمان',
                    'management': 'الإدارة العليا',
                    'fuel_systems': 'فريق أنظمة الوقود',
                    'air_traffic': 'فريق مراقبة الحركة الجوية'
                };
                showNotification(`تم توجيه المهمة إلى ${teamNames[team]} بنجاح`, 'success');
                closeModal('assignModal');
            } else {
                showNotification('يرجى اختيار فريق قبل التوجيه', 'error');
            }
        }

        function showAutoRefreshNotification() {
            const notification = document.getElementById('autoRefreshNotification');
            notification.style.display = 'flex';
            
            setTimeout(() => {
                notification.style.animation = 'slideUp 0.4s ease reverse';
                setTimeout(() => {
                    notification.style.display = 'none';
                    notification.style.animation = 'slideUp 0.4s ease';
                }, 400);
            }, 2500);
        }

        function autoRefresh() {
            renderAlerts();
            showAutoRefreshNotification();
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                ${message}
            `;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'notificationSlide 0.4s ease reverse';
                setTimeout(() => document.body.removeChild(notification), 400);
            }, 3500);
        }

        async function loadAlertsFromJSON() {
            try {
                renderAlerts();
            } catch (error) {
                console.log('Using default data - JSON file not found');
                renderAlerts();
            }
        }

        document.getElementById('alertTypeFilter').addEventListener('change', renderAlerts);
        document.getElementById('statusFilter').addEventListener('change', renderAlerts);
        document.getElementById('priorityFilter').addEventListener('change', renderAlerts);

        window.onclick = function(event) {
            const noteModal = document.getElementById('noteModal');
            const assignModal = document.getElementById('assignModal');
            if (event.target === noteModal) {
                closeModal('noteModal');
            }
            if (event.target === assignModal) {
                closeModal('assignModal');
            }
        }

        updateTime();
        setInterval(updateTime, 1000);
        
        setInterval(autoRefresh, 60000);
        
        loadAlertsFromJSON();

        setInterval(() => {
            document.querySelectorAll('.alert-item.priority-red .severity-icon').forEach(icon => {
                if (Math.random() > 0.8) {
                    createSparkleEffect(icon);
                }
            });
        }, 3000);