/* ===== VGC Maritime Cyber Dashboard - Main Application ===== */

(function () {
    'use strict';

    // ===== Navigation =====
    function initNavigation() {
        // Card navigation
        document.querySelectorAll('.nav-card').forEach(function (card) {
            card.addEventListener('click', function () {
                showView(card.getAttribute('data-view'));
            });
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showView(card.getAttribute('data-view'));
                }
            });
        });

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showView(btn.getAttribute('data-view'));
            });
        });
    }

    function showView(viewName) {
        document.querySelectorAll('.view').forEach(function (v) {
            v.classList.remove('active');
        });
        var target = document.getElementById('view-' + viewName);
        if (target) {
            target.classList.add('active');
        }

        // Initialize view-specific content
        if (viewName === 'gps-tracking') {
            initMap();
        } else if (viewName === 'visualizations') {
            initCharts();
        } else if (viewName === 'compliance') {
            initChecklist();
        } else if (viewName === 'analytics') {
            updateThreatTime();
        }
    }

    // ===== Vessel Data =====
    var vessels = [
        { id: 1, name: 'MV Pacific Star', imo: '9434567', lat: 1.29, lng: 103.85, speed: 12.5, status: 'active', heading: 45 },
        { id: 2, name: 'MV Atlantic Voyager', imo: '9512345', lat: 1.26, lng: 103.82, speed: 8.3, status: 'active', heading: 120 },
        { id: 3, name: 'MT Ocean Guardian', imo: '9623456', lat: 1.32, lng: 103.88, speed: 0, status: 'alert', heading: 0 },
        { id: 4, name: 'MV Coral Express', imo: '9734567', lat: 1.22, lng: 103.78, speed: 15.1, status: 'active', heading: 270 },
        { id: 5, name: 'MT Sea Defender', imo: '9845678', lat: 1.35, lng: 103.92, speed: 10.7, status: 'active', heading: 180 },
        { id: 6, name: 'MV Northern Light', imo: '9956789', lat: 1.28, lng: 103.75, speed: 6.2, status: 'alert', heading: 90 },
        { id: 7, name: 'MV Dragon Pearl', imo: '9167890', lat: 1.31, lng: 103.90, speed: 14.8, status: 'active', heading: 315 },
        { id: 8, name: 'MT Blue Horizon', imo: '9278901', lat: 1.24, lng: 103.80, speed: 9.5, status: 'active', heading: 60 },
        { id: 9, name: 'MV Eagle Wing', imo: '9389012', lat: 1.33, lng: 103.86, speed: 11.3, status: 'active', heading: 210 },
        { id: 10, name: 'MT Storm Rider', imo: '9490123', lat: 1.27, lng: 103.83, speed: 0, status: 'alert', heading: 0 }
    ];

    // ===== GPS Tracking Map =====
    var map = null;
    var markers = {};
    var mapInitialized = false;
    var trackingInterval = null;

    function initMap() {
        if (mapInitialized && map) {
            setTimeout(function () { map.invalidateSize(); }, 100);
            return;
        }

        map = L.map('map').setView([1.29, 103.85], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Add vessel markers
        vessels.forEach(function (vessel) {
            addVesselMarker(vessel);
        });

        // Build sidebar list
        buildVesselList();

        // Start live updates
        startTracking();

        mapInitialized = true;

        setTimeout(function () { map.invalidateSize(); }, 200);
    }

    function createVesselIcon(status) {
        var color = status === 'alert' ? '#ef4444' : '#0ea5e9';
        return L.divIcon({
            className: 'vessel-marker',
            html: '<div style="width:16px;height:16px;border-radius:50%;background:' + color +
                ';border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    }

    function addVesselMarker(vessel) {
        var icon = createVesselIcon(vessel.status);
        var marker = L.marker([vessel.lat, vessel.lng], { icon: icon }).addTo(map);

        marker.bindPopup(
            '<div style="min-width:180px;">' +
            '<strong style="font-size:1rem;color:#0a2463;">' + vessel.name + '</strong><br>' +
            '<span style="color:#64748b;">IMO: ' + vessel.imo + '</span><br>' +
            '<hr style="margin:0.5rem 0;border-color:#e2e8f0;">' +
            '<b>Position:</b> ' + vessel.lat.toFixed(4) + ', ' + vessel.lng.toFixed(4) + '<br>' +
            '<b>Speed:</b> ' + vessel.speed + ' knots<br>' +
            '<b>Heading:</b> ' + vessel.heading + '&deg;<br>' +
            '<b>Status:</b> <span style="color:' + (vessel.status === 'alert' ? '#ef4444' : '#10b981') + ';font-weight:700;">' +
            vessel.status.toUpperCase() + '</span>' +
            '</div>'
        );

        markers[vessel.id] = marker;
    }

    function buildVesselList() {
        var container = document.getElementById('vessel-list-items');
        if (!container) return;
        container.innerHTML = '';

        vessels.forEach(function (vessel) {
            var item = document.createElement('div');
            item.className = 'vessel-item';
            item.innerHTML =
                '<div class="vessel-dot ' + vessel.status + '"></div>' +
                '<div>' +
                '<div class="vessel-item-name">' + vessel.name + '</div>' +
                '<div class="vessel-item-status">' + vessel.speed + ' kn | ' + vessel.status.toUpperCase() + '</div>' +
                '</div>';
            item.addEventListener('click', function () {
                if (map && markers[vessel.id]) {
                    map.setView([vessel.lat, vessel.lng], 14);
                    markers[vessel.id].openPopup();
                }
            });
            container.appendChild(item);
        });
    }

    function startTracking() {
        if (trackingInterval) clearInterval(trackingInterval);

        trackingInterval = setInterval(function () {
            vessels.forEach(function (vessel) {
                if (vessel.status === 'active') {
                    // Simulate position drift
                    vessel.lat += (Math.random() - 0.5) * 0.002;
                    vessel.lng += (Math.random() - 0.5) * 0.002;
                    vessel.speed = Math.max(0, vessel.speed + (Math.random() - 0.5) * 2);
                    vessel.speed = Math.round(vessel.speed * 10) / 10;

                    if (markers[vessel.id]) {
                        markers[vessel.id].setLatLng([vessel.lat, vessel.lng]);
                    }
                }
            });
            buildVesselList();
        }, 5000);
    }

    // ===== Analytics =====
    function updateThreatTime() {
        var el = document.getElementById('threat-time');
        if (el) {
            el.textContent = new Date().toLocaleTimeString();
        }
    }

    // ===== Compliance Checklist =====
    var checklistData = [
        {
            category: 'Cybersecurity Standards',
            items: [
                { id: 'cs1', label: 'IMO MSC-FAL.1/Circ.3 Guidelines implemented', checked: true },
                { id: 'cs2', label: 'NIST Cybersecurity Framework alignment', checked: true },
                { id: 'cs3', label: 'ISO 27001 certification current', checked: true },
                { id: 'cs4', label: 'IEC 62443 industrial control compliance', checked: true },
                { id: 'cs5', label: 'BIMCO cyber clause in charter parties', checked: true },
                { id: 'cs6', label: 'Regular penetration testing schedule', checked: false }
            ]
        },
        {
            category: 'Vessel Security',
            items: [
                { id: 'vs1', label: 'Bridge system access controls configured', checked: true },
                { id: 'vs2', label: 'ECDIS software up to date', checked: true },
                { id: 'vs3', label: 'AIS system integrity verified', checked: true },
                { id: 'vs4', label: 'Crew cybersecurity training completed', checked: false },
                { id: 'vs5', label: 'USB port restrictions enforced', checked: true },
                { id: 'vs6', label: 'Satellite communication encryption enabled', checked: true }
            ]
        },
        {
            category: 'Operational Requirements',
            items: [
                { id: 'or1', label: 'Incident response plan documented', checked: true },
                { id: 'or2', label: 'Backup and recovery procedures tested', checked: false },
                { id: 'or3', label: 'Vendor access policies established', checked: true },
                { id: 'or4', label: 'Network segmentation implemented', checked: true },
                { id: 'or5', label: 'Security audit schedule maintained', checked: false },
                { id: 'or6', label: 'Change management procedures in place', checked: true }
            ]
        }
    ];

    var checklistInitialized = false;

    function initChecklist() {
        if (checklistInitialized) return;
        checklistInitialized = true;

        var container = document.getElementById('checklist-container');
        if (!container) return;
        container.innerHTML = '';

        checklistData.forEach(function (section) {
            var sectionEl = document.createElement('div');
            sectionEl.className = 'checklist-section';
            sectionEl.innerHTML = '<h3>' + section.category + '</h3>';

            section.items.forEach(function (item) {
                var row = document.createElement('div');
                row.className = 'checklist-item';
                row.innerHTML =
                    '<div class="checklist-left">' +
                    '<input type="checkbox" id="' + item.id + '" ' + (item.checked ? 'checked' : '') + ' />' +
                    '<label for="' + item.id + '">' + item.label + '</label>' +
                    '</div>' +
                    '<span class="status-badge ' + (item.checked ? 'status-completed' : 'status-pending') + '">' +
                    (item.checked ? 'Completed' : 'Pending') + '</span>';

                var checkbox = row.querySelector('input');
                checkbox.addEventListener('change', function () {
                    item.checked = checkbox.checked;
                    var badge = row.querySelector('.status-badge');
                    badge.className = 'status-badge ' + (item.checked ? 'status-completed' : 'status-pending');
                    badge.textContent = item.checked ? 'Completed' : 'Pending';
                    updateCompliancePercent();
                });

                sectionEl.appendChild(row);
            });

            container.appendChild(sectionEl);
        });

        updateCompliancePercent();
    }

    function updateCompliancePercent() {
        var total = 0;
        var completed = 0;
        checklistData.forEach(function (section) {
            section.items.forEach(function (item) {
                total++;
                if (item.checked) completed++;
            });
        });
        var percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        var el = document.getElementById('compliance-percent');
        if (el) {
            el.textContent = percent + '%';
        }
    }

    // ===== Export to Excel =====
    function exportToExcel() {
        var rows = [['Category', 'Requirement', 'Status']];
        checklistData.forEach(function (section) {
            section.items.forEach(function (item) {
                rows.push([section.category, item.label, item.checked ? 'Completed' : 'Pending']);
            });
        });

        var ws = XLSX.utils.aoa_to_sheet(rows);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Compliance Checklist');

        // Style column widths
        ws['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 15 }];

        XLSX.writeFile(wb, 'VGC_Maritime_Compliance_Checklist.xlsx');
    }

    // ===== Export to PDF =====
    function exportToPDF() {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(10, 36, 99);
        doc.text('VGC Maritime Cyber - Compliance Checklist', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Generated: ' + new Date().toLocaleString(), 14, 30);

        var y = 42;

        checklistData.forEach(function (section) {
            doc.setFontSize(13);
            doc.setTextColor(10, 36, 99);
            doc.text(section.category, 14, y);
            y += 8;

            doc.setFontSize(10);
            section.items.forEach(function (item) {
                if (y > 275) {
                    doc.addPage();
                    y = 20;
                }
                var status = item.checked ? '[X]' : '[ ]';
                doc.setTextColor(30, 41, 59);
                doc.text(status + '  ' + item.label, 18, y);

                doc.setTextColor(item.checked ? 22 : 146, item.checked ? 197 : 64, item.checked ? 94 : 14);
                doc.text(item.checked ? 'Completed' : 'Pending', 170, y);

                y += 7;
            });

            y += 5;
        });

        doc.save('VGC_Maritime_Compliance_Checklist.pdf');
    }

    // ===== Charts =====
    var chartsInitialized = false;

    function initCharts() {
        if (chartsInitialized) return;
        chartsInitialized = true;

        initPieChart();
        initScatterChart();
        initGanttChart();
    }

    function initPieChart() {
        var ctx = document.getElementById('pie-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Malware', 'Phishing', 'Unauthorized Access', 'Data Breach', 'DDoS Attack'],
                datasets: [{
                    data: [28, 24, 20, 16, 12],
                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 16, font: { size: 12 } }
                    }
                }
            }
        });
    }

    function initScatterChart() {
        var ctx = document.getElementById('scatter-chart');
        if (!ctx) return;

        var scatterData = vessels.map(function (v) {
            return {
                x: v.speed,
                y: Math.round(60 + Math.random() * 35),
                label: v.name
            };
        });

        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Vessel Performance',
                    data: scatterData,
                    backgroundColor: '#0ea5e9',
                    borderColor: '#0284c7',
                    borderWidth: 1,
                    pointRadius: 8,
                    pointHoverRadius: 12
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: 'Speed (knots)', font: { weight: 'bold' } }
                    },
                    y: {
                        title: { display: true, text: 'Efficiency (%)', font: { weight: 'bold' } },
                        min: 50,
                        max: 100
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var d = context.raw;
                                return (d.label || '') + ': ' + d.x + ' kn, ' + d.y + '% eff.';
                            }
                        }
                    }
                }
            }
        });
    }

    function initGanttChart() {
        var ctx = document.getElementById('gantt-chart');
        if (!ctx) return;

        var audits = [
            { task: 'Network Audit', start: 1, end: 3 },
            { task: 'Access Review', start: 2, end: 5 },
            { task: 'Firewall Test', start: 4, end: 6 },
            { task: 'ECDIS Check', start: 5, end: 8 },
            { task: 'Pen Test', start: 7, end: 10 },
            { task: 'Compliance Audit', start: 9, end: 12 }
        ];

        var colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9'];

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: audits.map(function (a) { return a.task; }),
                datasets: [{
                    label: 'Start (week)',
                    data: audits.map(function (a) { return a.start; }),
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    barPercentage: 0.6
                }, {
                    label: 'Duration (weeks)',
                    data: audits.map(function (a) { return a.end - a.start; }),
                    backgroundColor: colors,
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: 'Weeks', font: { weight: 'bold' } },
                        min: 0,
                        max: 13,
                        ticks: { stepSize: 1 }
                    },
                    y: {
                        stacked: true
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.datasetIndex === 0) return '';
                                var idx = context.dataIndex;
                                return audits[idx].task + ': Week ' + audits[idx].start + ' - ' + audits[idx].end;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== Admin Settings =====
    function initAdminSettings() {
        var btnGps = document.getElementById('btn-save-gps');
        if (btnGps) {
            btnGps.addEventListener('click', function () {
                var provider = document.getElementById('gps-provider').value;
                var apiKey = document.getElementById('api-key').value;
                var interval = parseInt(document.getElementById('update-interval').value, 10);
                if (isNaN(interval) || interval < 5) interval = 5;
                if (interval > 300) interval = 300;
                var mode = document.getElementById('tracking-mode').value;

                var settings = {
                    provider: provider,
                    apiKey: apiKey,
                    interval: interval,
                    mode: mode
                };

                try {
                    localStorage.setItem('vgc_gps_settings', JSON.stringify(settings));
                } catch (e) {
                    // localStorage not available
                }
                showToast('GPS settings saved successfully');
            });
        }

        var btnAlerts = document.getElementById('btn-save-alerts');
        if (btnAlerts) {
            btnAlerts.addEventListener('click', function () {
                showToast('Alert settings saved successfully');
            });
        }

        var btnSecurity = document.getElementById('btn-save-security');
        if (btnSecurity) {
            btnSecurity.addEventListener('click', function () {
                showToast('Security settings saved successfully');
            });
        }

        // Load saved GPS settings
        try {
            var saved = localStorage.getItem('vgc_gps_settings');
            if (saved) {
                var s = JSON.parse(saved);
                var providerEl = document.getElementById('gps-provider');
                var apiKeyEl = document.getElementById('api-key');
                var intervalEl = document.getElementById('update-interval');
                var modeEl = document.getElementById('tracking-mode');
                if (providerEl) providerEl.value = s.provider || 'openstreetmap';
                if (apiKeyEl) apiKeyEl.value = s.apiKey || '';
                if (intervalEl) intervalEl.value = s.interval || 5;
                if (modeEl) modeEl.value = s.mode || 'realtime';
            }
        } catch (e) {
            // localStorage not available
        }
    }

    // ===== Toast Notification =====
    function showToast(message) {
        var toast = document.createElement('div');
        toast.style.cssText =
            'position:fixed;bottom:2rem;right:2rem;background:#0a2463;color:white;' +
            'padding:0.75rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);' +
            'z-index:9999;font-size:0.9rem;animation:fadeIn 0.3s ease;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2500);
    }

    // ===== Export Buttons =====
    function initExportButtons() {
        var btnExcel = document.getElementById('btn-export-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', exportToExcel);
        }
        var btnPdf = document.getElementById('btn-export-pdf');
        if (btnPdf) {
            btnPdf.addEventListener('click', exportToPDF);
        }
    }

    // ===== Initialize =====
    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initAdminSettings();
        initExportButtons();
    });

})();
