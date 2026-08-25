/* ================================================================
   ESSARA Admin — admin.js
   Handles: Admin authentication, platform-wide stats, user
   management (list, add, delete), search/filter, and currency.
   Reuses the same localStorage data model as the main app:
     - essara_users (array of user objects)
     - essara_subscriptions_{userId} (per-user subscription array)
     - essara_budget_{userId} (per-user budget number)
   ================================================================ */

(function () {
    'use strict';

    // ==========================================
    // Constants
    // ==========================================
    var ADMIN_EMAIL = 'admin@essara.com';
    var ADMIN_PASSWORD = 'admin123';
    var SESSION_KEY = 'essara_admin_session';

    var CURRENCY_RATES = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.00 };
    var CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    var AVATAR_COLORS = ['blue', 'teal', 'amber', 'rose', 'violet', 'emerald'];

    // ==========================================
    // Admin Login Page Logic
    // ==========================================
    var adminLoginForm = document.getElementById('form-admin-login');
    if (adminLoginForm) {
        // If already logged in as admin, redirect to dashboard
        if (localStorage.getItem(SESSION_KEY)) {
            window.location.href = 'admin-dashboard.html';
            return;
        }

        adminLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var emailInput = document.getElementById('admin-login-email');
            var passInput = document.getElementById('admin-login-password');
            var errorBanner = document.getElementById('admin-error-banner');
            var errorMessage = document.getElementById('admin-error-message');

            var email = emailInput.value.trim();
            var password = passInput.value;

            // Clear previous errors
            errorBanner.classList.add('hidden');
            emailInput.classList.remove('has-error');
            passInput.classList.remove('has-error');

            if (!email) {
                emailInput.classList.add('has-error');
                errorMessage.textContent = 'Email is required.';
                errorBanner.classList.remove('hidden');
                return;
            }
            if (!password) {
                passInput.classList.add('has-error');
                errorMessage.textContent = 'Password is required.';
                errorBanner.classList.remove('hidden');
                return;
            }

            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                localStorage.setItem(SESSION_KEY, JSON.stringify({ email: ADMIN_EMAIL, role: 'admin' }));
                window.location.href = 'admin-dashboard.html';
            } else {
                errorMessage.textContent = 'Invalid admin credentials.';
                errorBanner.classList.remove('hidden');
            }
        });

        return; // Stop — login page only needs this logic
    }

    // ==========================================
    // Admin Dashboard Page Logic
    // ==========================================
    var statsGrid = document.getElementById('admin-stats-grid');
    if (!statsGrid) return; // Not on admin dashboard page

    // --- Route Guard ---
    if (!localStorage.getItem(SESSION_KEY)) {
        window.location.replace('admin-login.html');
        return;
    }

    // --- State ---
    var currentCurrency = localStorage.getItem('essara_currency') || 'USD';
    var searchQuery = '';
    var pendingDeleteId = null;

    // --- Core Helpers (mirrored from main script.js) ---
    function normalizeCost(cost, cycle) {
        var c = parseFloat(cost);
        if (cycle === 'Weekly') return c * 4.345;
        if (cycle === 'Yearly') return c / 12;
        return c; // Monthly
    }

    function formatMoney(amount) {
        var converted = amount * CURRENCY_RATES[currentCurrency];
        return CURRENCY_SYMBOLS[currentCurrency] + converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function getOverlapsForUser(subs) {
        var categories = {};
        subs.forEach(function (s) {
            if (!categories[s.category]) categories[s.category] = [];
            categories[s.category].push(s);
        });
        var totalLeak = 0;
        Object.keys(categories).forEach(function (cat) {
            var items = categories[cat];
            if (items.length > 1) {
                items.sort(function (a, b) {
                    return normalizeCost(b.cost, b.cycle) - normalizeCost(a.cost, a.cycle);
                });
                totalLeak += items.slice(1).reduce(function (sum, item) {
                    return sum + normalizeCost(item.cost, item.cycle);
                }, 0);
            }
        });
        return totalLeak;
    }

    function getAvatarColor(index) {
        return AVATAR_COLORS[index % AVATAR_COLORS.length];
    }

    function getInitials(name) {
        if (!name) return '?';
        var parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    }

    // --- Data Loading ---
    function loadAllUsers() {
        return JSON.parse(localStorage.getItem('essara_users')) || [];
    }

    function loadUserSubs(userId) {
        return JSON.parse(localStorage.getItem('essara_subscriptions_' + userId)) || [];
    }

    function computeUserData(users) {
        return users.map(function (user, index) {
            var subs = loadUserSubs(user.id);
            var monthlySpend = subs.reduce(function (sum, s) {
                return sum + normalizeCost(s.cost, s.cycle);
            }, 0);
            var annualLeak = getOverlapsForUser(subs) * 12;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                subsCount: subs.length,
                monthlySpend: monthlySpend,
                annualLeak: annualLeak,
                avatarColor: getAvatarColor(index),
                initials: getInitials(user.name)
            };
        });
    }

    // --- Render: Stats Cards ---
    function renderStats(userData) {
        var totalUsers = userData.length;
        var totalSubs = userData.reduce(function (s, u) { return s + u.subsCount; }, 0);
        var totalMonthly = userData.reduce(function (s, u) { return s + u.monthlySpend; }, 0);
        var totalLeak = userData.reduce(function (s, u) { return s + u.annualLeak; }, 0);

        document.getElementById('admin-stat-users').textContent = totalUsers.toLocaleString();
        document.getElementById('admin-stat-subs').textContent = totalSubs.toLocaleString();
        document.getElementById('admin-stat-spend').textContent = formatMoney(totalMonthly);
        document.getElementById('admin-stat-annual').textContent = '≈ ' + formatMoney(totalMonthly * 12) + '/yr';
        document.getElementById('admin-stat-leak').textContent = formatMoney(totalLeak);
    }

    // --- Render: Users Table ---
    function renderUsersTable(userData) {
        var tbody = document.getElementById('admin-users-tbody');
        var filtered = userData;

        if (searchQuery) {
            var q = searchQuery.toLowerCase();
            filtered = userData.filter(function (u) {
                return u.name.toLowerCase().indexOf(q) !== -1 || u.email.toLowerCase().indexOf(q) !== -1;
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">' +
                '<div class="admin-empty">' +
                '<span class="material-symbols-outlined admin-empty__icon">group_off</span>' +
                (searchQuery ? 'No users match "' + searchQuery + '".' : 'No users registered yet.') +
                '</div></td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(function (u) {
            var hasLeak = u.annualLeak > 0;
            return '<tr>' +
                '<td>' +
                    '<div class="admin-user-cell">' +
                        '<div class="admin-user-avatar admin-user-avatar--' + u.avatarColor + '">' + u.initials + '</div>' +
                        '<span class="admin-user-name">' + escapeHtml(u.name) + '</span>' +
                    '</div>' +
                '</td>' +
                '<td>' + escapeHtml(u.email) + '</td>' +
                '<td class="text-center font-data">' + u.subsCount + '</td>' +
                '<td class="text-right font-data">' + formatMoney(u.monthlySpend) + '</td>' +
                '<td class="text-right font-data">' + formatMoney(u.annualLeak) + '</td>' +
                '<td class="text-center">' +
                    (hasLeak
                        ? '<span class="admin-tag admin-tag--warning">Leaking</span>'
                        : '<span class="admin-tag admin-tag--active">Active</span>') +
                '</td>' +
                '<td class="text-center">' +
                    '<button class="admin-row-action" data-delete-id="' + u.id + '" aria-label="Delete user ' + escapeHtml(u.name) + '">' +
                        '<span class="material-symbols-outlined">delete</span>' +
                    '</button>' +
                '</td>' +
                '</tr>';
        }).join('');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Full Re-render ---
    function renderAll() {
        var users = loadAllUsers();
        var userData = computeUserData(users);
        renderStats(userData);
        renderUsersTable(userData);
    }

    // --- Delete User Flow ---
    var deleteModal = document.getElementById('admin-delete-modal');
    var deleteConfirmBtn = document.getElementById('admin-delete-confirm');
    var deleteCancelBtn = document.getElementById('admin-delete-cancel');
    var deleteDesc = document.getElementById('admin-delete-desc');

    function openDeleteModal(userId) {
        var users = loadAllUsers();
        var user = users.find(function (u) { return u.id === userId; });
        if (!user) return;

        pendingDeleteId = userId;
        deleteDesc.textContent = 'Are you sure you want to delete "' + user.name + '" (' + user.email + ')? This will permanently remove their account, all subscriptions, and budget data.';
        deleteModal.classList.add('admin-modal-overlay--open');
    }

    function closeDeleteModal() {
        pendingDeleteId = null;
        deleteModal.classList.remove('admin-modal-overlay--open');
    }

    function executeDelete() {
        if (!pendingDeleteId) return;

        var users = loadAllUsers();
        var updated = users.filter(function (u) { return u.id !== pendingDeleteId; });
        localStorage.setItem('essara_users', JSON.stringify(updated));

        // Remove associated data
        localStorage.removeItem('essara_subscriptions_' + pendingDeleteId);
        localStorage.removeItem('essara_budget_' + pendingDeleteId);

        closeDeleteModal();
        renderAll();
    }

    deleteConfirmBtn.addEventListener('click', executeDelete);
    deleteCancelBtn.addEventListener('click', closeDeleteModal);

    // Close modal on overlay click
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) closeDeleteModal();
    });

    // --- Add User Flow ---
    var addModal = document.getElementById('admin-add-modal');
    var addBtn = document.getElementById('admin-add-user-btn');
    var addForm = document.getElementById('admin-add-user-form');
    var addCancel = document.getElementById('admin-add-cancel');
    var addError = document.getElementById('admin-add-error');

    function openAddModal() {
        addForm.reset();
        addError.textContent = '';
        document.querySelectorAll('#admin-add-user-form .admin-form-input').forEach(function (el) {
            el.classList.remove('has-error');
        });
        addModal.classList.add('admin-modal-overlay--open');
    }

    function closeAddModal() {
        addModal.classList.remove('admin-modal-overlay--open');
    }

    addBtn.addEventListener('click', openAddModal);
    addCancel.addEventListener('click', closeAddModal);

    addModal.addEventListener('click', function (e) {
        if (e.target === addModal) closeAddModal();
    });

    addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameInput = document.getElementById('admin-new-name');
        var emailInput = document.getElementById('admin-new-email');
        var passInput = document.getElementById('admin-new-password');

        var name = nameInput.value.trim();
        var email = emailInput.value.trim();
        var password = passInput.value;

        // Clear errors
        addError.textContent = '';
        nameInput.classList.remove('has-error');
        emailInput.classList.remove('has-error');
        passInput.classList.remove('has-error');

        var hasErr = false;
        if (!name) { nameInput.classList.add('has-error'); hasErr = true; }
        if (!email || email.indexOf('@') === -1) { emailInput.classList.add('has-error'); hasErr = true; }
        if (password.length < 4) { passInput.classList.add('has-error'); hasErr = true; }

        if (hasErr) {
            addError.textContent = password.length > 0 && password.length < 4
                ? 'Password must be at least 4 characters.'
                : 'Please fill in all fields correctly.';
            return;
        }

        var users = loadAllUsers();
        if (users.find(function (u) { return u.email === email; })) {
            addError.textContent = 'An account with this email already exists.';
            emailInput.classList.add('has-error');
            return;
        }

        var newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password
        };
        users.push(newUser);
        localStorage.setItem('essara_users', JSON.stringify(users));

        // Initialize empty subs for new user
        localStorage.setItem('essara_subscriptions_' + newUser.id, JSON.stringify([]));

        closeAddModal();
        renderAll();
    });

    // --- Table Event Delegation (Delete Buttons) ---
    var usersTableBody = document.getElementById('admin-users-tbody');
    usersTableBody.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-delete-id]');
        if (btn) {
            openDeleteModal(btn.getAttribute('data-delete-id'));
        }
    });

    // --- Search/Filter ---
    var searchInput = document.getElementById('admin-user-search');
    searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        var users = loadAllUsers();
        var userData = computeUserData(users);
        renderUsersTable(userData);
    });

    // --- Currency Switching ---
    var currSelect = document.getElementById('currency-select');
    if (currSelect) {
        currSelect.value = currentCurrency;
        currSelect.addEventListener('change', function (e) {
            currentCurrency = e.target.value;
            localStorage.setItem('essara_currency', currentCurrency);
            renderAll();
        });
    }

    // --- Logout ---
    var logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'admin-login.html';
        });
    }

    // --- Mobile Sidebar Toggle ---
    var sidebarToggle = document.getElementById('admin-sidebar-toggle');
    var sidebar = document.getElementById('admin-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('admin-sidebar--open');
        });
    }

    // --- Keyboard shortcut: Escape to close modals ---
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeDeleteModal();
            closeAddModal();
        }
    });

    // --- Initial Render ---
    renderAll();

})();
