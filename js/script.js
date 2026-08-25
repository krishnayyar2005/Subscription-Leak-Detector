// Apply theme immediately to avoid flash of wrong theme as much as possible
(function() {
    try {
        var theme = localStorage.getItem('essara_theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Theme Toggle
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? (document.getElementById('theme-icon') || themeToggleBtn.querySelector('.material-symbols-outlined')) : null;
    const htmlElement = document.documentElement;

    // Set initial icon based on current class
    if (themeIcon) {
        themeIcon.textContent = htmlElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
    }

    if (themeToggleBtn && !themeToggleBtn._essaraThemeBound) {
        themeToggleBtn._essaraThemeBound = true;
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            const isDark = htmlElement.classList.contains('dark');
            localStorage.setItem('essara_theme', isDark ? 'dark' : 'light');
            if (themeIcon) themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
        });
    }

    // ==========================================
    // Mobile Menu
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
            if (mobileMenu.classList.contains('active')) {
                if (icon) icon.textContent = 'close';
            } else {
                if (icon) icon.textContent = 'menu';
            }
        });
    }

    // ==========================================
    // Smooth Scrolling
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    const menuIcon = mobileMenuBtn.querySelector('.material-symbols-outlined');
                    if (menuIcon) menuIcon.textContent = 'menu';
                }

                // Scroll to target with offset for fixed navbar
                const headerOffset = 64; // height of navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Entrance Animations (Intersection Observer)
    // ==========================================
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: stop observing once animated
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // Authentication (Login / Signup)
    // ==========================================
    const loginForm = document.getElementById('form-login');
    const signupForm = document.getElementById('form-signup');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const errorBanner = document.getElementById('error-banner');
    const errorMessage = document.getElementById('error-message');

    // 1. Session Check & Route Guard
    const sessionData = localStorage.getItem('essara_session');
    const currentPath = window.location.pathname;
    const isLogin = currentPath.endsWith('login.html');
    const isLanding = currentPath.endsWith('index.html') || (currentPath.endsWith('/') && !currentPath.includes('dashboard'));

    if (sessionData) {
        // If logged in and on login page, redirect to dashboard
        if (isLogin && loginForm) {
            document.body.innerHTML = '<div class="auth-main"><div class="text-center"><span class="material-symbols-outlined font-display text-primary animate-fade-in" style="font-size:48px; font-variation-settings: \'FILL\' 1;">sync</span><h2 class="font-headline mt-4">Redirecting to Dashboard...</h2></div></div>';
            setTimeout(() => {
                window.location.href = 'dashboard 2/dashboard.html';
            }, 800);
            return; // stop executing further auth logic
        }
    } else {
        // If NOT logged in, and NOT on an unprotected page (login/landing), block access
        if (!isLogin && !isLanding) {
            // Protected pages are 1 level deep
            window.location.replace('../login.html');
            return;
        }
    }

    // 1.5 Profile Dropdown & Logout Logic
    const profileContainer = document.getElementById('profile-menu-container');
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameEl = document.getElementById('user-display-name');
    const userEmailEl = document.getElementById('user-display-email');

    // Populate user data in the dropdown
    if (sessionData && userNameEl && userEmailEl) {
        try {
            const user = JSON.parse(sessionData);
            userNameEl.textContent = user.name || 'User';
            userEmailEl.textContent = user.email || '';
        } catch(e) {}
    }

    // 2. Tab Switching Logic
    if (loginForm && signupForm && tabLogin && tabSignup) {
        const switchTab = (tab) => {
            errorBanner.classList.add('hidden');
            
            // clear inputs and errors
            document.querySelectorAll('.form-input').forEach(input => {
                input.value = '';
                input.classList.remove('has-error');
            });

            if (tab === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
                
                tabLogin.classList.add('auth-tab-active');
                tabLogin.classList.remove('auth-tab-inactive');
                tabSignup.classList.add('auth-tab-inactive');
                tabSignup.classList.remove('auth-tab-active');
                
                // Update URL hash without jumping
                history.pushState("", document.title, window.location.pathname + window.location.search);
            } else {
                signupForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
                
                tabSignup.classList.add('auth-tab-active');
                tabSignup.classList.remove('auth-tab-inactive');
                tabLogin.classList.add('auth-tab-inactive');
                tabLogin.classList.remove('auth-tab-active');

                // Update URL hash
                window.location.hash = 'signup';
            }
        };

        tabLogin.addEventListener('click', () => switchTab('login'));
        tabSignup.addEventListener('click', () => switchTab('signup'));

        // Handle direct URL hash loading
        if (window.location.hash === '#signup') {
            switchTab('signup');
        }

        // 3. Form Validation & Submission
        const showError = (msg) => {
            errorMessage.textContent = msg;
            errorBanner.classList.remove('hidden');
        };

        const clearErrors = () => {
            errorBanner.classList.add('hidden');
            document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
        };

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();
            
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');
            const email = emailInput.value.trim();
            const password = passInput.value;

            if (!email) {
                emailInput.classList.add('has-error');
                showError('Email is required.');
                return;
            }
            if (!password) {
                passInput.classList.add('has-error');
                showError('Password is required.');
                return;
            }

            // User login validation
            const users = JSON.parse(localStorage.getItem('essara_users')) || [];
            const userMatch = users.find(u => u.email === email && u.password === password);

            if (userMatch) {
                localStorage.setItem('essara_session', JSON.stringify({ id: userMatch.id, email: userMatch.email, name: userMatch.name }));
                window.location.reload(); // Will trigger the session check and redirect
            } else {
                showError('Invalid email or password.');
            }
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();
            
            const nameInput = document.getElementById('signup-name');
            const emailInput = document.getElementById('signup-email');
            const passInput = document.getElementById('signup-password');
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passInput.value;

            let hasError = false;

            if (!name) { nameInput.classList.add('has-error'); hasError = true; }
            if (!email || !email.includes('@')) { emailInput.classList.add('has-error'); hasError = true; }
            if (password.length < 4) { passInput.classList.add('has-error'); hasError = true; }

            if (hasError) {
                showError('Please fix the errors highlighted below.');
                if (password.length > 0 && password.length < 4) {
                    showError('Password must be at least 4 characters long.');
                }
                return;
            }

            // Actual Existing Email Check
            const users = JSON.parse(localStorage.getItem('essara_users')) || [];
            if (users.find(u => u.email === email)) {
                showError('An account with this email already exists.');
                emailInput.classList.add('has-error');
                return;
            }

            // Success
            const newUser = { id: Date.now().toString(), name: name, email: email, password: password };
            users.push(newUser);
            localStorage.setItem('essara_users', JSON.stringify(users));
            window.location.href = 'login.html';
        });
    }

    // ==========================================
    // Dashboard SPA Logic
    // ==========================================
    const dashboardNav = document.getElementById('dashboard-nav') || document.getElementById('topnav');
    if (dashboardNav) {
        // 1. Auth Guard
        const session = JSON.parse(localStorage.getItem('essara_session'));
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        // 2. State Management
        let subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];
        const savedBudgetRaw = localStorage.getItem('essara_budget_' + session.id);
        let budget = savedBudgetRaw ? parseFloat(savedBudgetRaw) : null;
        let currentCurrency = localStorage.getItem('essara_currency') || 'USD';
        
        const currencyRates = { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'INR': 83.00 };
        const currencySymbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹' };

        const saveSubs = () => localStorage.setItem('essara_subscriptions_' + session.id, JSON.stringify(subs));
        const saveBudget = () => localStorage.setItem('essara_budget_' + session.id, budget.toString());

        // 3. Core Helpers
        const normalizeCost = (cost, cycle) => {
            const c = parseFloat(cost);
            if (cycle === 'Weekly') return c * 4.345;
            if (cycle === 'Yearly') return c / 12;
            return c; // Monthly
        };

        const formatMoney = (amount) => {
            const converted = amount * currencyRates[currentCurrency];
            return currencySymbols[currentCurrency] + converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        };

        const getOverlaps = () => {
            const categories = {};
            subs.forEach(s => {
                if (!categories[s.category]) categories[s.category] = [];
                categories[s.category].push(s);
            });
            const overlaps = [];
            let totalLeak = 0;
            
            Object.keys(categories).forEach(cat => {
                const items = categories[cat];
                if (items.length > 1) {
                    // Sort descending by normalized cost
                    items.sort((a, b) => normalizeCost(b.cost, b.cycle) - normalizeCost(a.cost, a.cycle));
                    const leak = items.slice(1).reduce((sum, item) => sum + normalizeCost(item.cost, item.cycle), 0);
                    overlaps.push({ category: cat, items: items, leak: leak });
                    totalLeak += leak;
                }
            });
            return { overlaps, totalLeak };
        };

        const getMonthlyTotal = () => subs.reduce((sum, s) => sum + normalizeCost(s.cost, s.cycle), 0);

        // 4. Tab Routing
        // Removed: Navigation is now handled natively via multi-page HTML links

        // 5. Render Functions
        const renderDashboard = () => {
            if (document.getElementById('stat-active-subs')) renderOverview();
            if (document.getElementById('subscriptions-list-container')) renderSubscriptions();
            if (document.getElementById('overlaps-list-container')) renderOverlaps();
            if (document.getElementById('view-reports')) renderReports();
            if (document.getElementById('budget-current-spend')) renderBudget();
            if (document.getElementById('view-calendar')) renderCalendar();
        };

        const renderOverview = () => {
            const monthlyTotal = getMonthlyTotal();
            const { overlaps, totalLeak } = getOverlaps();
            
            const activeSubsEl = document.getElementById('stat-active-subs');
            if (!activeSubsEl) return;
            
            activeSubsEl.textContent = subs.length;
            document.getElementById('stat-monthly-spend').textContent = formatMoney(monthlyTotal);
            document.getElementById('stat-annual-approx').textContent = '≈ ' + formatMoney(monthlyTotal * 12) + '/yr';
            
            document.getElementById('stat-projected-leak').textContent = formatMoney(totalLeak * 12);
            
            const budgetStatusEl = document.getElementById('stat-budget-status');
            const budgetTextEl = document.getElementById('stat-budget-text');
            if (budgetStatusEl && budgetTextEl) {
                if (budget === null) {
                    budgetStatusEl.textContent = 'Not set';
                    budgetStatusEl.className = 'stat-card__value stat-card__value--mono';
                    budgetTextEl.textContent = 'Click to set monthly budget';
                    budgetTextEl.className = 'stat-card__change';
                } else {
                    const yearlyBudget = budget * 12;
                    const yearlySpend = monthlyTotal * 12;
                    const remaining = yearlyBudget - yearlySpend;
                    budgetStatusEl.textContent = formatMoney(remaining);
                    
                    if (remaining < 0) {
                        budgetStatusEl.className = 'stat-card__value stat-card__value--mono stat-card__value--error';
                        budgetTextEl.className = 'stat-card__change stat-card__change--error';
                        budgetTextEl.textContent = 'Over budget';
                    } else {
                        budgetStatusEl.className = 'stat-card__value stat-card__value--mono';
                        budgetTextEl.className = 'stat-card__change stat-card__change--success';
                        budgetTextEl.textContent = 'Remaining this year';
                    }
                }
            }

            // Leak Tide Update
            const leakTidePctEl = document.getElementById('leak-tide-percentage');
            if (leakTidePctEl) {
                let leakPct = 0;
                if (monthlyTotal > 0) {
                    leakPct = Math.round((totalLeak / monthlyTotal) * 100);
                }
                leakTidePctEl.textContent = `${leakPct}%`;
                
                const waveFillEl = document.getElementById('leak-tide-fill');
                if (waveFillEl) {
                    waveFillEl.style.height = `${leakPct}%`;
                }
                
                const leakAmountEl = document.getElementById('leak-tide-amount');
                if (leakAmountEl) {
                    leakAmountEl.textContent = formatMoney(totalLeak);
                }
            }

            const overviewOverlaps = document.getElementById('dashboard-overlaps-container');
            overviewOverlaps.innerHTML = overlaps.slice(0, 2).map(o => `
                <div class="border border-outline-variant rounded p-md bg-surface" style="padding: 16px; border: 1px solid var(--outline-variant); border-radius: var(--radius-md); margin-bottom: 8px;">
                    <div class="flex-between mb-sm" style="display: flex; justify-content: space-between;">
                        <span class="font-label-caps text-on-surface-variant">Category: ${o.category}</span>
                        <span class="bg-error-container text-error font-label-caps px-2 py-1 rounded">Leak: ${formatMoney(o.leak)}/mo</span>
                    </div>
                </div>
            `).join('') || '<p style="padding: 16px; color: var(--on-surface-variant); font-size: 14px;">No overlaps yet.</p>';

            // Upcoming
            const today = new Date();
            const upcoming = subs.map(s => {
                const date = new Date(s.date);
                if (date < today) date.setMonth(date.getMonth() + 1); // rough Next Billing Date
                const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
                return { ...s, diffDays };
            }).filter(s => s.diffDays >= 0).sort((a, b) => a.diffDays - b.diffDays).slice(0, 3);
            
            document.getElementById('dashboard-upcoming-container').innerHTML = upcoming.map(s => `
                <li class="upcoming-item">
                    <div class="upcoming-item__left">
                        <div class="upcoming-item__dot ${s.diffDays <= 3 ? 'upcoming-item__dot--urgent' : 'upcoming-item__dot--ok'}"></div>
                        <div class="upcoming-item__info">
                            <p class="upcoming-item__name">${s.name}</p>
                            <p class="upcoming-item__time">${s.diffDays === 0 ? 'Today' : 'In ' + s.diffDays + ' days'}</p>
                        </div>
                    </div>
                    <span class="upcoming-item__cost">${formatMoney(s.cost)}</span>
                </li>
            `).join('') || '<p style="padding: 16px; color: var(--on-surface-variant); font-size: 14px;">No upcoming renewals.</p>';
        };

        const renderSubscriptions = (filter = 'All', searchQuery = '') => {
            const list = document.getElementById('subscriptions-list-container');
            let filtered = subs.filter(s => filter === 'All' || s.category === filter);
            if (searchQuery) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

            list.innerHTML = filtered.map((s, index) => {
                const isRedundant = getOverlaps().overlaps.find(o => o.category === s.category && o.items[0].id !== s.id);
                return `<tr class="data-table-row">
                    <td>
                        <div class="sub-item">
                            <div class="sub-icon">
                                <span class="material-symbols-outlined text-primary">category</span>
                            </div>
                            <div class="sub-details">
                                <span class="sub-name">${s.name}</span>
                                <div class="sub-tags">
                                    <span class="tag tag--neutral">${s.category}</span>
                                    ${isRedundant ? `<span class="tag tag--error"><span class="material-symbols-outlined tag-icon">warning</span> Redundant</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>${s.cycle}</td>
                    <td>${s.date}</td>
                    <td class="text-right font-mono text-on-surface">${formatMoney(normalizeCost(s.cost, s.cycle))}</td>
                    <td class="text-center">
                        <div class="action-btns">
                            <button class="icon-action-btn icon-action-btn--delete" onclick="window.deleteSub('${s.id}')"><span class="material-symbols-outlined">delete</span></button>
                        </div>
                    </td>
                </tr>`;
            }).join('') || `<tr><td colspan="5" class="text-center font-body text-on-surface-variant p-4">${filter !== 'All' || searchQuery ? 'No subscriptions match the current filter.' : 'No subscriptions added yet.'}</td></tr>`;
            
            // Build dynamic filters
            const cats = ['All', ...new Set(subs.map(s => s.category))];
            const filterContainer = document.getElementById('sub-filters');
            if (filterContainer) {
                filterContainer.innerHTML = cats.map(c => `
                    <button class="pill ${filter === c ? 'active' : ''}" onclick="window.filterSubs('${c}')">${c}</button>
                `).join('');
            }
        };

        const renderOverlaps = () => {
            const { overlaps, totalLeak } = getOverlaps();
            document.getElementById('stat-total-leak').textContent = formatMoney(totalLeak * 12);
            document.getElementById('stat-active-groups').textContent = overlaps.length;
            document.getElementById('stat-savings-target').textContent = formatMoney(totalLeak * 12 * 0.8); // 80% goal

            document.getElementById('overlaps-list-container').innerHTML = overlaps.map(o => `
                <div class="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                    <div class="bg-surface-container-low p-4 border-b border-outline-variant flex justify-between items-center flex-wrap gap-4">
                        <div class="flex items-center gap-3">
                            <div class="bg-surface-variant text-primary p-2 rounded-full">
                                <span class="material-symbols-outlined">design_services</span>
                            </div>
                            <div>
                                <h2 class="font-headline-md text-headline-md text-on-surface">${o.category}</h2>
                                <p class="font-body-sm text-body-sm text-on-surface-variant">${o.items.length} active subscriptions</p>
                            </div>
                        </div>
                        <div class="flex gap-6 text-right">
                            <div>
                                <p class="font-label-caps text-label-caps text-on-surface-variant">Combined Monthly</p>
                                <p class="font-data-mono text-data-mono text-on-surface">${formatMoney(o.items.reduce((s,i) => s+normalizeCost(i.cost,i.cycle), 0))}</p>
                            </div>
                            <div class="bg-error-10 px-3 py-1 rounded flex flex-col justify-center border border-error-20">
                                <p class="font-label-caps text-label-caps text-error">Projected Leak</p>
                                <p class="font-data-mono text-data-mono text-error font-bold">${formatMoney(o.leak * 12)}/yr</p>
                            </div>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface border-b border-outline-variant text-on-surface-variant">
                                    <th class="py-3 px-4 font-label-caps text-label-caps font-semibold">Service</th>
                                    <th class="py-3 px-4 font-label-caps text-label-caps font-semibold">Billing Cycle</th>
                                    <th class="py-3 px-4 font-label-caps text-label-caps font-semibold">Next Renewal</th>
                                    <th class="py-3 px-4 font-label-caps text-label-caps font-semibold text-right">Monthly Eq. Cost</th>
                                    <th class="py-3 px-4 font-label-caps text-label-caps font-semibold text-center">Status Recommendation</th>
                                    <th class="py-3 px-4 font-label-caps text-label-caps font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-outline-variant">
                                ${o.items.map((item, idx) => `
                                    <tr class="transition-colors ${idx !== 0 ? 'bg-error-5 hover:bg-error-10' : 'hover-bg-surface-container-lowest'}">
                                        <td class="py-3 px-4">
                                            <div class="flex items-center gap-2">
                                                <div class="w-6 h-6 rounded bg-surface-variant flex items-center justify-center font-display text-xs font-bold ${idx !== 0 ? 'text-error' : 'text-primary'}">${item.name.charAt(0)}</div>
                                                <span class="font-body-sm text-body-sm font-semibold">${item.name}</span>
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 font-body-sm text-body-sm">${item.cycle}</td>
                                        <td class="py-3 px-4 font-body-sm text-body-sm">${item.date}</td>
                                        <td class="py-3 px-4 font-data-mono text-data-mono text-right">${formatMoney(normalizeCost(item.cost, item.cycle))}</td>
                                        <td class="py-3 px-4 text-center">
                                            ${idx === 0 ? '<span class="inline-flex items-center gap-1 bg-secondary-10 text-secondary border border-secondary-20 px-2 py-1 rounded text-xs font-semibold"><span class="material-symbols-outlined text-14px">check_circle</span> Keep</span>' : '<span class="inline-flex items-center gap-1 bg-error-10 text-error border border-error-20 px-2 py-1 rounded text-xs font-semibold"><span class="material-symbols-outlined text-14px">warning</span> Redundant</span>'}
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <button class="text-on-surface-variant hover-text-primary transition-colors" onclick="window.deleteSub('${item.id}')">
                                                <span class="material-symbols-outlined text-18px">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('') || '<div class="p-4 text-center font-body text-on-surface-variant">No overlaps yet.</div>';
        };

        const renderReports = () => {
            const cats = {};
            subs.forEach(s => {
                if (!cats[s.category]) cats[s.category] = { count: 0, cost: 0 };
                cats[s.category].count++;
                cats[s.category].cost += normalizeCost(s.cost, s.cycle);
            });
            const { overlaps } = getOverlaps();
            const overlapCats = overlaps.map(o => o.category);

            document.getElementById('reports-table-body').innerHTML = Object.keys(cats).map(c => `
                <tr class="data-table-row">
                    <td class="py-4 px-4 font-medium">${c}</td>
                    <td class="py-4 px-4 text-center font-mono">${cats[c].count}</td>
                    <td class="py-4 px-4 text-right font-mono">${formatMoney(cats[c].cost)}</td>
                    <td class="py-4 px-4 text-right font-mono text-on-surface-variant">${formatMoney(cats[c].cost * 12)}</td>
                    <td class="py-4 px-4 text-center">
                        ${overlapCats.includes(c) ? '<span class="bg-error-container text-error font-label-caps px-2 py-1 rounded">Overlap</span>' : '<span class="bg-secondary-bg text-secondary font-label-caps px-2 py-1 rounded">Healthy</span>'}
                    </td>
                </tr>
            `).join('');

            const total = getMonthlyTotal();
            document.getElementById('reports-monthly-total').textContent = formatMoney(total);
            document.getElementById('reports-annual-total').textContent = formatMoney(total * 12);
        };

        const renderBudget = () => {
            const total = getMonthlyTotal();
            const pct = Math.min((total / budget) * 100, 100);
            
            document.getElementById('budget-current-spend').textContent = formatMoney(total);
            document.getElementById('budget-goal-display').textContent = formatMoney(budget);
            document.getElementById('budget-remaining-display').textContent = formatMoney(Math.max(budget - total, 0));
            
            document.getElementById('budget-percentage').textContent = pct.toFixed(1) + '%';
            document.getElementById('budget-progress-bar').style.width = pct + '%';
            document.getElementById('budget-progress-bar').style.backgroundColor = pct > 90 ? 'var(--error)' : 'var(--primary)';
            
            const cats = {};
            subs.forEach(s => {
                const norm = normalizeCost(s.cost, s.cycle);
                cats[s.category] = (cats[s.category] || 0) + norm;
            });

            document.getElementById('budget-categories-container').innerHTML = Object.keys(cats).sort((a,b) => cats[b]-cats[a]).map(c => {
                const catPct = (cats[c] / budget) * 100;
                return `
                <div class="grid-12-cols gap-4 p-4 data-table-row items-center">
                    <div class="col-span-3 font-body font-medium">${c}</div>
                    <div class="col-span-6 flex items-center gap-4">
                        <div class="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
                            <div class="h-full bg-primary" style="width: ${Math.min(catPct, 100)}%;"></div>
                        </div>
                        <span class="font-label-caps text-on-surface-variant w-10 text-right">${catPct.toFixed(1)}%</span>
                    </div>
                    <div class="col-span-3 font-mono text-right">${formatMoney(cats[c])}</div>
                </div>
            `}).join('');
        };

        const renderCalendar = () => {
            const today = new Date();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            document.getElementById('cal-month').textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            const grid = document.getElementById('calendar-grid');
            let html = '';
            for(let i=1; i<=daysInMonth; i++) {
                const daySubs = subs.filter(s => parseInt(s.date.split('-')[2]) === i);
                const isToday = today.getDate() === i;
                html += `
                    <div class="bg-surface-container-lowest min-h-[100px] p-2 ${isToday ? 'bg-surface-variant' : ''}">
                        <span class="font-body font-medium ${isToday ? 'text-primary' : 'text-on-surface'}">${i} ${isToday ? '(Today)' : ''}</span>
                        ${daySubs.map(s => `<div class="mt-1 bg-primary text-on-primary rounded px-1 py-0.5 text-xs font-medium truncate">${s.name}</div>`).join('')}
                    </div>
                `;
            }
            grid.innerHTML = html;

            const upcoming = subs.map(s => {
                const date = new Date(today.getFullYear(), today.getMonth(), parseInt(s.date.split('-')[2]));
                if (date < today) date.setMonth(date.getMonth() + 1);
                const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
                return { ...s, diff };
            }).sort((a,b) => a.diff - b.diff).slice(0, 5);

            document.getElementById('cal-upcoming-list').innerHTML = upcoming.map(s => `
                <div class="flex-between p-2 border-b border-outline-variant">
                    <div>
                        <h3 class="font-body font-medium">${s.name}</h3>
                        <p class="font-label-caps ${s.diff <= 3 ? 'text-error' : 'text-on-surface-variant'}">${s.diff === 0 ? 'Today' : 'In ' + s.diff + ' days'}</p>
                    </div>
                    <p class="font-mono font-medium">${formatMoney(s.cost)}</p>
                </div>
            `).join('');
        };

        // Window exposed methods for inline listeners
        let currentFilter = 'All';

        // Helper to get the current search query from whichever search input exists
        const getSearchQuery = () => {
            const el = document.getElementById('sub-search') || document.querySelector('.form-input--search');
            return el ? el.value : '';
        };

        window.filterSubs = (cat) => { currentFilter = cat; renderSubscriptions(cat, getSearchQuery()); };
        window.reloadDashboardData = () => {
            subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];
            renderDashboard();
        };
        
        window.deleteSub = (id) => {
            const sub = subs.find(s => s.id === id);
            if (!sub) return;
            if (confirm(`Are you sure you want to delete ${sub.name}?`)) {
                subs = subs.filter(s => s.id !== id);
                saveSubs();
                renderDashboard();
            }
        };

        const subSearch = document.getElementById('sub-search') || document.querySelector('.form-input--search');
        if (subSearch) subSearch.addEventListener('input', (e) => renderSubscriptions(currentFilter, e.target.value));

        // Wire up the static .filter-chips .chip buttons (All / Video / Music)
        const filterChips = document.querySelectorAll('.filter-chips .chip');
        if (filterChips.length > 0) {
            filterChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    // Map button label to the stored category value
                    const label = chip.textContent.trim();
                    const categoryMap = { 'All': 'All', 'Video': 'Video', 'Music': 'Music' };
                    const filterValue = categoryMap[label] || label;

                    currentFilter = filterValue;

                    // Update active chip styling
                    filterChips.forEach(c => c.classList.remove('chip--active'));
                    chip.classList.add('chip--active');

                    renderSubscriptions(currentFilter, getSearchQuery());
                });
            });
        }
        const currSel = document.getElementById('currency-select') || document.getElementById('currency-selector');
        const costSymbolEl = document.getElementById('cost-currency-symbol');
        const budgetSymbolEl = document.getElementById('budget-popover-symbol');
        const budgetInputSymbolEl = document.getElementById('budget-input-symbol');
        
        if (costSymbolEl) costSymbolEl.textContent = currencySymbols[currentCurrency];
        if (budgetSymbolEl) budgetSymbolEl.textContent = currencySymbols[currentCurrency];
        if (budgetInputSymbolEl) budgetInputSymbolEl.textContent = currencySymbols[currentCurrency];
        
        if (currSel) {
            currSel.value = currentCurrency;
            currSel.addEventListener('change', (e) => {
                currentCurrency = e.target.value;
                localStorage.setItem('essara_currency', currentCurrency);
                if (costSymbolEl) costSymbolEl.textContent = currencySymbols[currentCurrency];
                if (budgetSymbolEl) budgetSymbolEl.textContent = currencySymbols[currentCurrency];
                if (budgetInputSymbolEl) budgetInputSymbolEl.textContent = currencySymbols[currentCurrency];
                renderDashboard();
            });
        }
        
        const budgetCard = document.getElementById('budget-status-card');
        const budgetPopover = document.getElementById('budget-popover');
        if (budgetCard && budgetPopover) {
            const input = document.getElementById('budget-popover-input');
            const saveBtn = document.getElementById('budget-popover-save');
            
            budgetCard.addEventListener('click', (e) => {
                // If clicking inside the popover itself (like input/save), do nothing
                if (budgetPopover.contains(e.target)) return;
                
                const isHidden = budgetPopover.style.display === 'none';
                if (isHidden) {
                    budgetPopover.style.display = 'block';
                    const rate = currencyRates[currentCurrency] || 1;
                    input.value = budget !== null ? (budget * rate).toFixed(2) : '';
                } else {
                    budgetPopover.style.display = 'none';
                }
            });
            
            saveBtn.addEventListener('click', () => {
                const rawVal = parseFloat(input.value);
                if (!isNaN(rawVal) && rawVal >= 0) {
                    const rate = currencyRates[currentCurrency] || 1;
                    budget = rawVal / rate;
                    saveBudget();
                    renderDashboard();
                }
                budgetPopover.style.display = 'none';
            });
            
            document.addEventListener('click', (e) => {
                if (!budgetCard.contains(e.target) && budgetPopover.style.display === 'block') {
                    budgetPopover.style.display = 'none';
                }
            });
        }
        
        const logoutBtnEl = document.getElementById('logout-btn');
        if (logoutBtnEl) logoutBtnEl.addEventListener('click', () => { localStorage.removeItem('essara_session'); window.location.href = 'login.html'; });

        // Add Sub Form & Modal Flow
        const subMethod = document.getElementById('sub-method');
        if (subMethod) {
            const cardContainer = document.getElementById('card-digits-container');
            const cardInput = document.getElementById('sub-last4');
            subMethod.addEventListener('change', (e) => {
                if (e.target.value === 'cc' || e.target.value === 'dc') { cardContainer.classList.remove('hidden'); cardInput.required = true; }
                else { cardContainer.classList.add('hidden'); cardInput.required = false; }
            });

            const payModal = document.getElementById('payment-modal');
            const form = document.getElementById('subscription-form');
            let tempSubData = null;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const rawCost = document.getElementById('sub-cost').value;
                const rate = currencyRates[currentCurrency] || 1;
                const baseCost = parseFloat(rawCost) / rate;

                tempSubData = {
                    id: Date.now().toString(),
                    name: document.getElementById('sub-name').value,
                    category: document.getElementById('sub-category').value,
                    cost: baseCost,
                    cycle: document.getElementById('sub-cycle').value,
                    date: document.getElementById('sub-date').value,
                    method: document.getElementById('sub-method').value,
                    last4: document.getElementById('sub-last4').value
                };
                document.getElementById('step-pin').classList.remove('hidden');
                document.getElementById('step-processing').classList.add('hidden');
                document.getElementById('step-success').classList.add('hidden');
                payModal.classList.remove('hidden');
            });

            document.getElementById('close-payment-modal').addEventListener('click', () => payModal.classList.add('hidden'));
            document.getElementById('submit-pin').addEventListener('click', () => {
                document.getElementById('step-pin').classList.add('hidden');
                document.getElementById('step-processing').classList.remove('hidden');
                setTimeout(() => {
                    document.getElementById('step-processing').classList.add('hidden');
                    document.getElementById('step-success').classList.remove('hidden');
                    subs.push(tempSubData);
                    saveSubs();
                    renderDashboard();
                    setTimeout(() => { payModal.classList.add('hidden'); form.reset(); }, 1500);
                }, 1000);
            });
        }

        const budgetForm = document.getElementById('budget-form');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const rawBudget = parseFloat(document.getElementById('budget-input').value);
                const rate = currencyRates[currentCurrency] || 1;
                budget = rawBudget / rate;
                saveBudget();
                renderDashboard();
            });
        }

        // New users start with an empty slate
        if (subs.length === 0) {
            saveSubs();
        }

        // Expose shared formatMoney for external pages (like Calendar, Budget)
        window.formatMoney = formatMoney;
        window.getCurrencyRate = () => currencyRates[currentCurrency];

        renderDashboard();
    }
});
