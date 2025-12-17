// Patient Management Module (Receptionist)

const patientManagement = {
    showAddPatientForm() {
        utils.openModal('addPatientModal');
        utils.resetForm('addPatientForm');

        // Setup form submission
        const form = document.getElementById('addPatientForm');
        form.onsubmit = (e) => this.handleAddPatient(e);
    },

    handleAddPatient(e) {
        e.preventDefault();

        const formData = utils.getFormData('addPatientForm');

        // Validation
        if (!utils.validateRequired(formData.name)) {
            utils.showToast('Patient name is required', 'error');
            return;
        }

        if (!utils.validatePhone(formData.contact)) {
            utils.showToast('Invalid phone number', 'error');
            return;
        }

        // Add patient
        const patient = {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            contact: formData.contact,
            address: formData.address,
            medicalHistory: formData.medicalHistory || 'None'
        };

        dataManager.add('patients', patient);

        utils.showToast('Patient added successfully!', 'success');
        utils.closeModal('addPatientModal');
        utils.resetForm('addPatientForm');

        // Refresh list if visible
        this.showPatientList();
    },

    showPatientList() {
        const container = document.getElementById('patientListContainer');
        if (!container) return;

        const patients = dataManager.getAll('patients');

        let html = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Patient List</h2>
                    <button class="btn btn-primary" onclick="patientManagement.showAddPatientForm()">
                        ➕ Add New Patient
                    </button>
                </div>
                
                <div class="search-bar">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" id="patientSearch" placeholder="Search by name or contact...">
                </div>
                
                <div id="patientTableContainer">
        `;

        if (patients.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">No patients found</div>
                </div>
            `;
        } else {
            html += this.renderPatientTable(patients);
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Setup search
        document.getElementById('patientSearch')?.addEventListener('input', (e) => {
            const filtered = utils.searchInArray(patients, e.target.value, ['name', 'contact', 'age']);
            document.getElementById('patientTableContainer').innerHTML = this.renderPatientTable(filtered);
        });
    },

    renderPatientTable(patients) {
        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Name</th><th>Age</th><th>Gender</th><th>Contact</th><th>Medical History</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        patients.forEach(patient => {
            html += `
                <tr>
                    <td>${patient.name}</td>
                    <td>${patient.age}</td>
                    <td>${patient.gender}</td>
                    <td>${patient.contact}</td>
                    <td>${patient.medicalHistory}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-sm" onclick="patientManagement.viewPatient(${patient.id})">
                                👁️ View
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="patientManagement.editPatient(${patient.id})">
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

    viewPatient(patientId) {
        const patient = dataManager.getById('patients', patientId);
        if (!patient) return;

        const appointments = dataManager.getAppointmentsByPatient(patientId);
        const consultations = dataManager.getConsultationsByPatient(patientId);

        let html = `
            <div class="modal-header">
                <h3 class="modal-title">Patient Details</h3>
                <button class="modal-close" onclick="utils.closeModal('viewPatientModal')">×</button>
            </div>
            
            <div style="margin-top: 1rem;">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> ${patient.name}</p>
                <p><strong>Age:</strong> ${patient.age} years</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Contact:</strong> ${patient.contact}</p>
                <p><strong>Address:</strong> ${patient.address}</p>
                <p><strong>Medical History:</strong> ${patient.medicalHistory}</p>
                
                <h4 style="margin-top: 1.5rem;">Appointments (${appointments.length})</h4>
                ${appointments.length > 0 ? `
                    <ul>
                        ${appointments.map(apt => {
            const doctor = dataManager.getById('doctors', apt.doctorId);
            return `<li>${utils.formatDate(apt.date)} - ${doctor.name} (${apt.status})</li>`;
        }).join('')}
                    </ul>
                ` : '<p>No appointments</p>'}
                
                <h4 style="margin-top: 1.5rem;">Consultations (${consultations.length})</h4>
                ${consultations.length > 0 ? `
                    <ul>
                        ${consultations.map(con => `<li>${utils.formatDate(con.date)} - ${con.diagnosis}</li>`).join('')}
                    </ul>
                ` : '<p>No consultations</p>'}
            </div>
        `;

        document.getElementById('viewPatientModal').querySelector('.modal-content').innerHTML = html;
        utils.openModal('viewPatientModal');
    },

    editPatient(patientId) {
        const patient = dataManager.getById('patients', patientId);
        if (!patient) return;

        // Populate form
        document.getElementById('editPatientId').value = patient.id;
        document.getElementById('editPatientName').value = patient.name;
        document.getElementById('editPatientAge').value = patient.age;
        document.getElementById('editPatientGender').value = patient.gender;
        document.getElementById('editPatientContact').value = patient.contact;
        document.getElementById('editPatientAddress').value = patient.address;
        document.getElementById('editPatientHistory').value = patient.medicalHistory;

        utils.openModal('editPatientModal');

        // Setup form submission
        const form = document.getElementById('editPatientForm');
        form.onsubmit = (e) => this.handleEditPatient(e);
    },

    handleEditPatient(e) {
        e.preventDefault();

        const patientId = document.getElementById('editPatientId').value;
        const formData = utils.getFormData('editPatientForm');

        const updatedPatient = {
            name: formData.editPatientName,
            age: parseInt(formData.editPatientAge),
            gender: formData.editPatientGender,
            contact: formData.editPatientContact,
            address: formData.editPatientAddress,
            medicalHistory: formData.editPatientHistory
        };

        dataManager.update('patients', patientId, updatedPatient);

        utils.showToast('Patient updated successfully!', 'success');
        utils.closeModal('editPatientModal');

        // Refresh list
        this.showPatientList();
    }
};
