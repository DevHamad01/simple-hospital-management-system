// Billing Module

const billing = {
    showBillingForm() {
        utils.openModal('billingModal');
        utils.resetForm('billingForm');

        // Populate patient dropdown
        this.populatePatientDropdown();

        // Setup form submission
        const form = document.getElementById('billingForm');
        form.onsubmit = (e) => this.handleGenerateBill(e);

        // Setup auto-calculation
        document.getElementById('consultationFee')?.addEventListener('input', () => this.calculateTotal());
        document.getElementById('otherCharges')?.addEventListener('input', () => this.calculateTotal());
    },

    populatePatientDropdown() {
        const patients = dataManager.getAll('patients');
        const select = document.getElementById('billingPatient');

        select.innerHTML = '<option value="">Select Patient</option>';

        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.contact})`;
            select.appendChild(option);
        });
    },

    calculateTotal() {
        const consultationFee = parseFloat(document.getElementById('consultationFee')?.value || 0);
        const otherCharges = parseFloat(document.getElementById('otherCharges')?.value || 0);
        const total = consultationFee + otherCharges;

        document.getElementById('totalAmount').value = total.toFixed(2);
    },

    handleGenerateBill(e) {
        e.preventDefault();

        const formData = utils.getFormData('billingForm');

        // Validation
        if (!formData.billingPatient) {
            utils.showToast('Please select a patient', 'error');
            return;
        }

        const consultationFee = parseFloat(formData.consultationFee || 0);
        const otherCharges = parseFloat(formData.otherCharges || 0);
        const totalAmount = consultationFee + otherCharges;

        if (totalAmount <= 0) {
            utils.showToast('Total amount must be greater than 0', 'error');
            return;
        }

        // Generate invoice
        const invoice = {
            patientId: parseInt(formData.billingPatient),
            consultationFee: consultationFee,
            otherCharges: otherCharges,
            totalAmount: totalAmount,
            date: utils.getCurrentDate(),
            invoiceNumber: 'INV-' + utils.generateId().toUpperCase()
        };

        dataManager.add('invoices', invoice);

        utils.showToast('Invoice generated successfully!', 'success');
        utils.closeModal('billingModal');

        // Show invoice
        this.viewInvoice(invoice.id);
    },

    viewInvoice(invoiceId) {
        const invoice = dataManager.getById('invoices', invoiceId);
        if (!invoice) return;

        const patient = dataManager.getById('patients', invoice.patientId);

        let html = `
            <div class="modal-header">
                <h3 class="modal-title">Invoice</h3>
                <button class="modal-close" onclick="utils.closeModal('invoiceModal')">×</button>
            </div>
            
            <div id="invoiceContent" style="margin-top: 1rem;">
                <div class="text-center mb-3">
                    <h2 style="margin: 0; color: var(--primary);">Hospital Management System</h2>
                    <p style="color: var(--text-muted);">Medical Invoice</p>
                </div>
                
                <div style="background: var(--bg-glass); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1rem;">
                    <div class="flex-between">
                        <div>
                            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                            <p><strong>Date:</strong> ${utils.formatDate(invoice.date)}</p>
                        </div>
                        <div style="text-align: right;">
                            <p><strong>Patient Name:</strong> ${patient.name}</p>
                            <p><strong>Contact:</strong> ${patient.contact}</p>
                        </div>
                    </div>
                </div>
                
                <table style="width: 100%; margin: 1rem 0;">
                    <thead>
                        <tr style="background: var(--bg-glass);">
                            <th style="padding: 0.75rem; text-align: left;">Description</th>
                            <th style="padding: 0.75rem; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem;">Consultation Fee</td>
                            <td style="padding: 0.75rem; text-align: right;">${utils.formatCurrency(invoice.consultationFee)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">Other Charges</td>
                            <td style="padding: 0.75rem; text-align: right;">${utils.formatCurrency(invoice.otherCharges)}</td>
                        </tr>
                        <tr style="background: var(--bg-glass); font-weight: bold;">
                            <td style="padding: 0.75rem;">Total Amount</td>
                            <td style="padding: 0.75rem; text-align: right; color: var(--primary);">${utils.formatCurrency(invoice.totalAmount)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="text-center mt-3" style="color: var(--text-muted); font-size: 0.875rem;">
                    <p>Thank you for choosing our services!</p>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button class="btn btn-primary" onclick="utils.printToPDF('invoiceContent', 'Invoice-${invoice.invoiceNumber}')">
                    🖨️ Print / Download PDF
                </button>
            </div>
        `;

        document.getElementById('invoiceModal').querySelector('.modal-content').innerHTML = html;
        utils.openModal('invoiceModal');
    }
};
