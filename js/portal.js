/* ============================================================= */
/*  js/portal.js – SECURE STUDENT DASHBOARD LOGIC                */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURATION ---
    // Since api/index.js routes are mapped to /api in vercel.json
    const API_BASE = '/api'; 

    // --- DOM ELEMENTS ---
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const errorBox = document.getElementById('login-error');
    
    // --- 1. INITIALIZATION CHECK ---
    const token = localStorage.getItem('bleoo_student_token');
    if (token) {
        loadDashboard(token);
    }

    // --- 2. LOGIN HANDLER ---
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('login-btn');
            const originalText = btn.innerText;
            const indexNumber = document.getElementById('idx').value.trim();
            const password = document.getElementById('pwd').value.trim();

            // Reset UI
            errorBox.classList.add('hidden');
            btn.innerHTML = '<span class="animate-spin inline-block mr-2">⟳</span> Authenticating...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ indexNumber, password })
                });

                const data = await res.json();

                if (data.success) {
                    localStorage.setItem('bleoo_student_token', data.token);
                    loadDashboard(data.token);
                } else {
                    throw new Error(data.error || 'Invalid credentials');
                }

            } catch (err) {
                errorBox.innerText = err.message;
                errorBox.classList.remove('hidden');
                btn.innerText = originalText;
                btn.disabled = false;
                // Shake effect on error
                loginView.classList.add('animate-pulse');
                setTimeout(() => loginView.classList.remove('animate-pulse'), 500);
            }
        });
    }

    // --- 3. LOGOUT HANDLER ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('bleoo_student_token');
            window.location.reload();
        });
    }

    // --- 4. DASHBOARD LOADER ---
    async function loadDashboard(token) {
        try {
            // Fetch Profile Data
            const res = await fetch(`${API_BASE}/student/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) throw new Error("Session Expired");
            
            const student = await res.json();

            // SWITCH VIEWS
            loginView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            
            // Populate UI
            populateUI(student);

        } catch (err) {
            console.error("Dashboard Load Error:", err);
            localStorage.removeItem('bleoo_student_token');
            if(!loginView.classList.contains('hidden')) return; // Already at login
            window.location.reload();
        }
    }

    // --- 5. UI POPULATION ---
    function populateUI(s) {
        // Identity
        document.getElementById('p-name').innerText = s.fullName;
        document.getElementById('p-index').innerText = s.indexNumber;
        document.getElementById('p-prog').innerText = s.program;
        document.getElementById('p-house').innerText = s.house;
        document.getElementById('p-year').innerText = s.yearOfCompletion;
        document.getElementById('p-class').innerText = s.currentClass;
        
        // Avatar (Initials)
        document.getElementById('p-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName)}&background=002147&color=FDBE11&bold=true&length=2`;

        // Stats
        document.getElementById('p-gpa').innerText = s.gpa ? s.gpa.toFixed(2) : "0.00";
        document.getElementById('p-attendance').innerText = (s.attendance || 0) + "%";

        // Status Badge Logic
        const currentYear = new Date().getFullYear();
        const statusBadge = document.getElementById('p-status');
        if (s.yearOfCompletion < currentYear) {
            statusBadge.innerText = "ALUMNI";
            statusBadge.className = "px-3 py-1 bg-gold text-royal text-[10px] font-bold uppercase rounded-full";
        }

        // Table & Chart
        if (s.transcript && s.transcript.length > 0) {
            renderTranscript(s.transcript);
            renderChart(s.transcript);
        } else {
            document.getElementById('results-body').innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400">No academic records found.</td></tr>`;
        }
    }

    function renderTranscript(transcript) {
        // Get latest semester
        const latest = transcript[transcript.length - 1];
        const tbody = document.getElementById('results-body');
        
        if(!latest) return;

        tbody.innerHTML = latest.courses.map(c => `
            <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="p-4">${c.subject}</td>
                <td class="p-4 font-bold ${getGradeColor(c.grade)}">${c.grade}</td>
                <td class="p-4 text-gray-500">${c.score}</td>
                <td class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wide">${getRemark(c.grade)}</td>
            </tr>
        `).join('');
    }

    function renderChart(transcript) {
        const ctx = document.getElementById('gradesChart').getContext('2d');
        
        // Simple Logic: Calculate average score per semester
        const labels = transcript.map(t => t.semester || 'Sem X');
        const dataPoints = transcript.map(t => {
            if(!t.courses || t.courses.length === 0) return 0;
            const total = t.courses.reduce((acc, curr) => acc + (curr.score || 0), 0);
            return (total / t.courses.length).toFixed(1);
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Performance',
                    data: dataPoints,
                    borderColor: '#FDBE11',
                    backgroundColor: 'rgba(253, 190, 17, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#002147',
                    pointBorderColor: '#fff',
                    pointRadius: 6,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false, min: 40, max: 100, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Helpers
    function getGradeColor(g) {
        if (['A1', 'B2', 'B3'].includes(g)) return 'text-green-600';
        if (['C4', 'C5', 'C6'].includes(g)) return 'text-yellow-600';
        return 'text-red-600';
    }

    function getRemark(g) {
        const map = { 'A1': 'Excellent', 'B2': 'Very Good', 'B3': 'Good', 'C4': 'Credit', 'C5': 'Credit', 'C6': 'Credit', 'D7': 'Pass', 'E8': 'Pass', 'F9': 'Fail' };
        return map[g] || 'N/A';
    }
});