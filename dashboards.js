// Dashboard Components for All User Roles

const dashboards = {
    // Admin Dashboard
    loadAdminDashboard() {
        const user = authManager.getCurrentUser();
        document.getElementById('adminUserName').textContent = user.name;

        // Load statistics
        this.loadAdminStats();

        // Setup navigation
        this.setupAdminNavigation();
    },

    loadAdminStats() {
        const today = utils.getCurrentDate();
        const stats = dataManager.getDailyStats(today);
        const doctors = dataManager.getAll('doctors');
        const patients = dataManager.getAll('patients');

        document.getElementById('totalDoctors').textContent = doctors.length;
        document.getElementById('totalPatients').textContent = patients.length;
        document.getElementById('todayAppointments').textContent = stats.totalAppointments;
        document.getElementById('todayRevenue').textContent = utils.formatCurrency(stats.totalBilling);
    },

    setupAdminNavigation() {
        // Doctor Management
        document.getElementById('manageDoctorsBtn')?.addEventListener('click', () => {
            doctorManagement.showDoctorList();
        });

        // Reports
        document.getElementById('viewReportsBtn')?.addEventListener('click', () => {
            reports.showReportsPage();
        });
    },

    // Doctor Dashboard
    loadDoctorDashboard() {
        const user = authManager.getCurrentUser();
        const doctor = dataManager.getDoctorByUserId(user.userId);

        document.getElementById('doctorUserName').textContent = user.name;
        document.getElementById('doctorSpecialization').textContent = doctor.specialization;

        // Load today's appointments
        this.loadDoctorAppointments(doctor.id);
    },

    loadDoctorAppointments(doctorId) {
        const today = utils.getCurrentDate();
        const appointments = dataManager.getAppointmentsByDoctor(doctorId, today);

        const container = document.getElementById('doctorAppointmentsList');

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">No appointments for today</div>
                </div>
            `;
            return;
        }

        let html = '<div class="grid grid-2">';

        appointments.forEach(apt => {
            const patient = dataManager.getById('patients', apt.patientId);
            const statusClass = apt.status === 'Completed' ? 'success' : 'warning';

            html += `
                <div class="card">
                    <div class="flex-between mb-2">
                        <h3 style="margin: 0;">${patient.name}</h3>
                        <span class="badge badge-${statusClass}">${apt.status}</span>
                    </div>
                    <p style="color: var(--text-muted); margin-bottom: 1rem;">
                        ⏰ ${apt.time} | 📞 ${patient.contact}
                    </p>
                    ${apt.status === 'Pending' ? `
                        <button class="btn btn-primary btn-sm" onclick="consultation.openConsultationForm(${apt.id})">
                            Start Consultation
                        </button>
                    ` : `
                        <button class="btn btn-outline btn-sm" onclick="consultation.viewConsultation(${apt.id})">
                            View Details
                        </button>
                    `}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    // Receptionist Dashboard
    loadReceptionistDashboard() {
        const user = authManager.getCurrentUser();
        document.getElementById('receptionistUserName').textContent = user.name;

        // Load quick stats
        this.loadReceptionistStats();

        // Setup quick actions
        this.setupReceptionistNavigation();
    },

    loadReceptionistStats() {
        const today = utils.getCurrentDate();
        const appointments = dataManager.getAll('appointments').filter(a => a.date === today);
        const pendingAppointments = appointments.filter(a => a.status === 'Pending');
        const patients = dataManager.getAll('patients');

        document.getElementById('recepTotalPatients').textContent = patients.length;
        document.getElementById('recepTodayAppointments').textContent = appointments.length;
        document.getElementById('recepPendingAppointments').textContent = pendingAppointments.length;
    },

    setupReceptionistNavigation() {
        // Patient Management
        document.getElementById('addPatientBtn')?.addEventListener('click', () => {
            patientManagement.showAddPatientForm();
        });

        document.getElementById('viewPatientsBtn')?.addEventListener('click', () => {
            patientManagement.showPatientList();
        });

        // Appointment Scheduling
        document.getElementById('bookAppointmentBtn')?.addEventListener('click', () => {
            appointmentScheduling.showBookingForm();
        });

        document.getElementById('viewAppointmentsBtn')?.addEventListener('click', () => {
            appointmentScheduling.showAppointmentList();
        });

        // Billing
        document.getElementById('generateBillBtn')?.addEventListener('click', () => {
            billing.showBillingForm();
        });
    },

    // Patient Dashboard
    loadPatientDashboard() {
        const user = authManager.getCurrentUser();
        const patient = dataManager.getPatientByUserId(user.userId);

        document.getElementById('patientUserName').textContent = user.name;

        // Load patient's appointments
        this.loadPatientAppointments(patient.id);

        // Load medical history
        this.loadPatientHistory(patient.id);
    },

    loadPatientAppointments(patientId) {
        const appointments = dataManager.getAppointmentsByPatient(patientId);
        const container = document.getElementById('patientAppointmentsList');

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">No appointments scheduled</div>
                </div>
            `;
            return;
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Date</th><th>Time</th><th>Doctor</th><th>Status</th>';
        html += '</tr></thead><tbody>';

        appointments.forEach(apt => {
            const doctor = dataManager.getById('doctors', apt.doctorId);
            const statusClass = apt.status === 'Completed' ? 'success' : 'warning';

            html += `
                <tr>
                    <td>${utils.formatDate(apt.date)}</td>
                    <td>${apt.time}</td>
                    <td>${doctor.name} (${doctor.specialization})</td>
                    <td><span class="badge badge-${statusClass}">${apt.status}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    },

    loadPatientHistory(patientId) {
        const consultations = dataManager.getConsultationsByPatient(patientId);
        const container = document.getElementById('patientMedicalHistory');

        if (consultations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No medical history available</div>
                </div>
            `;
            return;
        }

        let html = '<div class="grid grid-2">';

        consultations.forEach(consult => {
            const doctor = dataManager.getById('doctors', consult.doctorId);

            html += `
                <div class="card">
                    <div class="flex-between mb-2">
                        <h4 style="margin: 0;">${utils.formatDate(consult.date)}</h4>
                        <span class="badge badge-info">${doctor.name}</span>
                    </div>
                    <p><strong>Diagnosis:</strong> ${consult.diagnosis}</p>
                    <p><strong>Prescription:</strong> ${consult.prescription}</p>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};
