// Doctor Management Module (Admin)

const doctorManagement = {
    showAddDoctorForm() {
        utils.openModal('addDoctorModal');
        utils.resetForm('addDoctorForm');

        // Setup form submission
        const form = document.getElementById('addDoctorForm');
        form.onsubmit = (e) => this.handleAddDoctor(e);
    },

    handleAddDoctor(e) {
        e.preventDefault();

        const formData = utils.getFormData('addDoctorForm');

        // Validation
        if (!utils.validateRequired(formData.doctorName)) {
            utils.showToast('Doctor name is required', 'error');
            return;
        }

        if (!utils.validateRequired(formData.specialization)) {
            utils.showToast('Specialization is required', 'error');
            return;
        }

        // Create user account for doctor
        const username = formData.doctorName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
        const password = 'doctor123'; // Default password

        const user = {
            username: username,
            password: password,
            role: 'doctor',
            name: formData.doctorName
        };

        const newUser = dataManager.add('users', user);

        // Add doctor
        const doctor = {
            name: formData.doctorName,
            specialization: formData.specialization,
            available: true,
            userId: newUser.id
        };

        dataManager.add('doctors', doctor);

        utils.showToast(`Doctor added! Username: ${username}, Password: ${password}`, 'success');
        utils.closeModal('addDoctorModal');
        utils.resetForm('addDoctorForm');

        // Refresh list
        this.showDoctorList();
    },

    showDoctorList() {
        const container = document.getElementById('doctorListContainer');
        if (!container) return;

        const doctors = dataManager.getAll('doctors');

        let html = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Doctor Management</h2>
                    <button class="btn btn-primary" onclick="doctorManagement.showAddDoctorForm()">
                        ➕ Add New Doctor
                    </button>
                </div>
                
                <div id="doctorTableContainer">
        `;

        if (doctors.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">👨‍⚕️</div>
                    <div class="empty-state-text">No doctors found</div>
                </div>
            `;
        } else {
            html += this.renderDoctorTable(doctors);
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    renderDoctorTable(doctors) {
        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Name</th><th>Specialization</th><th>Availability</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        doctors.forEach(doctor => {
            const statusClass = doctor.available ? 'success' : 'danger';
            const statusText = doctor.available ? 'Available' : 'Not Available';

            html += `
                <tr>
                    <td>${doctor.name}</td>
                    <td>${doctor.specialization}</td>
                    <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-${doctor.available ? 'danger' : 'success'} btn-sm" 
                                    onclick="doctorManagement.toggleAvailability(${doctor.id})">
                                ${doctor.available ? '🚫 Mark Unavailable' : '✅ Mark Available'}
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="doctorManagement.editDoctor(${doctor.id})">
                                ✏️ Edit
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    },

    toggleAvailability(doctorId) {
        const doctor = dataManager.getById('doctors', doctorId);
        if (!doctor) return;

        dataManager.update('doctors', doctorId, { available: !doctor.available });

        const status = !doctor.available ? 'available' : 'unavailable';
        utils.showToast(`Doctor marked as ${status}`, 'info');

        this.showDoctorList();
    },

    editDoctor(doctorId) {
        const doctor = dataManager.getById('doctors', doctorId);
        if (!doctor) return;

        // Populate form
        document.getElementById('editDoctorId').value = doctor.id;
        document.getElementById('editDoctorName').value = doctor.name;
        document.getElementById('editDoctorSpecialization').value = doctor.specialization;

        utils.openModal('editDoctorModal');

        // Setup form submission
        const form = document.getElementById('editDoctorForm');
        form.onsubmit = (e) => this.handleEditDoctor(e);
    },

    handleEditDoctor(e) {
        e.preventDefault();

        const doctorId = document.getElementById('editDoctorId').value;
        const formData = utils.getFormData('editDoctorForm');

        const updatedDoctor = {
            name: formData.editDoctorName,
            specialization: formData.editDoctorSpecialization
        };

        dataManager.update('doctors', doctorId, updatedDoctor);

        // Update user name as well
        const doctor = dataManager.getById('doctors', doctorId);
        if (doctor.userId) {
            dataManager.update('users', doctor.userId, { name: formData.editDoctorName });
        }

        utils.showToast('Doctor updated successfully!', 'success');
        utils.closeModal('editDoctorModal');

        this.showDoctorList();
    }
};
