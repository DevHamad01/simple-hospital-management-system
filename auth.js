// Authentication and Authorization Module

class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }

    login(username, password) {
        const users = dataManager.getAll('users');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Create session
            const session = {
                userId: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('currentSession', JSON.stringify(session));
            this.currentUser = session;
            return { success: true, user: session };
        }

        return { success: false, message: 'Invalid username or password' };
    }

    logout() {
        localStorage.removeItem('currentSession');
        this.currentUser = null;
        return true;
    }

    getCurrentUser() {
        const session = localStorage.getItem('currentSession');
        return session ? JSON.parse(session) : null;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    checkPermission(requiredRole) {
        if (!this.isAuthenticated()) {
            return false;
        }

        // Admin has access to everything
        if (this.currentUser.role === 'admin') {
            return true;
        }

        // Check specific role
        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(this.currentUser.role);
        }

        return this.currentUser.role === requiredRole;
    }

    getUserDetails() {
        if (!this.isAuthenticated()) {
            return null;
        }

        const user = dataManager.getById('users', this.currentUser.userId);

        // Get additional details based on role
        if (this.currentUser.role === 'doctor') {
            const doctor = dataManager.getDoctorByUserId(this.currentUser.userId);
            return { ...user, ...doctor };
        } else if (this.currentUser.role === 'patient') {
            const patient = dataManager.getPatientByUserId(this.currentUser.userId);
            return { ...user, ...patient };
        }

        return user;
    }
}

// Export singleton instance
const authManager = new AuthManager();
