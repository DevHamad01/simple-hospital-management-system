// Reports Module (Admin)

const reports = {
    showReportsPage() {
        const container = document.getElementById('reportsContainer');
        if (!container) return;

        let html = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Reports & Analytics</h2>
                </div>
                
                <div class="grid grid-2 mb-3">
                    <div class="card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);">
                        <h3 style="margin-bottom: 1rem;">📊 Daily Report</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">View today's statistics and activities</p>
                        <button class="btn btn-primary" onclick="reports.generateDailyReport()">
                            Generate Daily Report
                        </button>
                    </div>
                    
                    <div class="card" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%);">
                        <h3 style="margin-bottom: 1rem;">📅 Monthly Report</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">View current month's statistics</p>
                        <button class="btn btn-secondary" onclick="reports.generateMonthlyReport()">
                            Generate Monthly Report
                        </button>
                    </div>
                </div>
                
                <div id="reportContent"></div>
            </div>
        `;

        container.innerHTML = html;
    },

    generateDailyReport() {
        const today = utils.getCurrentDate();
        const stats = dataManager.getDailyStats(today);
        const appointments = dataManager.getAll('appointments').filter(a => a.date === today);
        const invoices = dataManager.getAll('invoices').filter(i => i.date === today);

        let html = `
            <div id="dailyReportContent">
                <div class="card-header">
                    <h3 class="card-title">Daily Report - ${utils.formatDate(today)}</h3>
                    <button class="btn btn-primary btn-sm" onclick="utils.printToPDF('dailyReportContent', 'Daily-Report-${today}')">
                        🖨️ Download PDF
                    </button>
                </div>
                
                <div class="grid grid-4 mb-3">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalPatients}</div>
                        <div class="stat-label">Patients Visited</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalAppointments}</div>
                        <div class="stat-label">Total Appointments</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${stats.completedAppointments}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${utils.formatCurrency(stats.totalBilling)}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                </div>
                
                <h4>Appointment Details</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (appointments.length === 0) {
            html += '<tr><td colspan="4" class="text-center">No appointments today</td></tr>';
        } else {
            appointments.forEach(apt => {
                const patient = dataManager.getById('patients', apt.patientId);
                const doctor = dataManager.getById('doctors', apt.doctorId);
                const statusClass = apt.status === 'Completed' ? 'success' : 'warning';

                html += `
                    <tr>
                        <td>${patient.name}</td>
                        <td>${doctor.name}</td>
                        <td>${apt.time}</td>
                        <td><span class="badge badge-${statusClass}">${apt.status}</span></td>
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
                </div>
                
                <h4 style="margin-top: 2rem;">Billing Details</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice Number</th>
                                <th>Patient</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (invoices.length === 0) {
            html += '<tr><td colspan="3" class="text-center">No invoices generated today</td></tr>';
        } else {
            invoices.forEach(inv => {
                const patient = dataManager.getById('patients', inv.patientId);

                html += `
                    <tr>
                        <td>${inv.invoiceNumber}</td>
                        <td>${patient.name}</td>
                        <td>${utils.formatCurrency(inv.totalAmount)}</td>
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('reportContent').innerHTML = html;
    },

    generateMonthlyReport() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const stats = dataManager.getMonthlyStats(year, month);
        const appointments = dataManager.getAll('appointments').filter(a => {
            const [y, m] = a.date.split('-');
            return parseInt(y) === year && parseInt(m) === month;
        });

        const invoices = dataManager.getAll('invoices').filter(i => {
            const [y, m] = i.date.split('-');
            return parseInt(y) === year && parseInt(m) === month;
        });

        const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

        let html = `
            <div id="monthlyReportContent">
                <div class="card-header">
                    <h3 class="card-title">Monthly Report - ${monthName}</h3>
                    <button class="btn btn-primary btn-sm" onclick="utils.printToPDF('monthlyReportContent', 'Monthly-Report-${year}-${month}')">
                        🖨️ Download PDF
                    </button>
                </div>
                
                <div class="grid grid-4 mb-3">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalPatients}</div>
                        <div class="stat-label">Unique Patients</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalAppointments}</div>
                        <div class="stat-label">Total Appointments</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${stats.completedAppointments}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${utils.formatCurrency(stats.totalBilling)}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                </div>
                
                <h4>Summary Statistics</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total Appointments</td>
                                <td>${stats.totalAppointments}</td>
                            </tr>
                            <tr>
                                <td>Completed Appointments</td>
                                <td>${stats.completedAppointments}</td>
                            </tr>
                            <tr>
                                <td>Pending Appointments</td>
                                <td>${stats.totalAppointments - stats.completedAppointments}</td>
                            </tr>
                            <tr>
                                <td>Unique Patients Served</td>
                                <td>${stats.totalPatients}</td>
                            </tr>
                            <tr>
                                <td>Total Invoices Generated</td>
                                <td>${invoices.length}</td>
                            </tr>
                            <tr style="background: var(--bg-glass); font-weight: bold;">
                                <td>Total Revenue</td>
                                <td style="color: var(--primary);">${utils.formatCurrency(stats.totalBilling)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <h4 style="margin-top: 2rem;">Top Revenue Days</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Appointments</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Group by date
        const dateGroups = {};
        appointments.forEach(apt => {
            if (!dateGroups[apt.date]) {
                dateGroups[apt.date] = { count: 0, revenue: 0 };
            }
            dateGroups[apt.date].count++;
        });

        invoices.forEach(inv => {
            if (!dateGroups[inv.date]) {
                dateGroups[inv.date] = { count: 0, revenue: 0 };
            }
            dateGroups[inv.date].revenue += inv.totalAmount;
        });

        const sortedDates = Object.keys(dateGroups).sort((a, b) =>
            dateGroups[b].revenue - dateGroups[a].revenue
        ).slice(0, 10);

        if (sortedDates.length === 0) {
            html += '<tr><td colspan="3" class="text-center">No data available</td></tr>';
        } else {
            sortedDates.forEach(date => {
                html += `
                    <tr>
                        <td>${utils.formatDate(date)}</td>
                        <td>${dateGroups[date].count}</td>
                        <td>${utils.formatCurrency(dateGroups[date].revenue)}</td>
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('reportContent').innerHTML = html;
    }
};
