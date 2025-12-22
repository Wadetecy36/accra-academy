/* ============================================================= */
/*  js/portal.js – SECURE DASHBOARD LOGIC (THEME MATCHED)        */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURATION ---
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
                // Shake effect
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
            const res = await fetch(`${API_BASE}/student/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) throw new Error("Session Expired");
            
            const student = await res.json();

            // ANIMATE TRANSITION
            loginView.style.opacity = '0';
            setTimeout(() => {
                loginView.classList.add('hidden');
                dashboardView.classList.remove('hidden');
                logoutBtn.classList.remove('hidden');
                // Subtle fade in
                dashboardView.classList.add('animate-fade-in');
            }, 300);
            
            // Populate UI
            populateUI(student);

        } catch (err) {
            console.error("Dashboard Load Error:", err);
            localStorage.removeItem('bleoo_student_token');
            if(!loginView.classList.contains('hidden')) return;
            window.location.reload();
        }
    }

    // --- 5. UI POPULATION ---
    function populateUI(s) {
        document.getElementById('p-name').innerText = s.fullName;
        document.getElementById('p-index').innerText = s.indexNumber;
        document.getElementById('p-prog').innerText = s.program;
        document.getElementById('p-house').innerText = s.house;
        document.getElementById('p-class').innerText = s.currentClass;
        
        document.getElementById('p-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName)}&background=FDBE11&color=002147&bold=true&size=128`;

        document.getElementById('p-gpa').innerText = s.gpa ? s.gpa.toFixed(2) : "0.00";
        document.getElementById('p-attendance').innerText = (s.attendance || 0) + "%";

        const currentYear = new Date().getFullYear();
        const statusBadge = document.getElementById('p-status');
        if (s.yearOfCompletion < currentYear) {
            statusBadge.innerText = "ALUMNI";
            statusBadge.className = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold text-royal border border-royal";
        }

        if (s.transcript && s.transcript.length > 0) {
            renderTranscript(s.transcript);
            renderChart(s.transcript);
        } else {
            document.getElementById('results-body').innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-400 italic">No academic records found for this index number.</td></tr>`;
        }
    }

    function renderTranscript(transcript) {
        const latest = transcript[transcript.length - 1];
        const tbody = document.getElementById('results-body');
        if(!latest) return;

        tbody.innerHTML = latest.courses.map((c, index) => `
            <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gold/5 transition ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-white/5' : ''}">
                <td class="p-4 font-bold text-royal dark:text-gray-200">${c.subject}</td>
                <td class="p-4 font-black ${getGradeColor(c.grade)}">${c.grade}</td>
                <td class="p-4 text-gray-500 dark:text-gray-400 font-mono">${c.score}</td>
                <td class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wide">${getRemark(c.grade)}</td>
            </tr>
        `).join('');
    }

    // THEME MATCHED CHART
    function renderChart(transcript) {
        const ctx = document.getElementById('gradesChart').getContext('2d');
        const labels = transcript.map(t => t.semester || 'Sem X');
        const dataPoints = transcript.map(t => {
            if(!t.courses || t.courses.length === 0) return 0;
            const total = t.courses.reduce((acc, curr) => acc + (curr.score || 0), 0);
            return (total / t.courses.length).toFixed(1);
        });

        // Gradient for Chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(253, 190, 17, 0.5)'); // Gold
        gradient.addColorStop(1, 'rgba(253, 190, 17, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'GPA Trend',
                    data: dataPoints,
                    borderColor: '#FDBE11', // Gold
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#002147', // Royal
                    pointBorderColor: '#FDBE11',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: false, 
                        min: 40, 
                        max: 100, 
                        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5] },
                        ticks: { color: '#9ca3af' }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });
    }

    function getGradeColor(g) {
        if (['A1', 'B2', 'B3'].includes(g)) return 'text-green-500';
        if (['C4', 'C5', 'C6'].includes(g)) return 'text-yellow-500';
        return 'text-red-500';
    }

    function getRemark(g) {
        const map = { 'A1': 'Excellent', 'B2': 'Very Good', 'B3': 'Good', 'C4': 'Credit', 'C5': 'Credit', 'C6': 'Credit', 'D7': 'Pass', 'E8': 'Pass', 'F9': 'Fail' };
        return map[g] || 'N/A';
    }
});