// Appointment Scheduling Module (Receptionist)

const appointmentScheduling = {
    showBookingForm() {
        utils.openModal('bookAppointmentModal');
        utils.resetForm('bookAppointmentForm');

        // Populate dropdowns
        this.populatePatientDropdown();
        this.populateDoctorDropdown();

        // Set default date to today
        document.getElementById('appointmentDate').value = utils.getCurrentDate();

        // Setup form submission
        const form = document.getElementById('bookAppointmentForm');
        form.onsubmit = (e) => this.handleBookAppointment(e);
    },

    populatePatientDropdown() {
        const patients = dataManager.getAll('patients');
        const select = document.getElementById('appointmentPatient');

        select.innerHTML = '<option value="">Select Patient</option>';

        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.contact})`;
            select.appendChild(option);
        });
    },

    populateDoctorDropdown() {
        // Only show available doctors
        const doctors = dataManager.getAvailableDoctors();
        const select = document.getElementById('appointmentDoctor');

        select.innerHTML = '<option value="">Select Doctor</option>';

        if (doctors.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No doctors available";
            option.disabled = true;
            select.appendChild(option);
            return;
        }

        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.name} (${doctor.specialization})`;
            select.appendChild(option);
        });
    },

    handleBookAppointment(e) {
        e.preventDefault();

        const formData = utils.getFormData('bookAppointmentForm');

        // Validation
        if (!formData.appointmentPatient || !formData.appointmentDoctor) {
            utils.showToast('Please select patient and doctor', 'error');
            return;
        }

        if (!formData.appointmentDate || !formData.appointmentTime) {
            utils.showToast('Please select date and time', 'error');
            return;
        }

        // Check if doctor is available
        const doctor = dataManager.getById('doctors', formData.appointmentDoctor);
        if (!doctor.available) {
            utils.showToast('Selected doctor is not available', 'error');
            return;
        }

        // Create appointment
        const appointment = {
            patientId: parseInt(formData.appointmentPatient),
            doctorId: parseInt(formData.appointmentDoctor),
            date: formData.appointmentDate,
            time: formData.appointmentTime,
            status: 'Pending'
        };

        dataManager.add('appointments', appointment);

        utils.showToast('Appointment booked successfully!', 'success');
        utils.closeModal('bookAppointmentModal');
        utils.resetForm('bookAppointmentForm');

        // Refresh list if visible
        this.showAppointmentList();
    },

    showAppointmentList() {
        const container = document.getElementById('appointmentListContainer');
        if (!container) return;

        const appointments = dataManager.getAll('appointments');

        let html = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Appointment List</h2>
                    <button class="btn btn-primary" onclick="appointmentScheduling.showBookingForm()">
                        ➕ Book Appointment
                    </button>
                </div>
                
                <div class="flex gap-2 mb-3">
                    <select id="filterStatus" class="form-control" style="max-width: 200px;">
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <input type="date" id="filterDate" class="form-control" style="max-width: 200px;">
                </div>
                
                <div id="appointmentTableContainer">
        `;

        if (appointments.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">No appointments found</div>
                </div>
            `;
        } else {
            html += this.renderAppointmentTable(appointments);
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup filters
        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.filterAppointments();
        });

        document.getElementById('filterDate')?.addEventListener('change', (e) => {
            this.filterAppointments();
        });
    },

    filterAppointments() {
        const status = document.getElementById('filterStatus').value;
        const date = document.getElementById('filterDate').value;

        let appointments = dataManager.getAll('appointments');

        if (status) {
            appointments = appointments.filter(a => a.status === status);
        }

        if (date) {
            appointments = appointments.filter(a => a.date === date);
        }

        document.getElementById('appointmentTableContainer').innerHTML = this.renderAppointmentTable(appointments);
    },

    renderAppointmentTable(appointments) {
        // Sort by date and time (newest first)
        appointments = utils.sortBy(appointments, 'date', 'desc');

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th>';
        html += '</tr></thead><tbody>';

        appointments.forEach(apt => {
            const patient = dataManager.getById('patients', apt.patientId);
            const doctor = dataManager.getById('doctors', apt.doctorId);
            const statusClass = apt.status === 'Completed' ? 'success' : 'warning';

            html += `
                <tr>
                    <td>${patient.name}</td>
                    <td>${doctor.name} (${doctor.specialization})</td>
                    <td>${utils.formatDate(apt.date)}</td>
                    <td>${apt.time}</td>
                    <td><span class="badge badge-${statusClass}">${apt.status}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    }
};
