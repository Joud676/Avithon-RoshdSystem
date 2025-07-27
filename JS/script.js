
document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    setupLoginForm();
    addFloatingEffect();
});


function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.querySelector('.password-toggle');

    loginForm.addEventListener('submit', handleLogin);

    passwordToggle.addEventListener('click', togglePassword);

    setupDemoCredentials();
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const submitBtn = document.querySelector('.login-btn');

    if (!email || !password) {
        showError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }

    btnText.style.display = 'none';
    loading.style.display = 'flex';
    submitBtn.disabled = true;

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}


function setupDemoCredentials() {
    const demoCredentials = document.querySelectorAll('.demo-credential');

    demoCredentials.forEach(credential => {
        credential.addEventListener('click', function () {
            const email = this.getAttribute('data-email');
            const password = this.getAttribute('data-password');

            document.getElementById('email').value = email;
            document.getElementById('password').value = password;

            showSuccess('تم تعبئة البيانات');
            setTimeout(() => hideMessages(), 2000);
        });
    });
}


function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    errorDiv.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
}


function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successDiv.style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}


function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = window.innerWidth < 768 ? 30 : 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
        particlesContainer.appendChild(particle);
    }
}

function addFloatingEffect() {
    const container = document.querySelector('.login-container');
    if (window.innerWidth > 768) {
        container.classList.add('floating');
    }
}