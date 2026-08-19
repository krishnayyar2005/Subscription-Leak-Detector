// --- Initial Setup & Local Storage ---
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];

// Select DOM Elements 
const subForm = document.getElementById('subForm');
const dashboard = document.getElementById('dashboard');
const warningsList = document.getElementById('warningsList');
const totalCostEl = document.getElementById('totalCost');
const chartContainer = document.getElementById('chartContainer');
const legendList = document.getElementById('legendList');
const subsList = document.getElementById('subsList');

// Nothing OS Monochrome Palette
const colors = {
    'Music': '#ffffff',        // Stark White
    'Video': '#ff0033',        // Nothing Red
    'Software': '#888888',     // Mid Grey
    'Fitness': '#444444',      // Dark Grey
    'Other': '#bbbbbb'         // Light Grey
};

// --- Form Handling & Validation ---
subForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('subName').value.trim();
    const category = document.getElementById('subCategory').value;
    const cost = parseFloat(document.getElementById('subCost').value);
    const cycle = document.getElementById('subCycle').value;

    if (!name || isNaN(cost) || cost <= 0) {
        alert("Please enter valid subscription details.");
        return;
    }

    const newSub = { id: Date.now(), name, category, cost, cycle };
    subscriptions.push(newSub);
    
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    
    subForm.reset();
    renderDashboard();
});

// --- Core Logic & Array Methods ---
const getMonthlyCost = (cost, cycle) => {
    if (cycle === 'yearly') return cost / 12;
    if (cycle === 'weekly') return cost * 4.33;
    return cost;
};

const renderDashboard = () => {
    if (subscriptions.length === 0) {
        dashboard.style.display = 'none';
        return;
    }
    dashboard.style.display = 'block';

    const normalizedSubs = subscriptions.map(sub => ({
        ...sub, 
        monthlyCost: getMonthlyCost(sub.cost, sub.cycle)
    }));

    let totalMonthly = 0;
    const categoryStats = normalizedSubs.reduce((acc, sub) => {
        if (!acc[sub.category]) {
            acc[sub.category] = { count: 0, cost: 0, services: [] };
        }
        acc[sub.category].count += 1;
        acc[sub.category].cost += sub.monthlyCost;
        acc[sub.category].services.push(sub.name);
        totalMonthly += sub.monthlyCost;
        return acc;
    }, {});

    totalCostEl.innerHTML = `<span style="font-family: 'Roboto', sans-serif; font-size: 1.8rem; opacity: 0.4; vertical-align: middle; margin-right: 8px;">₹</span>${totalMonthly.toFixed(2)}`;

    warningsList.className = 'warning'; // Reset class
    warningsList.innerHTML = '';
    const overlaps = Object.entries(categoryStats).filter(([cat, data]) => data.count > 1);
    
    if (overlaps.length > 0) {
        overlaps.forEach(([cat, data]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Overlap Detected:</strong> You have ${data.count} services in "${cat}" (${data.services.join(', ')}). Potential leak: ₹${data.cost.toFixed(2)}/mo.`;
            warningsList.appendChild(li);
        });
    } else {
        warningsList.className = 'success'; // Change to success style
        warningsList.innerHTML = '<li>No overlaps detected. Great job! 🎉</li>';
    }

    chartContainer.innerHTML = '';
    legendList.innerHTML = '';
    
    for (const [category, data] of Object.entries(categoryStats)) {
        const percentage = ((data.cost / totalMonthly) * 100).toFixed(1);
        
        const segment = document.createElement('div');
        segment.className = 'bar-segment';
        segment.style.width = `${percentage}%`;
        segment.style.backgroundColor = colors[category] || 'rgba(200,200,200,0.8)';
        if (percentage > 10) segment.textContent = `${percentage}%`;
        chartContainer.appendChild(segment);

        const legendItem = document.createElement('li');
        legendItem.innerHTML = `<span style="color: ${colors[category]}; font-size: 1.2rem; margin-right: 5px;">■</span> <strong>${category}</strong>: ₹${data.cost.toFixed(2)}/mo`;
        legendList.appendChild(legendItem);
    }

    subsList.innerHTML = '';
    normalizedSubs.forEach(sub => {
        const li = document.createElement('li');
        li.textContent = `${sub.name} (${sub.category}) - ₹${sub.cost} / ${sub.cycle} (₹${sub.monthlyCost.toFixed(2)}/mo)`;
        subsList.appendChild(li);
    });
};

const clearData = () => {
    if(confirm("Are you sure you want to clear all data?")) {
        localStorage.removeItem('subscriptions');
        subscriptions = [];
        renderDashboard();
    }
};

renderDashboard();