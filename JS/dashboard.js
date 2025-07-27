

window.onclick = function (event) {
    const modal = document.getElementById('settingsModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
let dashboardData = null;

async function fetchDashboardData() {
    try {
        const response = await fetch('../JSON/data.json').catch(() => ({ ok: false }));

        if (!response.ok) {
            dashboardData = {
                "aircraftTypes": {
                    "A320-neo": { "apuConsumption": 126 },
                    "A320-ceo": { "apuConsumption": 126 },
                    "B777-300ER": { "apuConsumption": 312 },
                    "A330-300": { "apuConsumption": 210 }
                },
                "emissionFactors": {
                    "apu": { "co2Factor": 3.16 },
                    "groundPower": {
                        "electricGPU": { "co2Emissions": 4.0 },
                        "dieselGPU": { "fuelConsumption": 18, "fuelDensity": 15.3, "emissionFactor": 2.681 },
                        "pca": { "fuelConsumption": 7, "fuelDensity": 6.0, "emissionFactor": 2.681 }
                    }
                },
                "flights": [
                    {
                        "flightNumber": "SV1234", "aircraftType": "B777-300ER", "gate": "A1",
                        "apu": { "status": "مُشغل", "duration": 40 },
                        "groundPower": { "gpu": { "connected": true, "type": "electric" }, "pca": { "connected": true } }
                    },
                    {
                        "flightNumber": "XY419", "aircraftType": "A320-neo", "gate": "B3",
                        "apu": { "status": "متوقف", "duration": 0 },
                        "groundPower": { "gpu": { "connected": true, "type": "electric" }, "pca": { "connected": true } }
                    },
                    {
                        "flightNumber": "F31205", "aircraftType": "A320-neo", "gate": "C2",
                        "apu": { "status": "مُشغل", "duration": 115 },
                        "groundPower": { "gpu": { "connected": false }, "pca": { "connected": false } }
                    },
                    {
                        "flightNumber": "SV2156", "aircraftType": "A330-300", "gate": "D1",
                        "apu": { "status": "مُشغل", "duration": 190 },
                        "groundPower": { "gpu": { "connected": false }, "pca": { "connected": false } }
                    },
                    {
                        "flightNumber": "XY1847", "aircraftType": "A320-ceo", "gate": "A5",
                        "apu": { "status": "مُشغل", "duration": 65 },
                        "groundPower": { "gpu": { "connected": true, "type": "diesel" }, "pca": { "connected": false } }
                    }
                ],
                "alerts": [
                    { "flightNumber": "SV2156", "priority": "حرج", "message": "تشغل APU لأكثر من 3 ساعات", "timestamp": "2025-01-27T14:20:00Z" },
                    { "flightNumber": "F31205", "priority": "تحذير", "message": "تشغل APU بدون طاقة أرضية", "timestamp": "2025-01-27T14:05:00Z" },
                    { "flightNumber": "XY1847", "priority": "تنبيه", "message": "تقترب من حد الساعة", "timestamp": "2025-01-27T14:25:00Z" }
                ]
            };
        } else {
            dashboardData = await response.json();
        }

        return dashboardData;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function calculateAPUEmissions(aircraftType, durationMinutes) {
    if (!dashboardData) return { fuel: 0, co2: 0 };

    const aircraft = dashboardData.aircraftTypes[aircraftType];
    const emissionFactors = dashboardData.emissionFactors;

    if (!aircraft || !emissionFactors) return { fuel: 0, co2: 0 };

    const hours = durationMinutes / 60;
    const fuelConsumed = aircraft.apuConsumption * hours;
    const co2Emitted = fuelConsumed * emissionFactors.apu.co2Factor;

    return {
        fuel: fuelConsumed,
        co2: co2Emitted
    };
}

function calculateGroundPowerEmissions(groundPower, durationMinutes) {
    if (!dashboardData) return 0;

    const emissionFactors = dashboardData.emissionFactors.groundPower;
    const hours = durationMinutes / 60;
    let totalCO2 = 0;

    if (groundPower.gpu && groundPower.gpu.connected) {
        if (groundPower.gpu.type === 'electric') {
            totalCO2 += emissionFactors.electricGPU.co2Emissions * hours;
        } else if (groundPower.gpu.type === 'diesel') {
            const fuelLiters = emissionFactors.dieselGPU.fuelConsumption * hours;
            const fuelKg = fuelLiters * emissionFactors.dieselGPU.fuelDensity;
            totalCO2 += fuelKg * emissionFactors.dieselGPU.emissionFactor;
        }
    }

    if (groundPower.pca && groundPower.pca.connected) {
        const fuelLiters = emissionFactors.pca.fuelConsumption * hours;
        const fuelKg = fuelLiters * emissionFactors.pca.fuelDensity;
        totalCO2 += fuelKg * emissionFactors.pca.emissionFactor;
    }

    return totalCO2;
}

function calculateDailyStats() {
    if (!dashboardData || !dashboardData.flights) return null;

    const flights = dashboardData.flights;
    let totalFuelConsumed = 0;
    let totalCO2Emitted = 0;
    let totalGroundCO2 = 0;

    const stats = {
        totalFlights: flights.length,
        apuRunning: flights.filter(f => f.apu.status === 'مُشغل').length,
        gpuConnected: flights.filter(f => f.groundPower.gpu && f.groundPower.gpu.connected).length,
        pcaConnected: flights.filter(f => f.groundPower.pca && f.groundPower.pca.connected).length,
        criticalAlerts: dashboardData.alerts ? dashboardData.alerts.filter(a => a.priority === 'حرج').length : 0
    };

    flights.forEach(flight => {
        const apuEmissions = calculateAPUEmissions(flight.aircraftType, flight.apu.duration);
        const groundEmissions = calculateGroundPowerEmissions(flight.groundPower, flight.apu.duration);

        totalFuelConsumed += apuEmissions.fuel;
        totalCO2Emitted += apuEmissions.co2;
        totalGroundCO2 += groundEmissions;
    });

    const potentialGroundCO2 = flights.reduce((total, flight) => {
        const optimalGroundPower = {
            gpu: { connected: true, type: 'electric' },
            pca: { connected: true }
        };
        return total + calculateGroundPowerEmissions(optimalGroundPower, flight.apu.duration);
    }, 0);

    stats.totalFuelConsumed = totalFuelConsumed;
    stats.totalCO2Emitted = totalCO2Emitted;
    stats.co2Saved = Math.max(0, totalCO2Emitted - potentialGroundCO2);
    stats.efficiencyRate = Math.min(100, Math.max(0, (stats.co2Saved / totalCO2Emitted) * 100));

    return stats;
}

function connectGPU(flightNumber) {
    const flight = dashboardData.flights.find(f => f.flightNumber === flightNumber);
    if (flight) {
        flight.groundPower.gpu.connected = !flight.groundPower.gpu.connected;
        if (flight.groundPower.gpu.connected) {
            flight.groundPower.gpu.type = 'electric';
            updateFlightStatus(flight);
            showNotification(`تم توصيل GPU للطائرة ${flightNumber}`);
        } else {
            updateFlightStatus(flight);
            showNotification(`تم قطع GPU عن الطائرة ${flightNumber}`);
        }
        updateKPIs();
        populateFlightsTable();
    }
}

function connectPCA(flightNumber) {
    const flight = dashboardData.flights.find(f => f.flightNumber === flightNumber);
    if (flight) {
        flight.groundPower.pca.connected = !flight.groundPower.pca.connected;
        if (flight.groundPower.pca.connected) {
            updateFlightStatus(flight);
            showNotification(`تم توصيل PCA للطائرة ${flightNumber}`);
        } else {
            updateFlightStatus(flight);
            showNotification(`تم قطع PCA عن الطائرة ${flightNumber}`);
        }
        updateKPIs();
        populateFlightsTable();
    }
}

function updateFlightStatus(flight) {
    const hasGPU = flight.groundPower.gpu && flight.groundPower.gpu.connected;
    const hasPCA = flight.groundPower.pca && flight.groundPower.pca.connected;

    if (hasGPU || hasPCA) {
        flight.apu.status = hasGPU && hasPCA ? 'GPU + PCA متصل' : hasGPU ? 'GPU متصل' : 'PCA متصل';
    } else {
        flight.apu.status = 'مُشغل';
    }
}

function sendAlert(flightNumber) {
    showNotification(`تم إرسال تنبيه للطاقم الأرضي - الطائرة ${flightNumber}`, 'warning');
}

function emergencyShutdown(flightNumber) {
    const flight = dashboardData.flights.find(f => f.flightNumber === flightNumber);
    if (flight) {
        flight.apu.status = 'متوقف';
        flight.apu.duration = 0;
        showNotification(`تم الإيقاف الطارئ للطائرة ${flightNumber}`, 'danger');
        updateKPIs();
        populateFlightsTable();
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await fetchDashboardData();

    if (!dashboardData) {
        showNotification('خطأ في تحميل البيانات', 'danger');
        return;
    }

    updateCurrentTime();
    updateKPIs();
    populateFlightsTable();
    populateAlertsSidebar();
    initializeCalculator();
    drawCharts();

    setInterval(updateCurrentTime, 1000);

    setInterval(() => {
        updateKPIs();
        populateFlightsTable();
    }, 30000);
});

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    updateElement('currentTime', timeString);
}

function updateKPIs() {
    if (!dashboardData) return;

    const stats = calculateDailyStats();
    if (!stats) return;

    updateElement('totalFlights', stats.totalFlights);
    updateElement('apuRunning', stats.apuRunning);
    updateElement('fuelConsumed', Math.round(stats.totalFuelConsumed).toLocaleString());
    updateElement('co2Saved', Math.round(stats.co2Saved).toLocaleString());
    updateElement('activeAlerts', dashboardData.alerts ? dashboardData.alerts.length : 0);
    updateElement('efficiencyRate', Math.round(stats.efficiencyRate) + '%');

    updateElement('todayEmissions', Math.round(stats.totalCO2Emitted).toLocaleString());
    updateElement('fuelSavedTotal', Math.round(stats.co2Saved / 3.16).toLocaleString());

    updateElement('activeCount', stats.totalFlights);
    updateElement('alertCount', dashboardData.alerts ? dashboardData.alerts.length : 0);
    updateElement('alertBadge', (dashboardData.alerts ? dashboardData.alerts.length : 0) + ' تنبيهات');
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function populateFlightsTable() {
    if (!dashboardData) return;

    const aircraftGrid = document.getElementById('aircraftGrid');
    if (!aircraftGrid) return;

    aircraftGrid.innerHTML = '';

    dashboardData.flights.forEach(flight => {
        const card = createAircraftCard(flight);
        aircraftGrid.appendChild(card);
    });
}

function createAircraftCard(flight) {
    const card = document.createElement('div');
    card.className = `aircraft-card ${flight.apu.duration > 15 ? 'alert' : ''}`;

    const apuEmissions = calculateAPUEmissions(flight.aircraftType, flight.apu.duration);
    const progressPercent = Math.min((flight.apu.duration / 15) * 100, 100);
    let progressClass = 'progress-normal';
    if (progressPercent > 80) progressClass = 'progress-warning';
    if (progressPercent > 100) progressClass = 'progress-danger';

    const timeRemaining = Math.max(0, 15 - flight.apu.duration);

    card.innerHTML = `
        <div class="aircraft-header">
            <div class="aircraft-id">${flight.flightNumber}</div>
            <div class="status-badge ${getStatusClass(flight.apu.status)}">${flight.apu.status}</div>
        </div>
        
        <div class="aircraft-details">
            <div class="detail-item">
                <span class="detail-label">نوع الطائرة</span>
                <span class="detail-value">${flight.aircraftType}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">البوابة</span>
                <span class="detail-value">${flight.gate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">مدة APU</span>
                <span class="detail-value">${flight.apu.duration} دقيقة</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">استهلاك الوقود</span>
                <span class="detail-value" style="color: #dc3545;">${Math.round(apuEmissions.fuel)} كغ</span>
            </div>
        </div>

        <div>
            <span class="detail-label">مدة تشغيل APU: ${flight.apu.duration} دقيقة / 15 دقيقة</span>
            <div class="progress-bar">
                <div class="progress ${progressClass.replace('progress-', '')}" style="width: ${progressPercent}%"></div>
            </div>
        </div>

        <div class="aircraft-details" style="margin-top: 1rem;">
            <div class="detail-item">
                <span class="detail-label">GPU</span>
                <span class="detail-value status-badge ${flight.groundPower.gpu && flight.groundPower.gpu.connected ? 'status-connected' : 'status-disconnected'}">
                    ${flight.groundPower.gpu && flight.groundPower.gpu.connected ? 'متصل' : 'غير متصل'}
                </span>
            </div>
            <div class="detail-item">
                <span class="detail-label">PCA</span>
                <span class="detail-value status-badge ${flight.groundPower.pca && flight.groundPower.pca.connected ? 'status-connected' : 'status-disconnected'}">
                    ${flight.groundPower.pca && flight.groundPower.pca.connected ? 'متصل' : 'غير متصل'}
                </span>
            </div>
            <div class="detail-item">
                <span class="detail-label">انبعاثات CO₂</span>
                <span class="detail-value" style="color: ${apuEmissions.co2 > 200 ? '#dc3545' : '#28a745'};">${Math.round(apuEmissions.co2)} كغ</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">الوقت المتبقي</span>
                <span class="detail-value">${timeRemaining} دقيقة</span>
            </div>
        </div>

        <div class="control-buttons">
            <button class="btn btn-primary" onclick="connectGPU('${flight.flightNumber}')">
                ${flight.groundPower.gpu && flight.groundPower.gpu.connected ? 'قطع GPU' : 'توصيل GPU'}
            </button>
            <button class="btn btn-primary" onclick="connectPCA('${flight.flightNumber}')">
                ${flight.groundPower.pca && flight.groundPower.pca.connected ? 'قطع PCA' : 'توصيل PCA'}
            </button>
            <button class="btn btn-warning" onclick="sendAlert('${flight.flightNumber}')">إرسال تنبيه</button>
            ${flight.apu.duration > 15 ?
            `<button class="btn btn-danger" onclick="emergencyShutdown('${flight.flightNumber}')">إيقاف طارئ</button>` :
            ''
        }
        </div>
    `;

    return card;
}

function getStatusClass(status) {
    switch (status) {
        case 'مُشغل': return 'status-running';
        case 'متوقف': return 'status-stopped';
        case 'تحذير': return 'status-alert';
        case 'GPU متصل': return 'status-gpu';
        default: return 'status-running';
    }
}

function getProgressClass(percentage) {
    if (percentage < 50) return 'normal';
    if (percentage < 80) return 'warning';
    return 'critical';
}

function populateAlertsSidebar() {
    if (!dashboardData || !dashboardData.alerts) return;

    const alertsSidebar = document.getElementById('alertsSidebar');
    if (!alertsSidebar) return;

    alertsSidebar.innerHTML = '';

    dashboardData.alerts.slice(0, 5).forEach(alert => {
        const alertElement = createAlertSidebarItem(alert);
        alertsSidebar.appendChild(alertElement);
    });
}

function createAlertSidebarItem(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item-small ${getPriorityClass(alert.priority)}`;

    const alertTime = new Date(alert.timestamp).toLocaleString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    });

    alertDiv.innerHTML = `
        <div class="alert-header">
            <span class="alert-priority">${alert.priority}</span>
            <span class="alert-time">${alertTime}</span>
        </div>
        <div class="alert-message">
            <strong>${alert.flightNumber}:</strong> ${alert.message}
        </div>
    `;

    return alertDiv;
}

function getPriorityClass(priority) {
    const priorityMap = {
        'حرج': 'critical',
        'تحذير': 'warning',
        'تنبيه': 'info'
    };
    return priorityMap[priority] || 'info';
}

function initializeCalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    const runtimeInput = document.getElementById('runtimeInput');
    const resultsContainer = document.getElementById('calculatorResults');

    if (!calculateBtn || !runtimeInput || !resultsContainer) return;

    calculateBtn.addEventListener('click', function () {
        const runtime = parseInt(runtimeInput.value);

        if (!runtime || runtime <= 0) {
            showNotification('يرجى إدخال مدة تشغيل صحيحة', 'danger');
            return;
        }

        calculateEmissions(runtime, resultsContainer);
    });

    runtimeInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') calculateBtn.click();
    });
}

function calculateEmissions(runtime, resultsContainer) {
    if (!dashboardData) return;

    const aircraftSelect = document.getElementById('aircraftSelect');
    const selectedAircraft = aircraftSelect ? aircraftSelect.value : 'A320-neo';

    const apuEmissions = calculateAPUEmissions(selectedAircraft, runtime);

    const groundPower = {
        gpu: { connected: true, type: 'electric' },
        pca: { connected: true }
    };
    const groundEmissions = calculateGroundPowerEmissions(groundPower, runtime);

    const co2Savings = apuEmissions.co2 - groundEmissions;
    const efficiencyPercent = Math.round((co2Savings / apuEmissions.co2) * 100);

    const aircraftData = dashboardData.aircraftTypes[selectedAircraft];
    const aircraftName = aircraftData ? aircraftData.model || selectedAircraft : selectedAircraft;

    resultsContainer.innerHTML = `
        <div class="result-item">
            <div class="result-label">طائرة مختارة</div>
            <div class="result-value" style="color: #264285;">${aircraftName}</div>
        </div>
        <div class="result-item">
            <div class="result-label">انبعاثات APU</div>
            <div class="result-value warning">${Math.round(apuEmissions.co2)} كغ CO₂</div>
        </div>
        <div class="result-item">
            <div class="result-label">انبعاثات الطاقة الأرضية</div>
            <div class="result-value success">${Math.round(groundEmissions)} كغ CO₂</div>
        </div>
        <div class="result-item">
            <div class="result-label">التوفير في الانبعاثات</div>
            <div class="result-value success">${Math.round(co2Savings)} كغ CO₂</div>
        </div>
        <div class="result-item">
            <div class="result-label">وقود APU مستهلك</div>
            <div class="result-value warning">${Math.round(apuEmissions.fuel)} كغ</div>
        </div>
        <div class="result-item">
            <div class="result-label">كفاءة التحسن</div>
            <div class="result-value success">${efficiencyPercent}%</div>
        </div>
    `;
}

function drawCharts() {
    drawFuelChart();
    drawEmissionsChart();
}

function drawFuelChart() {
    const canvas = document.getElementById('fuelChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const hourlyData = generateHourlyFuelData();
    const maxFuel = Math.max(...hourlyData);
    const xStep = (width - 40) / (hourlyData.length - 1);
    const yScale = (height - 40) / maxFuel;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, height - 30);
    ctx.moveTo(30, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();

    ctx.strokeStyle = '#264285';
    ctx.lineWidth = 2;
    ctx.beginPath();

    hourlyData.forEach((fuel, index) => {
        const x = 30 + index * xStep;
        const y = height - 30 - fuel * yScale;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    ctx.fillStyle = '#264285';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('استهلاك الوقود (كغ/ساعة)', width / 2, 15);
}

function generateHourlyFuelData() {
    if (!dashboardData) {
        return [120, 150, 100, 80, 60, 40, 30, 50, 80, 120, 180, 220,
            250, 280, 300, 320, 290, 260, 240, 200, 180, 160, 140, 130];
    }

    const hourlyConsumption = new Array(24).fill(0);

    dashboardData.flights.forEach(flight => {
        if (flight.apu.status === 'مُشغل') {
            const aircraft = dashboardData.aircraftTypes[flight.aircraftType];
            const consumption = aircraft ? aircraft.apuConsumption : 126;

            const startHour = Math.floor(Math.random() * 24);
            const duration = Math.ceil(flight.apu.duration / 60);

            for (let i = 0; i < duration && startHour + i < 24; i++) {
                hourlyConsumption[startHour + i] += consumption;
            }
        }
    });

    return hourlyConsumption;
}

function drawEmissionsChart() {
    const canvas = document.getElementById('emissionsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const stats = calculateDailyStats();
    if (!stats) return;

    const apuEmissions = stats.totalCO2Emitted;
    const groundEmissions = apuEmissions - stats.co2Saved;
    const maxEmissions = Math.max(apuEmissions, groundEmissions);

    const barWidth = 60;
    const barSpacing = 40;
    const chartHeight = height - 60;

    const apuBarHeight = (apuEmissions / maxEmissions) * chartHeight;
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(50, height - 30 - apuBarHeight, barWidth, apuBarHeight);

    const groundBarHeight = (groundEmissions / maxEmissions) * chartHeight;
    ctx.fillStyle = '#28a745';
    ctx.fillRect(50 + barWidth + barSpacing, height - 30 - groundBarHeight, barWidth, groundBarHeight);

    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';

    ctx.fillText('APU', 50 + barWidth / 2, height - 10);
    ctx.fillText(Math.round(apuEmissions).toLocaleString(), 50 + barWidth / 2, height - 35 - apuBarHeight);

    ctx.fillText('طاقة أرضية', 50 + barWidth + barSpacing + barWidth / 2, height - 10);
    ctx.fillText(Math.round(groundEmissions).toLocaleString(), 50 + barWidth + barSpacing + barWidth / 2, height - 35 - groundBarHeight);

    ctx.fillStyle = '#264285';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('مقارنة الانبعاثات اليومية (كغ CO₂)', width / 2, 15);
}

function refreshData() {
    dashboardData.flights.forEach(flight => {
        if (flight.apu.status === 'مُشغل' && !(flight.groundPower.gpu && flight.groundPower.gpu.connected)) {
            flight.apu.duration += Math.floor(Math.random() * 3) + 1;
            if (flight.apu.duration > 15) {
                flight.apu.status = 'تحذير';
            }
        }
    });

    updateKPIs();
    populateFlightsTable();
    drawCharts();
    showNotification("تم تحديث البيانات بنجاح");
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification-toast ${type === 'success' ? '' : type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    const criticalElements = document.querySelectorAll('.critical');
    criticalElements.forEach(element => {
        element.style.animation = 'pulse 2s infinite';
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);