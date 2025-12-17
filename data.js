// Data Management Layer - LocalStorage wrapper and data models

class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize with demo data if first time
        if (!localStorage.getItem('hms_initialized')) {
            this.setDefaultData();
            localStorage.setItem('hms_initialized', 'true');
        }
    }

    setDefaultData() {
        // Default users for testing
        const users = [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
            { id: 2, username: 'doctor1', password: 'doctor123', role: 'doctor', name: 'Dr. Rajesh Kumar', specialization: 'Cardiology', available: true },
            { id: 3, username: 'doctor2', password: 'doctor123', role: 'doctor', name: 'Dr. Priya Sharma', specialization: 'Pediatrics', available: true },
            { id: 4, username: 'receptionist1', password: 'recep123', role: 'receptionist', name: 'Receptionist Anita' },
            { id: 5, username: 'patient1', password: 'patient123', role: 'patient', name: 'Amit Patel', age: 35, gender: 'Male', contact: '9876543210', address: 'Mumbai, Maharashtra' }
        ];

        const patients = [
            { id: 1, name: 'Amit Patel', age: 35, gender: 'Male', contact: '9876543210', address: 'Mumbai, Maharashtra', medicalHistory: 'Diabetes', userId: 5 },
            { id: 2, name: 'Sneha Reddy', age: 28, gender: 'Female', contact: '9876543211', address: 'Hyderabad, Telangana', medicalHistory: 'Asthma' },
            { id: 3, name: 'Rahul Singh', age: 42, gender: 'Male', contact: '9876543212', address: 'Delhi, NCR', medicalHistory: 'Hypertension' }
        ];

        const doctors = [
            { id: 2, name: 'Dr. Rajesh Kumar', specialization: 'Cardiology', available: true, userId: 2 },
            { id: 3, name: 'Dr. Priya Sharma', specialization: 'Pediatrics', available: true, userId: 3 }
        ];

        const appointments = [
            { id: 1, patientId: 1, doctorId: 2, date: new Date().toISOString().split('T')[0], time: '10:00', status: 'Pending' },
            { id: 2, patientId: 2, doctorId: 3, date: new Date().toISOString().split('T')[0], time: '11:00', status: 'Pending' }
        ];

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('patients', JSON.stringify(patients));
        localStorage.setItem('doctors', JSON.stringify(doctors));
        localStorage.setItem('appointments', JSON.stringify(appointments));
        localStorage.setItem('consultations', JSON.stringify([]));
        localStorage.setItem('dischargeSummaries', JSON.stringify([]));
        localStorage.setItem('invoices', JSON.stringify([]));
    }

    // Generic CRUD operations
    getAll(entity) {
        const data = localStorage.getItem(entity);
        return data ? JSON.parse(data) : [];
    }

    getById(entity, id) {
        const items = this.getAll(entity);
        return items.find(item => item.id === parseInt(id));
    }

    add(entity, item) {
        const items = this.getAll(entity);
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        item.id = newId;
        items.push(item);
        localStorage.setItem(entity, JSON.stringify(items));
        return item;
    }

    update(entity, id, updatedItem) {
        const items = this.getAll(entity);
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            localStorage.setItem(entity, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    delete(entity, id) {
        const items = this.getAll(entity);
        const filtered = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(entity, JSON.stringify(filtered));
        return true;
    }

    // Specific queries
    getAvailableDoctors() {
        return this.getAll('doctors').filter(doc => doc.available);
    }

    getPatientByUserId(userId) {
        return this.getAll('patients').find(p => p.userId === parseInt(userId));
    }

    getDoctorByUserId(userId) {
        return this.getAll('doctors').find(d => d.userId === parseInt(userId));
    }

    getAppointmentsByDoctor(doctorId, date = null) {
        let appointments = this.getAll('appointments').filter(a => a.doctorId === parseInt(doctorId));
        if (date) {
            appointments = appointments.filter(a => a.date === date);
        }
        return appointments;
    }

    getAppointmentsByPatient(patientId) {
        return this.getAll('appointments').filter(a => a.patientId === parseInt(patientId));
    }

    getConsultationsByPatient(patientId) {
        return this.getAll('consultations').filter(c => c.patientId === parseInt(patientId));
    }

    getInvoicesByPatient(patientId) {
        return this.getAll('invoices').filter(i => i.patientId === parseInt(patientId));
    }

    // Reports
    getDailyStats(date) {
        const appointments = this.getAll('appointments').filter(a => a.date === date);
        const invoices = this.getAll('invoices').filter(i => i.date === date);
        const totalBilling = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

        return {
            totalAppointments: appointments.length,
            completedAppointments: appointments.filter(a => a.status === 'Completed').length,
            totalBilling: totalBilling,
            totalPatients: new Set(appointments.map(a => a.patientId)).size
        };
    }

    getMonthlyStats(year, month) {
        const appointments = this.getAll('appointments').filter(a => {
            const [y, m] = a.date.split('-');
            return parseInt(y) === year && parseInt(m) === month;
        });

        const invoices = this.getAll('invoices').filter(i => {
            const [y, m] = i.date.split('-');
            return parseInt(y) === year && parseInt(m) === month;
        });

        const totalBilling = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

        return {
            totalAppointments: appointments.length,
            completedAppointments: appointments.filter(a => a.status === 'Completed').length,
            totalBilling: totalBilling,
            totalPatients: new Set(appointments.map(a => a.patientId)).size
        };
    }
}

// Export singleton instance
const dataManager = new DataManager();
