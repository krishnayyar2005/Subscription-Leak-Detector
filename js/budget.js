/* ================================================================
   ESSARA Budget Planner — Logic
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const viewBudget = document.getElementById('view-budget');
    if (!viewBudget) return;

    // We reuse category icon logic for the category table
    const categoryIcons = {
        'Video':          { icon: 'movie' },
        'Music':          { icon: 'music_note' },
        'Gaming':         { icon: 'sports_esports' },
        'Cloud Storage':  { icon: 'cloud' },
        'Fitness':        { icon: 'fitness_center' },
        'News':           { icon: 'newspaper' },
        'Productivity':   { icon: 'work' },
        'Food':           { icon: 'restaurant' },
        'Other':          { icon: 'category' }
    };
    
    // Default fallback icon
    const getIconForCategory = (category) => {
        // Based on the reference image specific names
        if (category === 'Cloud Services') return { icon: 'cloud' };
        if (category === 'Design Tools') return { icon: 'draft' };
        if (category === 'Marketing') return { icon: 'campaign' };
        if (category === 'Development') return { icon: 'code' };
        return categoryIcons[category] || { icon: 'category' };
    };

    const session = JSON.parse(localStorage.getItem('essara_session'));
    if (!session) return; // handled by global route guard in script.js

    // Currency handling uses the global window.formatMoney from script.js

    const normalizeCost = (cost, cycle) => {
        const c = parseFloat(cost);
        if (cycle === 'Weekly') return c * 4.345;
        if (cycle === 'Yearly') return c / 12;
        return c;
    };

    // Helper to run exactly the same overlap logic as script.js
    const getOverlapsData = (subs) => {
        const cats = {};
        subs.forEach(s => {
            if (!cats[s.category]) cats[s.category] = [];
            cats[s.category].push(s);
        });
        const overlapCategories = [];
        for (let cat in cats) {
            if (cats[cat].length > 1) overlapCategories.push(cat);
        }
        return overlapCategories;
    };

    const renderBudgetPage = () => {
        const subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];
        
        // Stored budget is MONTHLY in base currency
        const savedBudgetRaw = localStorage.getItem('essara_budget_' + session.id);
        const monthlyBudgetBase = savedBudgetRaw ? parseFloat(savedBudgetRaw) : null;
        const budget = monthlyBudgetBase || 0;
        
        // Update input field
        const inputEl = document.getElementById('budget-input');
        if (inputEl && document.activeElement !== inputEl) { // Don't override while typing
            inputEl.value = monthlyBudgetBase !== null ? monthlyBudgetBase.toFixed(2) : '';
        }

        // Calculate current monthly spend
        const monthlyTotalBase = subs.reduce((sum, s) => sum + normalizeCost(s.cost, s.cycle), 0);
        
        // Update Stats Row
        const statCurrent = document.getElementById('budget-stat-current');
        const statGoal = document.getElementById('budget-stat-goal');
        const statRemaining = document.getElementById('budget-stat-remaining');
        
        if (statCurrent) statCurrent.textContent = window.formatMoney(monthlyTotalBase);
        if (statGoal) statGoal.textContent = window.formatMoney(budget);
        
        if (statRemaining) {
            const remainingBase = budget - monthlyTotalBase;
            if (monthlyBudgetBase === null) {
                statRemaining.textContent = "Not set";
            } else {
                statRemaining.textContent = window.formatMoney(remainingBase);
            }
        }

        // --- Budget Utilization ---
        let pctUsed = 0;
        if (budget > 0) {
            pctUsed = (monthlyTotalBase / budget) * 100;
        }
        
        const utilText = document.getElementById('budget-utilization-text');
        const utilPct = document.getElementById('budget-utilization-pct');
        const utilMax = document.getElementById('budget-utilization-max');
        const utilMin = document.getElementById('budget-utilization-min');
        
        if (utilText) utilText.textContent = `You have used ${pctUsed.toFixed(0)}% of your monthly budget.`;
        if (utilPct) utilPct.textContent = `${pctUsed.toFixed(1)}%`;
        if (utilMax) utilMax.textContent = window.formatMoney(budget);
        if (utilMin) utilMin.textContent = window.formatMoney(0);

        // Calculate Category Breakdown
        const catTotalsBase = {};
        subs.forEach(s => {
            const norm = normalizeCost(s.cost, s.cycle);
            catTotalsBase[s.category] = (catTotalsBase[s.category] || 0) + norm;
        });

        const overlapCats = getOverlapsData(subs);
        
        // Sort categories by spend descending
        const sortedCats = Object.keys(catTotalsBase).sort((a, b) => catTotalsBase[b] - catTotalsBase[a]);

        // Render progress bar segments
        const progressTrack = document.getElementById('budget-progress-track');
        if (progressTrack) {
            if (budget === 0 || sortedCats.length === 0) {
                progressTrack.innerHTML = ''; // Empty state
            } else {
                progressTrack.innerHTML = sortedCats.map(c => {
                    const segPct = (catTotalsBase[c] / budget) * 100;
                    const isLeak = overlapCats.includes(c);
                    const leakClass = isLeak ? 'budget-progress-segment--leak' : '';
                    return `<div class="budget-progress-segment ${leakClass}" style="width: ${segPct}%; min-width: 2px;"></div>`;
                }).join('');
            }
        }

        // Render Category Table
        const catList = document.getElementById('budget-category-list');
        if (catList) {
            if (sortedCats.length === 0) {
                catList.innerHTML = `<div class="budget-empty-state">No subscriptions added yet.</div>`;
            } else {
                catList.innerHTML = sortedCats.map(c => {
                    const costBase = catTotalsBase[c];
                    let catPct = 0;
                    if (budget > 0) catPct = (costBase / budget) * 100;
                    
                    const isLeak = overlapCats.includes(c);
                    const iconInfo = getIconForCategory(c);
                    
                    const rowClass = isLeak ? 'budget-row budget-row--leak' : 'budget-row';
                    
                    return `
                        <div class="${rowClass}">
                            <div class="budget-row-cat">
                                <div class="budget-cat-name">
                                    <span class="material-symbols-outlined budget-cat-icon">${iconInfo.icon}</span>
                                    ${c}
                                    ${isLeak ? '<span class="budget-leak-tag"><span class="material-symbols-outlined budget-leak-tag-icon">warning</span> LEAK</span>' : ''}
                                </div>
                            </div>
                            <div class="budget-row-spend">
                                <div class="budget-row-spend-bar-bg">
                                    <div class="budget-row-spend-bar-fill" style="width: ${Math.min(catPct, 100)}%;"></div>
                                </div>
                                <span class="budget-row-spend-pct">${catPct.toFixed(0)}%</span>
                            </div>
                            <div class="budget-row-cost">
                                <span class="budget-row-cost-val">${window.formatMoney(costBase)}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    };

    // Save Button Handler
    const saveBtn = document.getElementById('budget-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const inputEl = document.getElementById('budget-input');
            const { rate } = getCurrencyState();
            if (inputEl.value) {
                const monthlyInputLocal = parseFloat(inputEl.value);
                const monthlyInputBase = monthlyInputLocal / rate;
                localStorage.setItem('essara_budget_' + session.id, monthlyInputBase.toString());
                
                // Show brief success state on button
                const origHtml = saveBtn.innerHTML;
                saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">check</span> Saved';
                setTimeout(() => {
                    saveBtn.innerHTML = origHtml;
                }, 1500);

                renderBudgetPage();
            }
        });
    }

    // Initial render
    renderBudgetPage();

    // Hook into the global reload function so it re-renders on currency change
    const origReload = window.reloadDashboardData;
    window.reloadDashboardData = () => {
        if (typeof origReload === 'function') origReload();
        renderBudgetPage();
    };

    // Fallback: direct listener on currency select
    const currSel = document.getElementById('currency-select');
    if (currSel) {
        currSel.addEventListener('change', () => {
            setTimeout(renderBudgetPage, 10);
        });
    }

});
