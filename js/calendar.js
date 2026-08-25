document.addEventListener('DOMContentLoaded', () => {
    // 1. Session & Global State
    const session = JSON.parse(localStorage.getItem('essara_session'));
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const subs = JSON.parse(localStorage.getItem('essara_subscriptions_' + session.id)) || [];
    // Global state is handled by script.js, including formatMoney.

    // 2. DOM Elements
    const gridEl = document.getElementById('calendar-grid');
    const monthLabelEl = document.getElementById('cal-month-label');
    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    const upcomingListEl = document.getElementById('upcoming-renewals-list');

    // 3. Calendar State
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let viewMonth = today.getMonth();
    let viewYear = today.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // 4. Date Logic Helpers
    const getNextRenewal = (sub) => {
        let d = new Date(sub.date);
        d.setHours(0,0,0,0);
        let prevD = new Date(d);
        
        while (d < today) {
            prevD = new Date(d);
            if (sub.cycle === 'Monthly') d.setMonth(d.getMonth() + 1);
            else if (sub.cycle === 'Yearly') d.setFullYear(d.getFullYear() + 1);
            else if (sub.cycle === 'Weekly') d.setDate(d.getDate() + 7);
        }
        
        if (prevD < today) {
            const daysOverdue = Math.floor((today - prevD) / 86400000);
            if (daysOverdue <= 14 && daysOverdue > 0) { 
                return { ...sub, nextDate: prevD, diffDays: -daysOverdue };
            }
        }
        
        return { ...sub, nextDate: d, diffDays: Math.floor((d - today) / 86400000) };
    };

    const getRenewalsForMonth = (year, month) => {
        const results = [];
        const viewStart = new Date(year, month, 1);
        const viewEnd = new Date(year, month + 1, 0);
        
        subs.forEach(sub => {
            let d = new Date(sub.date);
            d.setHours(0,0,0,0);
            
            while (d < viewStart) {
                if (sub.cycle === 'Monthly') d.setMonth(d.getMonth() + 1);
                else if (sub.cycle === 'Yearly') d.setFullYear(d.getFullYear() + 1);
                else if (sub.cycle === 'Weekly') d.setDate(d.getDate() + 7);
            }
            
            while (d >= viewStart && d <= viewEnd) {
                results.push({ ...sub, gridDate: new Date(d) });
                if (sub.cycle === 'Monthly') d.setMonth(d.getMonth() + 1);
                else if (sub.cycle === 'Yearly') d.setFullYear(d.getFullYear() + 1);
                else if (sub.cycle === 'Weekly') d.setDate(d.getDate() + 7);
            }
        });
        return results;
    };

    const getUrgencyClass = (diffDays) => {
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'soon';
        return 'later';
    };

    const formatDateShort = (dateObj) => {
        const m = monthNames[dateObj.getMonth()].substring(0, 3);
        const d = dateObj.getDate();
        return `${m} ${d}`;
    };

    const getIconForCategory = (cat) => {
        const map = {
            'Video': 'play_circle',
            'Music': 'music_note',
            'Gaming': 'sports_esports',
            'Software': 'computer',
            'Cloud': 'cloud',
            'Productivity': 'task_alt',
            'Other': 'category'
        };
        return map[cat] || 'category';
    };

    // 5. Render Functions
    const renderCalendar = () => {
        monthLabelEl.textContent = `${monthNames[viewMonth]} ${viewYear}`;
        
        const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
        
        const gridRenewals = getRenewalsForMonth(viewYear, viewMonth);
        
        // Group by day of month
        const renewalsByDay = {};
        gridRenewals.forEach(r => {
            const day = r.gridDate.getDate();
            if (!renewalsByDay[day]) renewalsByDay[day] = [];
            renewalsByDay[day].push(r);
        });

        let html = '';
        
        // Leading padding days (previous month)
        for (let i = firstDay - 1; i >= 0; i--) {
            html += `
                <div class="calendar-cell calendar-cell--empty">
                    <span class="calendar-date-number">${daysInPrevMonth - i}</span>
                </div>
            `;
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = (i === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear());
            const cellClass = isToday ? 'calendar-cell calendar-cell--today' : 'calendar-cell';
            const dateLabel = isToday ? `${i} (Today)` : i;
            
            let tagsHtml = '';
            if (renewalsByDay[i]) {
                renewalsByDay[i].forEach(sub => {
                    // Calculate absolute diff for coloring the tag relative to TODAY
                    const absDiffDays = Math.floor((new Date(viewYear, viewMonth, i) - today) / 86400000);
                    const urg = getUrgencyClass(absDiffDays);
                    let icon = '';
                    if (urg === 'overdue') icon = '<span class="material-symbols-outlined">warning</span>';
                    
                    tagsHtml += `
                        <div class="calendar-tag calendar-tag--${urg}">
                            ${icon}
                            <span>${sub.name}</span>
                        </div>
                    `;
                });
            }
            
            html += `
                <div class="${cellClass}">
                    <span class="calendar-date-number">${dateLabel}</span>
                    ${tagsHtml}
                </div>
            `;
        }
        
        // Trailing padding days (next month) to complete 35 or 42 grid cells
        const totalCells = firstDay + daysInMonth;
        const trailingDays = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let i = 1; i <= trailingDays; i++) {
            html += `
                <div class="calendar-cell calendar-cell--empty">
                    <span class="calendar-date-number">${i}</span>
                </div>
            `;
        }
        
        gridEl.innerHTML = html;
    };

    const renderUpcoming = () => {
        if (subs.length === 0) {
            upcomingListEl.innerHTML = '<div class="empty-state-text">No upcoming renewals</div>';
            return;
        }

        const upcoming = subs.map(sub => getNextRenewal(sub))
            .sort((a, b) => a.diffDays - b.diffDays)
            .slice(0, 10); // Show top 10

        let html = '';
        upcoming.forEach(sub => {
            const urg = getUrgencyClass(sub.diffDays);
            
            let statusText = '';
            if (urg === 'overdue') {
                statusText = `Overdue (${formatDateShort(sub.nextDate)})`;
            } else if (sub.diffDays === 0) {
                statusText = 'Due today';
            } else if (sub.diffDays === 1) {
                statusText = `Tomorrow (${formatDateShort(sub.nextDate)})`;
            } else {
                statusText = `In ${sub.diffDays} days (${formatDateShort(sub.nextDate)})`;
            }

            html += `
                <div class="upcoming-item upcoming-item--${urg}">
                    <div class="upcoming-icon">
                        <span class="material-symbols-outlined">${getIconForCategory(sub.category)}</span>
                    </div>
                    <div class="upcoming-content">
                        <span class="upcoming-name">${sub.name}</span>
                        <span class="upcoming-status">${statusText}</span>
                    </div>
                    <div class="upcoming-cost-col">
                        <span class="upcoming-cost">${window.formatMoney(sub.cost)}</span>
                    </div>
                </div>
            `;
        });
        
        upcomingListEl.innerHTML = html;
    };

    // 6. Event Listeners
    prevBtn.addEventListener('click', () => {
        viewMonth--;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        }
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        viewMonth++;
        if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        renderCalendar();
    });

    // Handle global currency change
    window.reloadDashboardData = () => {
        renderUpcoming();
    };

    // 7. Initial Render
    renderCalendar();
    renderUpcoming();
});
