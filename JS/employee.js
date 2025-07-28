const crewData = [
    { id: 1, name: "أحمد محمد", role: "GPU", status: "available", location: "A1-A5", avatar: "أم" },
    { id: 2, name: "سارة عبدالله", role: "PCA", status: "busy", location: "B3", avatar: "سع" },
    { id: 3, name: "محمد علي", role: "GPU", status: "available", location: "C2-C4", avatar: "مع" },
    { id: 4, name: "فاطمة أحمد", role: "PCA", status: "available", location: "D1", avatar: "فأ" },
    { id: 5, name: "عبدالرحمن سعد", role: "GPU", status: "busy", location: "E2", avatar: "عس" },
    { id: 6, name: "نورا خالد", role: "منسق", status: "available", location: "مركز التحكم", avatar: "نخ" },
    { id: 7, name: "طارق يوسف", role: "GPU", status: "available", location: "F1-F3", avatar: "طي" },
    { id: 8, name: "هند ناصر", role: "PCA", status: "offline", location: "استراحة", avatar: "هن" },
    { id: 9, name: "سعد الغامدي", role: "GPU", status: "available", location: "G3-G5", avatar: "سغ" },
    { id: 10, name: "ريم العتيبي", role: "منسق", status: "busy", location: "H1", avatar: "رع" }
];

const assignmentData = [
    { flight: "SV1234", gate: "A1", crew: ["أحمد محمد"], service: "GPU", status: "جاري", time: "14:30" },
    { flight: "XY419", gate: "B3", crew: ["سارة عبدالله"], service: "PCA", status: "مكتمل", time: "14:15" },
    { flight: "F31205", gate: "C2", crew: ["محمد علي", "فاطمة أحمد"], service: "GPU + PCA", status: "معلق", time: "15:20" },
    { flight: "SV2156", gate: "D1", crew: ["طارق يوسف"], service: "GPU", status: "جاري", time: "14:50" },
    { flight: "SV8901", gate: "E2", crew: ["عبدالرحمن سعد"], service: "PCA", status: "مجدول", time: "16:45" },
    { flight: "XY2847", gate: "F1", crew: [], service: "GPU", status: "منتظر", time: "17:15" },
    { flight: "F31508", gate: "G3", crew: [], service: "GPU + PCA", status: "منتظر", time: "15:30" },
    { flight: "SV3456", gate: "H1", crew: ["ريم العتيبي"], service: "منسق", status: "جاري", time: "18:20" }
];

document.addEventListener('DOMContentLoaded', function () {
    loadCrewGrid();
    loadAssignmentBoard();
    updateStats();
    setInterval(updateRealTimeData, 30000);
});

function loadCrewGrid() {
    const crewGrid = document.getElementById('crewGrid');
    crewGrid.innerHTML = '';

    crewData.forEach(member => {
        const crewElement = createCrewElement(member);
        crewGrid.appendChild(crewElement);
    });
}

function createCrewElement(member) {
    const div = document.createElement('div');
    div.className = `crew-member ${member.status}`;
    div.onclick = () => showCrewDetails(member.id);

    div.innerHTML = `
        <div class="crew-avatar">${member.avatar}</div>
        <div class="crew-name">${member.name}</div>
        <div class="crew-role">${member.role}</div>
        <div class="crew-location">${member.location}</div>
    `;

    return div;
}

function loadAssignmentBoard() {
    const board = document.getElementById('assignmentBoard');
    board.innerHTML = '';

    assignmentData.forEach(assignment => {
        const assignmentElement = createAssignmentElement(assignment);
        board.appendChild(assignmentElement);
    });
}

function createAssignmentElement(assignment) {
    const div = document.createElement('div');
    div.className = 'assignment-item';

    const statusColor = getStatusColor(assignment.status);
    div.style.borderLeftColor = statusColor;

    div.innerHTML = `
        <div class="assignment-info">
            <div class="flight-number">${assignment.flight}</div>
            <div class="assignment-details">
                ${assignment.gate} • ${assignment.service} • ${assignment.time}
            </div>
        </div>
        <div class="assignment-crew">
            ${assignment.crew.length > 0 ?
            assignment.crew.map(name => `<span class="crew-tag">${name}</span>`).join('') :
            '<span class="crew-tag" style="background: #ffeaa7;">غير مُكلف</span>'
        }
        </div>
    `;

    return div;
}

