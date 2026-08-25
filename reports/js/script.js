/* ================================================================
   ESSARA Reports Page — Specific Logic
   Overrides the generic renderReports() from the shared script
   with the pixel-accurate version matching design/reports/screen.png.
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Category icon mapping ---
    // Maps subscription category names to Material Symbols icon names
    // and a CSS modifier class for the icon background color.
    const categoryIcons = {
        'Video':          { icon: 'movie',           style: 'primary'   },
        'Music':          { icon: 'music_note',      style: 'tertiary'  },
        'Gaming':         { icon: 'sports_esports',  style: 'primary'   },
        'Cloud Storage':  { icon: 'cloud',           style: 'secondary' },
        'Fitness':        { icon: 'fitness_center',  style: 'primary'   },
        'News':           { icon: 'newspaper',       style: 'secondary' },
        'Productivity':   { icon: 'work',            style: 'primary'   },
        'Food':           { icon: 'restaurant',      style: 'tertiary'  },
        'Other':          { icon: 'category',        style: 'secondary' }
    };

    /**
     * Returns the icon config for a given category name.
     * Falls back to a generic "category" icon if the name is not mapped.
     */
    const getIconForCategory = (category) => {
        return categoryIcons[category] || { icon: 'category', style: 'secondary' };
    };

    // --- Profile Dropdown (same pattern as overlaps/subscription pages) ---
    const trigger = document.getElementById("profile-icon");
    const dropdown = document.getElementById("profile-dropdown");
    if (trigger && dropdown) {
        try {
            const session = JSON.parse(localStorage.getItem('essara_session'));
            if (session) {
                document.getElementById('user-display-name').textContent = session.name;
                document.getElementById('user-display-email').textContent = session.email;
            }
        } catch(e) {}

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("open");
        });
        document.addEventListener("click", (e) => {
            if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
                dropdown.classList.remove("open");
            }
        });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem('essara_session');
            window.location.href = '../login.html';
        });
    }

    // --- Export button handler ---
    const exportBtn = document.getElementById("reports-export-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            // Build CSV from the current report data
            const session = JSON.parse(localStorage.getItem('essara_session'));
            if (!session) return;

            const subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];
            const currentCurrency = localStorage.getItem('essara_currency') || 'USD';
            const currencyRates = { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'INR': 83.00 };
            const currencySymbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹' };

            const normalizeCost = (cost, cycle) => {
                const c = parseFloat(cost);
                if (cycle === 'Weekly') return c * 4.345;
                if (cycle === 'Yearly') return c / 12;
                return c;
            };

            const cats = {};
            subs.forEach(s => {
                if (!cats[s.category]) cats[s.category] = { count: 0, cost: 0 };
                cats[s.category].count++;
                cats[s.category].cost += normalizeCost(s.cost, s.cycle);
            });

            const symbol = currencySymbols[currentCurrency];
            const rate = currencyRates[currentCurrency] || 1;
            let csv = 'Category,Count,Monthly Total,Annual Total,Status\n';

            Object.keys(cats)
                .sort((a, b) => cats[b].cost - cats[a].cost)
                .forEach(c => {
                    const monthly = (cats[c].cost * rate).toFixed(2);
                    const annual = (cats[c].cost * 12 * rate).toFixed(2);
                    const status = cats[c].count >= 2 ? 'Overlap' : 'Healthy';
                    csv += `"${c}",${cats[c].count},${symbol}${monthly},${symbol}${annual},${status}\n`;
                });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'essara_reports.csv';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // --- Override renderReports to match design reference exactly ---
    // The shared script.js defines renderReports() and calls it when
    // #view-reports exists. We override it after the shared script runs
    // by replacing the function on the global renderDashboard call path.
    //
    // Strategy: Wait a tick after DOMContentLoaded to ensure the shared script
    // has run renderDashboard(), then re-render with our enhanced version.

    setTimeout(() => {
        const viewReports = document.getElementById('view-reports');
        if (!viewReports) return;

        const session = JSON.parse(localStorage.getItem('essara_session'));
        if (!session) return;

        // Re-read state (same sources as shared script)
        const currentCurrency = localStorage.getItem('essara_currency') || 'USD';
        const currencyRates = { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'INR': 83.00 };
        const currencySymbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹' };

        const normalizeCost = (cost, cycle) => {
            const c = parseFloat(cost);
            if (cycle === 'Weekly') return c * 4.345;
            if (cycle === 'Yearly') return c / 12;
            return c;
        };

        const formatMoney = (amount) => {
            const converted = amount * currencyRates[currentCurrency];
            return currencySymbols[currentCurrency] + converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        };

        const renderReportsEnhanced = () => {
            const subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];

            const tbody = document.getElementById('reports-table-body');
            const totalsBar = document.getElementById('reports-totals');
            if (!tbody) return;

            // Build category aggregation
            const cats = {};
            subs.forEach(s => {
                if (!cats[s.category]) cats[s.category] = { count: 0, cost: 0 };
                cats[s.category].count++;
                cats[s.category].cost += normalizeCost(s.cost, s.cycle);
            });

            // Determine overlaps (2+ subs in same category)
            const overlapCats = Object.keys(cats).filter(c => cats[c].count >= 2);

            // Sort by monthly cost descending
            const sortedCats = Object.keys(cats).sort((a, b) => cats[b].cost - cats[a].cost);

            if (sortedCats.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="reports-table__empty">No subscriptions added yet.</td></tr>';
                if (totalsBar) totalsBar.style.display = 'none';
                return;
            }

            if (totalsBar) totalsBar.style.display = '';

            tbody.innerHTML = sortedCats.map(c => {
                const iconInfo = getIconForCategory(c);
                const isOverlap = overlapCats.includes(c);

                return `<tr>
                    <td>
                        <div class="reports-cat-cell">
                            <div class="reports-cat-icon reports-cat-icon--${iconInfo.style}">
                                <span class="material-symbols-outlined">${iconInfo.icon}</span>
                            </div>
                            <span class="reports-cat-name">${c}</span>
                        </div>
                    </td>
                    <td class="reports-td--count">${cats[c].count}</td>
                    <td class="reports-td--monthly">${formatMoney(cats[c].cost)}</td>
                    <td class="reports-td--annual">${formatMoney(cats[c].cost * 12)}</td>
                    <td class="reports-td--status">
                        ${isOverlap
                            ? '<span class="reports-status-tag reports-status-tag--overlap"><span class="material-symbols-outlined reports-status-tag__icon">warning</span> Overlap</span>'
                            : '<span class="reports-status-tag reports-status-tag--healthy"><span class="material-symbols-outlined reports-status-tag__icon">check_circle</span> Healthy</span>'
                        }
                    </td>
                </tr>`;
            }).join('');

            // Totals
            const monthlyTotal = subs.reduce((sum, s) => sum + normalizeCost(s.cost, s.cycle), 0);
            const monthlyEl = document.getElementById('reports-monthly-total');
            const annualEl = document.getElementById('reports-annual-total');
            if (monthlyEl) monthlyEl.textContent = formatMoney(monthlyTotal);
            if (annualEl) annualEl.textContent = formatMoney(monthlyTotal * 12);
        };

        // Initial render (overrides the basic one from shared script)
        renderReportsEnhanced();

        // Expose for currency change re-renders.
        const origReload = window.reloadDashboardData;
        window.reloadDashboardData = () => {
            if (typeof origReload === 'function') origReload();
            renderReportsPage();
        };

        // Listen for currency select changes directly
        const currSel = document.getElementById('currency-select');
        if (currSel) {
            currSel.addEventListener('change', () => {
                // Small delay to let the shared script update first
                setTimeout(renderReportsPage, 10);
            });
        }

        /**
         * Full re-render that re-reads currency from localStorage.
         * Needed because formatMoney captures currentCurrency at init time.
         */
        function renderReportsPage() {
            const cc = localStorage.getItem('essara_currency') || 'USD';
            const rates = { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'INR': 83.00 };
            const symbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹' };
            const subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];

            const fmtMoney = (amount) => {
                const converted = amount * rates[cc];
                return symbols[cc] + converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            };

            const tbody = document.getElementById('reports-table-body');
            const totalsBar = document.getElementById('reports-totals');
            if (!tbody) return;

            const cats = {};
            subs.forEach(s => {
                if (!cats[s.category]) cats[s.category] = { count: 0, cost: 0 };
                cats[s.category].count++;
                cats[s.category].cost += normalizeCost(s.cost, s.cycle);
            });

            const overlapCats = Object.keys(cats).filter(c => cats[c].count >= 2);
            const sortedCats = Object.keys(cats).sort((a, b) => cats[b].cost - cats[a].cost);

            if (sortedCats.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="reports-table__empty">No subscriptions added yet.</td></tr>';
                if (totalsBar) totalsBar.style.display = 'none';
                return;
            }

            if (totalsBar) totalsBar.style.display = '';

            tbody.innerHTML = sortedCats.map(c => {
                const iconInfo = getIconForCategory(c);
                const isOverlap = overlapCats.includes(c);

                return `<tr>
                    <td>
                        <div class="reports-cat-cell">
                            <div class="reports-cat-icon reports-cat-icon--${iconInfo.style}">
                                <span class="material-symbols-outlined">${iconInfo.icon}</span>
                            </div>
                            <span class="reports-cat-name">${c}</span>
                        </div>
                    </td>
                    <td class="reports-td--count">${cats[c].count}</td>
                    <td class="reports-td--monthly">${fmtMoney(cats[c].cost)}</td>
                    <td class="reports-td--annual">${fmtMoney(cats[c].cost * 12)}</td>
                    <td class="reports-td--status">
                        ${isOverlap
                            ? '<span class="reports-status-tag reports-status-tag--overlap"><span class="material-symbols-outlined reports-status-tag__icon">warning</span> Overlap</span>'
                            : '<span class="reports-status-tag reports-status-tag--healthy"><span class="material-symbols-outlined reports-status-tag__icon">check_circle</span> Healthy</span>'
                        }
                    </td>
                </tr>`;
            }).join('');

            const monthlyTotal = subs.reduce((sum, s) => sum + normalizeCost(s.cost, s.cycle), 0);
            const monthlyEl = document.getElementById('reports-monthly-total');
            const annualEl = document.getElementById('reports-annual-total');
            if (monthlyEl) monthlyEl.textContent = fmtMoney(monthlyTotal);
            if (annualEl) annualEl.textContent = fmtMoney(monthlyTotal * 12);
        }

    }, 50);
});
