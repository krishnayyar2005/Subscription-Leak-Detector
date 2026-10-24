document.addEventListener('DOMContentLoaded', () => {
    const paymentMethodSelect = document.getElementById('payment-method');
    const cardDigitsContainer = document.getElementById('card-digits-container');
    const cardDigitsInput = document.getElementById('card-digits');
    const form = document.getElementById('subscription-form');

    // Toggle card digits field based on payment method
    if (paymentMethodSelect && cardDigitsContainer) {
        paymentMethodSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'cc' || val === 'dc') {
                cardDigitsContainer.style.display = 'block';
                cardDigitsInput.setAttribute('required', 'required');
            } else {
                cardDigitsContainer.style.display = 'none';
                cardDigitsInput.removeAttribute('required');
                cardDigitsInput.value = '';
            }
        });
    }

    // Inline message helper
    const showMessage = (msg, type) => {
        let msgEl = document.getElementById('form-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.id = 'form-message';
            msgEl.style.marginBottom = '16px';
            msgEl.style.fontSize = '14px';
            msgEl.style.fontWeight = '500';
            msgEl.style.padding = '12px';
            msgEl.style.borderRadius = 'var(--radius-default, 4px)';
            form.parentNode.insertBefore(msgEl, form);
        }
        msgEl.textContent = msg;
        msgEl.style.backgroundColor = type === 'error' ? 'var(--error-container, #ffdad6)' : 'var(--primary-container, #cce8e4)';
        msgEl.style.color = type === 'error' ? 'var(--on-error-container, #410002)' : 'var(--on-primary-container, #051f1c)';
        
        if (type === 'success') {
            setTimeout(() => { if (msgEl) msgEl.remove(); }, 3000);
        }
    };

    // Prevent default form submission and save to MongoDB via API
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const session = JSON.parse(localStorage.getItem('essara_session'));
            const token = localStorage.getItem('essara_token');
            if (!session || !token) {
                showMessage('You must be logged in to add subscriptions.', 'error');
                return;
            }

            const name = document.getElementById('sub-name').value.trim();
            const category = document.getElementById('sub-category').value;
            const cost = document.getElementById('sub-cost').value;
            const cycle = document.getElementById('sub-cycle').value;
            const date = document.getElementById('sub-date').value;

            const paymentMethodInput = document.getElementById('payment-method');
            const cardDigitsInputEl = document.getElementById('card-digits');
            const paymentMethod = paymentMethodInput ? paymentMethodInput.value : '';
            const cardDigits = cardDigitsInputEl ? cardDigitsInputEl.value.trim() : '';

            const currentCurrency = localStorage.getItem('essara_currency') || 'USD';
            const currencyRates = { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'INR': 83.00 };
            const rate = currencyRates[currentCurrency] || 1;
            const baseCost = parseFloat(cost) / rate;

            const payload = {
                name,
                category,
                cost: baseCost,
                cycle
            };
            if (date) {
                payload.renewalDate = date;
            }
            if (paymentMethod) {
                payload.paymentMethod = paymentMethod;
            }
            if ((paymentMethod === 'cc' || paymentMethod === 'dc') && cardDigits) {
                payload.cardDigits = cardDigits;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const res = await apiRequest('/subscriptions', 'POST', payload);
                if (res.ok) {
                    showMessage('Subscription added successfully!', 'success');
                    form.reset();
                    
                    // If the global render method is available, re-render the UI live
                    if (typeof window.reloadDashboardData === 'function') {
                        window.reloadDashboardData();
                    }
                } else {
                    const errorMsg = (res.data && res.data.errors && res.data.errors.length)
                        ? res.data.errors.join(' ')
                        : (res.data && res.data.message ? res.data.message : 'Failed to save subscription.');
                    showMessage(errorMsg, 'error');
                }
            } catch (err) {
                console.error('Error saving subscription:', err);
                showMessage('Failed to save subscription.', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
