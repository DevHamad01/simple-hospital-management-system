// Doctor Consultation Module

const consultation = {
    openConsultationForm(appointmentId) {
        const appointment = dataManager.getById('appointments', appointmentId);
        if (!appointment) return;

        const patient = dataManager.getById('patients', appointment.patientId);
        const doctor = dataManager.getById('doctors', appointment.doctorId);

        // Store appointment ID for submission
        document.getElementById('consultationAppointmentId').value = appointmentId;
        document.getElementById('consultationPatientName').textContent = patient.name;
        document.getElementById('consultationPatientAge').textContent = patient.age;
        document.getElementById('consultationPatientHistory').textContent = patient.medicalHistory;

        utils.resetForm('consultationForm');
        utils.openModal('consultationModal');

        // Setup form submission
        const form = document.getElementById('consultationForm');
        form.onsubmit = (e) => this.handleSaveConsultation(e);
    },

    handleSaveConsultation(e) {
        e.preventDefault();

        const appointmentId = document.getElementById('consultationAppointmentId').value;
        const formData = utils.getFormData('consultationForm');

        // Validation
        if (!utils.validateRequired(formData.diagnosis)) {
            utils.showToast('Diagnosis is required', 'error');
            return;
        }

        if (!utils.validateRequired(formData.prescription)) {
            utils.showToast('Prescription is required', 'error');
            return;
        }

        const appointment = dataManager.getById('appointments', appointmentId);

        // Create consultation record
        const consultation = {
            appointmentId: parseInt(appointmentId),
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            date: appointment.date,
            diagnosis: formData.diagnosis,
            prescription: formData.prescription
        };

        dataManager.add('consultations', consultation);

        // Update appointment status to Completed
        dataManager.update('appointments', appointmentId, { status: 'Completed' });

        utils.showToast('Consultation saved successfully!', 'success');
        utils.closeModal('consultationModal');

        // Refresh doctor dashboard
        const user = authManager.getCurrentUser();
        const doctor = dataManager.getDoctorByUserId(user.userId);
        dashboards.loadDoctorAppointments(doctor.id);
    },

    viewConsultation(appointmentId) {
        const consultations = dataManager.getAll('consultations');
        const consultation = consultations.find(c => c.appointmentId === parseInt(appointmentId));

        if (!consultation) {
            utils.showToast('No consultation record found', 'info');
            return;
        }

        const patient = dataManager.getById('patients', consultation.patientId);
        const doctor = dataManager.getById('doctors', consultation.doctorId);

        let html = `
            <div class="modal-header">
                <h3 class="modal-title">Consultation Details</h3>
                <button class="modal-close" onclick="utils.closeModal('viewConsultationModal')">×</button>
            </div>
            
            <div style="margin-top: 1rem;">
                <p><strong>Patient:</strong> ${patient.name}</p>
                <p><strong>Doctor:</strong> ${doctor.name}</p>
                <p><strong>Date:</strong> ${utils.formatDate(consultation.date)}</p>
                <hr style="margin: 1rem 0; border-color: var(--border-color);">
                <h4>Diagnosis</h4>
                <p>${consultation.diagnosis}</p>
                <h4 style="margin-top: 1rem;">Prescription</h4>
                <p>${consultation.prescription}</p>
            </div>
        `;

        document.getElementById('viewConsultationModal').querySelector('.modal-content').innerHTML = html;
        utils.openModal('viewConsultationModal');
    }
};
