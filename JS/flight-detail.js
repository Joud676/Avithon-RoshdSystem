const aircraftData = {
    a320: {
        name: 'Airbus A320',
        apuFuel: 126,
        apuCO2: 398.16
    },
    b777: {
        name: 'Boeing 777-300ER',
        apuFuel: 312,
        apuCO2: 985.92
    },
    a330: {
        name: 'Airbus A330-300',
        apuFuel: 210,
        apuCO2: 663.6
    }
};

const groundPowerData = {
    electricGPU: 4,
    pca: 19,
    total: 23
};

const currentFlight = {
    aircraftType: 'a330',
    operationMinutes: 190
};

function initCharts() {
    const fuelCtx = document.getElementById('fuelChart').getContext('2d');
    new Chart(fuelCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                label: 'استهلاك الوقود (كجم/ساعة)',
                data: [0, 210, 210, 0, 210, 210, 0],
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                x: { grid: { color: 'rgba(0,0,0,0.1)' } }
            }
        }
    });

    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                label: 'درجة الحرارة (°C)',
                data: [25, 650, 650, 25, 650, 650, 25],
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderColor: '#e74c3c',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                x: { grid: { color: 'rgba(0,0,0,0.1)' } }
            }
        }
    });

    const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
    new Chart(emissionsCtx, {
        type: 'doughnut',
        data: {
            labels: ['APU', 'طاقة أرضية'],
            datasets: [{
                data: [663.6, 23],
                backgroundColor: ['#e74c3c', '#27ae60'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function autoCalculateEmissions() {
    const aircraft = aircraftData[currentFlight.aircraftType];
    const hours = currentFlight.operationMinutes / 60;

    const apuEmissions = aircraft.apuCO2 * hours;
    const groundEmissions = groundPowerData.total * hours;
    const savings = apuEmissions - groundEmissions;

    document.getElementById('apuEmissions').textContent = apuEmissions.toFixed(2);
    document.getElementById('groundEmissions').textContent = groundEmissions.toFixed(2);
    document.getElementById('savingsAmount').textContent = savings.toFixed(2);
    document.getElementById('calculationResults').style.display = 'grid';
}

function calculateEmissions() {
    const aircraftType = document.getElementById('aircraftType').value;
    const operationTime = parseFloat(document.getElementById('operationTime').value);

    if (!operationTime || operationTime <= 0) {
        alert('يرجى إدخال مدة تشغيل صحيحة');
        return;
    }

    const aircraft = aircraftData[aircraftType];
    const hours = operationTime / 60;

    const apuEmissions = aircraft.apuCO2 * hours;
    const groundEmissions = groundPowerData.total * hours;
    const savings = apuEmissions - groundEmissions;

    document.getElementById('apuEmissions').textContent = apuEmissions.toFixed(2);
    document.getElementById('groundEmissions').textContent = groundEmissions.toFixed(2);
    document.getElementById('savingsAmount').textContent = savings.toFixed(2);
    document.getElementById('calculationResults').style.display = 'grid';
}

document.addEventListener('DOMContentLoaded', function () {
    initCharts();
    autoCalculateEmissions(); 
});