function getStatusColor(status) {
    const colors = {
        'مكتمل': '#28a745',
        'جاري': '#2196f3',
        'مجدول': '#ffc107',
        'منتظر': '#dc3545',
        'معلق': '#fd7e14'
    };
    return colors[status] || '#6c757d';
}

function updateStats() {
    const available = crewData.filter(m => m.status === 'available').length;
    const busy = crewData.filter(m => m.status === 'busy').length;
    const total = crewData.length;

    document.getElementById('totalCrew').textContent = total;
    document.getElementById('availableCrew').textContent = available;
    document.getElementById('busyCrew').textContent = busy;

    const avgTime = (Math.random() * 2 + 3).toFixed(1);
    document.getElementById('avgResponseTime').textContent = avgTime;

    const activeCount = assignmentData.filter(a => a.status === 'جاري' || a.status === 'مجدول').length;
    document.getElementById('activeAssignments').textContent = `${activeCount} مهام نشطة`;
}

function applySuggestion(suggestionId) {
    const suggestions = {
        1: {
            message: "تم تطبيق إعادة التوزيع بنجاح",
            details: "نُقل فريق GPU إلى البوابة F1 - توفر 8 دقائق و 127 كغ CO₂"
        },
        2: {
            message: "تم تجميع خدمة PCA بنجاح",
            details: "فريق واحد يخدم الرحلتين - كفاءة 23% أعلى"
        },
        3: {
            message: "تم جدولة التحضير الاستباقي",
            details: "الفريق سيكون جاهز قبل 15 دقيقة من الذروة"
        }
    };

    const suggestion = suggestions[suggestionId];
    if (suggestion) {
        showNotification(suggestion.message, 'success');

        setTimeout(() => {
            updateStats();
            loadAssignmentBoard();
        }, 1000);
    }
}

function scheduleSuggestion(suggestionId) {
    showNotification("تم جدولة الاقتراح بنجاح", 'info');
}

function viewDetails(suggestionId) {
    showNotification("عرض التفاصيل قريباً", 'info');
}

function refreshCrewStatus() {
    crewData.forEach(member => {
        if (Math.random() < 0.1) {
            const statuses = ['available', 'busy', 'offline'];
            member.status = statuses[Math.floor(Math.random() * statuses.length)];
        }
    });

    loadCrewGrid();
    updateStats();
    showNotification("تم تحديث حالة الفريق", 'success');
}

function showCrewDetails(memberId) {
    const member = crewData.find(m => m.id === memberId);
    if (member) {
        alert(`تفاصيل ${member.name}:\nالتخصص: ${member.role}\nالحالة: ${member.status}\nالموقع: ${member.location}`);
    }
}

function showOptimizationModal() {
    document.getElementById('optimizationModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('optimizationModal').style.display = 'none';
}

function applyOptimization() {
    closeModal();
    showNotification("جاري تطبيق التحسين التلقائي...", 'info');

    setTimeout(() => {
        showNotification("تم تطبيق التحسين بنجاح! تحسن الأداء بنسبة 15%", 'success');
        updateStats();
        loadAssignmentBoard();
    }, 3000);
}

function emergencyReallocation() {
    showNotification("تم تفعيل إعادة التوزيع الطارئة", 'warning');

    setTimeout(() => {
        showNotification("اكتملت إعادة التوزيع - جميع الطائرات مخدومة", 'success');
        updateStats();
    }, 2000);
}

function generateReport() {
    showNotification("جاري إنشاء تقرير الأداء...", 'info');

    setTimeout(() => {
        showNotification("تم إنشاء التقرير بنجاح", 'success');
    }, 2000);
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const colors = {
        'success': '#28a745',
        'warning': '#ffc107',
        'error': '#dc3545',
        'info': '#2196f3'
    };

    notification.textContent = message;
    notification.style.background = colors[type] || colors.success;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function updateRealTimeData() {
    if (Math.random() < 0.3) {
        updateStats();
    }

    if (Math.random() < 0.2) {
        loadAssignmentBoard();
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('optimizationModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

setInterval(() => {
    if (Math.random() < 0.1) {
        const suggestions = [
            "اقتراح جديد: تحسين مسار الفريق في المنطقة الشرقية",
            "تنبيه: تراكم في البوابات الدولية - يُنصح بإعادة التوزيع",
            "توصية: استعداد لذروة المساء خلال 30 دقيقة"
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        showNotification(randomSuggestion, 'info');
    }
}, 45000);