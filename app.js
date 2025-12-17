// Main Application Logic and Routing

class App {
    constructor() {
        this.currentView = null;
        this.init();
    }

    init() {
        // Check if user is logged in
        if (authManager.isAuthenticated()) {
            this.showDashboard();
        } else {
            this.showLogin();
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                this.handleLogout();
            }
        });
    }

    handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const result = authManager.login(username, password);

        if (result.success) {
            utils.showToast('Login successful!', 'success');
            this.showDashboard();
        } else {
            utils.showToast(result.message, 'error');
        }
    }

    handleLogout() {
        authManager.logout();
        utils.showToast('Logged out successfully', 'info');
        this.showLogin();
    }

    showLogin() {
        this.hideAllViews();
        document.getElementById('loginView').classList.remove('hidden');
        this.currentView = 'login';
    }

    showDashboard() {
        this.hideAllViews();
        const user = authManager.getCurrentUser();

        if (!user) {
            this.showLogin();
            return;
        }

        // Show appropriate dashboard based on role
        switch (user.role) {
            case 'admin':
                this.showAdminDashboard();
                break;
            case 'doctor':
                this.showDoctorDashboard();
                break;
            case 'receptionist':
                this.showReceptionistDashboard();
                break;
            case 'patient':
                this.showPatientDashboard();
                break;
            default:
                this.showLogin();
        }
    }

    showAdminDashboard() {
        document.getElementById('adminDashboard').classList.remove('hidden');
        this.currentView = 'admin';
        dashboards.loadAdminDashboard();
    }

    showDoctorDashboard() {
        document.getElementById('doctorDashboard').classList.remove('hidden');
        this.currentView = 'doctor';
        dashboards.loadDoctorDashboard();
    }

    showReceptionistDashboard() {
        document.getElementById('receptionistDashboard').classList.remove('hidden');
        this.currentView = 'receptionist';
        dashboards.loadReceptionistDashboard();
    }

    showPatientDashboard() {
        document.getElementById('patientDashboard').classList.remove('hidden');
        this.currentView = 'patient';
        dashboards.loadPatientDashboard();
    }

    hideAllViews() {
        const views = ['loginView', 'adminDashboard', 'doctorDashboard', 'receptionistDashboard', 'patientDashboard'];
        views.forEach(view => {
            const element = document.getElementById(view);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    navigateTo(view) {
        // Navigation helper for switching between different pages within a dashboard
        const currentDashboard = document.querySelector('.dashboard:not(.hidden)');
        if (currentDashboard) {
            const sections = currentDashboard.querySelectorAll('.dashboard-section');
            sections.forEach(section => section.classList.add('hidden'));

            const targetSection = currentDashboard.querySelector(`#${view}`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
