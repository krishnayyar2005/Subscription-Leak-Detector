# Subscription Leak Detector

A web-based subscription management application that helps users track recurring expenses, identify overlapping subscriptions, manage budgets, and detect potential spending leaks.

## 🎯 Problem

With multiple streaming, music, software, and other subscription services, users can easily lose track of recurring expenses and pay for overlapping services.

This project provides a centralized dashboard to monitor and analyze subscription spending.

## ✨ Features

* 🔐 **Login & Signup** — Basic user authentication
* 📊 **Dashboard** — View subscriptions, monthly spending, and yearly estimates
* 🔍 **Leak Detection** — Identifies multiple subscriptions within the same category
* 💰 **Budget Tracking** — Set and monitor monthly spending limits
* 📅 **Renewal Calendar** — Track upcoming subscription renewals
* 📈 **Reports** — View category-wise subscription spending
* 💱 **Currency Support** — USD, EUR, GBP, and INR
* 🌙 **Dark Mode** — Light/dark theme support
* 💾 **Local Storage** — Stores users, sessions, subscriptions, budgets, and preferences

## 🛠️ Technologies

* HTML5
* CSS3
* JavaScript
* Local Storage API
* DOM Manipulation
* JSON
* Browser APIs

## 🧠 How Leak Detection Works

Subscriptions are grouped by category. If multiple subscriptions exist in the same category, the application identifies potential overlaps and calculates the recurring cost of the additional subscriptions.

Example:

```text
Video
├── Netflix       $15/month
├── Prime Video    $9/month
└── Disney+       $12/month

Potential spending leak detected
```

## 🏗️ Project Structure

```text
Subscription-Leak-Detector/
│
├── index.html
├── login.html
├── budget.html
├── calendar.html
├── css/
├── js/
├── dashboard 2/
├── overlaps/
├── reports/
└── subscription/
```

## ▶️ How to Run

No backend or installation is required.

Open `index.html` in a modern browser, or use VS Code Live Server.

## 🔒 Note

This is a frontend prototype. User and subscription data are stored in browser Local Storage and should not be used for real financial or sensitive information.

## 🚀 Future Scope

* Backend database
* Secure authentication
* Email renewal reminders
* Real-time currency rates
* Bank/payment API integration
* AI-based subscription recommendations
* Cloud synchronization

## 🎓 Project Purpose

This project demonstrates practical use of HTML, CSS, JavaScript, DOM manipulation, browser APIs, Local Storage, data processing, and financial tracking concepts.
