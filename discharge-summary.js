// Discharge Summary Module

const dischargeSummary = {
    showDischargeSummaryForm() {
        utils.openModal('dischargeSummaryModal');
        utils.resetForm('dischargeSummaryForm');

        // Populate patient dropdown
        this.populatePatientDropdown();

        // Setup patient selection to auto-fill data
        document.getElementById('dischargePatient')?.addEventListener('change', (e) => {
            this.loadPatientData(e.target.value);
        });

        // Setup form submission
        const form = document.getElementById('dischargeSummaryForm');
        form.onsubmit = (e) => this.handleSaveDischargeSummary(e);
    },

    populatePatientDropdown() {
        const patients = dataManager.getAll('patients');
        const select = document.getElementById('dischargePatient');

        select.innerHTML = '<option value="">Select Patient</option>';

        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.contact})`;
            select.appendChild(option);
        });
    },

    loadPatientData(patientId) {
        if (!patientId) return;

        const patient = dataManager.getById('patients', patientId);
        if (!patient) return;

        // Auto-fill patient info
        document.getElementById('dischargePatientInfo').innerHTML = `
            <div style="background: var(--bg-glass); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1rem;">
                <p><strong>Name:</strong> ${patient.name}</p>
                <p><strong>Age:</strong> ${patient.age} | <strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Contact:</strong> ${patient.contact}</p>
                <p><strong>Medical History:</strong> ${patient.medicalHistory}</p>
            </div>
        `;

        // Load recent consultations
        const consultations = dataManager.getConsultationsByPatient(patientId);
        if (consultations.length > 0) {
            const latest = consultations[consultations.length - 1];
            document.getElementById('dischargeDiagnosis').value = latest.diagnosis;
            document.getElementById('dischargeTreatment').value = latest.prescription;
        }
    },

    handleSaveDischargeSummary(e) {
        e.preventDefault();

        const formData = utils.getFormData('dischargeSummaryForm');

        // Validation
        if (!formData.dischargePatient) {
            utils.showToast('Please select a patient', 'error');
            return;
        }

        if (!utils.validateRequired(formData.dischargeDiagnosis)) {
            utils.showToast('Diagnosis is required', 'error');
            return;
        }

        // Create discharge summary
        const summary = {
            patientId: parseInt(formData.dischargePatient),
            diagnosis: formData.dischargeDiagnosis,
            treatment: formData.dischargeTreatment,
            doctorRemarks: formData.dischargeRemarks,
            date: utils.getCurrentDate()
        };

        const saved = dataManager.add('dischargeSummaries', summary);

        utils.showToast('Discharge summary saved successfully!', 'success');
        utils.closeModal('dischargeSummaryModal');

        // Show the summary
        this.viewDischargeSummary(saved.id);
    },

    viewDischargeSummary(summaryId) {
        const summary = dataManager.getById('dischargeSummaries', summaryId);
        if (!summary) return;

        const patient = dataManager.getById('patients', summary.patientId);

        let html = `
            <div class="modal-header">
                <h3 class="modal-title">Discharge Summary</h3>
                <button class="modal-close" onclick="utils.closeModal('viewDischargeSummaryModal')">×</button>
            </div>
            
            <div id="dischargeSummaryContent" style="margin-top: 1rem;">
                <div class="text-center mb-3">
                    <h2 style="margin: 0; color: var(--primary);">Hospital Management System</h2>
                    <p style="color: var(--text-muted);">Discharge Summary</p>
                </div>
                
                <div style="background: var(--bg-glass); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1rem;">
                    <h4>Patient Information</h4>
                    <p><strong>Name:</strong> ${patient.name}</p>
                    <p><strong>Age:</strong> ${patient.age} years | <strong>Gender:</strong> ${patient.gender}</p>
                    <p><strong>Contact:</strong> ${patient.contact}</p>
                    <p><strong>Address:</strong> ${patient.address}</p>
                    <p><strong>Discharge Date:</strong> ${utils.formatDate(summary.date)}</p>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <h4>Diagnosis</h4>
                    <p style="background: var(--bg-glass); padding: 1rem; border-radius: var(--border-radius);">
                        ${summary.diagnosis}
                    </p>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <h4>Treatment Given</h4>
                    <p style="background: var(--bg-glass); padding: 1rem; border-radius: var(--border-radius);">
                        ${summary.treatment}
                    </p>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <h4>Doctor's Remarks</h4>
                    <p style="background: var(--bg-glass); padding: 1rem; border-radius: var(--border-radius);">
                        ${summary.doctorRemarks || 'None'}
                    </p>
                </div>
                
                <div class="text-center mt-3" style="color: var(--text-muted); font-size: 0.875rem;">
                    <p>This is a computer-generated discharge summary.</p>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button class="btn btn-primary" onclick="utils.printToPDF('dischargeSummaryContent', 'Discharge-Summary-${patient.name}')">
                    🖨️ Download PDF
                </button>
            </div>
        `;

        document.getElementById('viewDischargeSummaryModal').querySelector('.modal-content').innerHTML = html;
        utils.openModal('viewDischargeSummaryModal');
    },

    showDischargeSummaryList() {
        const container = document.getElementById('dischargeSummaryListContainer');
        if (!container) return;

        const summaries = dataManager.getAll('dischargeSummaries');

        let html = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Discharge Summaries</h2>
                    <button class="btn btn-primary" onclick="dischargeSummary.showDischargeSummaryForm()">
                        ➕ Create New Summary
                    </button>
                </div>
        `;

        if (summaries.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <div class="empty-state-text">No discharge summaries found</div>
                </div>
            `;
        } else {
            html += '<div class="table-container"><table><thead><tr>';
            html += '<th>Patient</th><th>Date</th><th>Diagnosis</th><th>Actions</th>';
            html += '</tr></thead><tbody>';

            summaries.forEach(summary => {
                const patient = dataManager.getById('patients', summary.patientId);

                html += `
                    <tr>
                        <td>${patient.name}</td>
                        <td>${utils.formatDate(summary.date)}</td>
                        <td>${summary.diagnosis.substring(0, 50)}...</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="dischargeSummary.viewDischargeSummary(${summary.id})">
                                👁️ View
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }
};
