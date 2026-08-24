---
name: Essara Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#6f4500'
  on-tertiary: '#ffffff'
  tertiary-container: '#905a00'
  on-tertiary-container: '#ffdfbe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is rooted in **Corporate Modernism** with a heavy focus on **Systematic Utility**. It is designed for high-density financial data where clarity is the primary vehicle for trust. The aesthetic is clean, precise, and professional, minimizing decorative elements to empower the user's analytical workflow. 

The interface should evoke a sense of "Financial Calm"—turning chaotic subscription data into an organized, actionable dashboard. It utilizes a disciplined application of whitespace and a "Data-First" hierarchy, where the most critical information (leaks and savings) is highlighted through purposeful color shifts rather than loud UI components.

## Colors
This design system utilizes a palette optimized for financial state-tracking.

- **Primary (Electric Blue):** Reserved for primary actions, active navigation states, and brand-level highlights.
- **Secondary (Teal):** Used for "Healthy" statuses, savings achieved, and growth indicators.
- **Tertiary (Amber):** Specific to "Leaks" and budget warnings. It signals caution without the immediate alarm of red.
- **Error (Red):** Exclusively for failed payments, over-budget alerts, and critical cost leaks.
- **Neutrals:** A slate-based gray scale is used for borders, secondary text, and UI scaffolding to maintain a cool, professional temperature.

**Dark Mode Implementation:** In dark mode, surfaces should use deep navy-slates (`#1E293B`) rather than pure black to maintain legible contrast for dense data tables.

## Typography
The typographic system prioritizes legibility and technical precision. 

- **Headlines:** Use **Geist** for its modern, geometric clarity and tight tracking, which feels "engineered."
- **Body:** Use **Inter** for its neutral, highly readable qualities in multi-line descriptions.
- **Financial Data:** Use **JetBrains Mono** for all currency amounts, tabular data, and percentages. The monospaced nature ensures that columns of numbers align perfectly for easy vertical scanning.
- **Labels:** Use uppercase Inter for small metadata labels to provide clear structural categorization.

## Layout & Spacing
The system uses an **8px linear scale** for consistent rhythm. 

- **Grid Strategy:** A 12-column fluid grid for desktop with 24px gutters. For data-heavy views, use a "Main + Sidebar" layout (8 columns for data, 4 for insights/filters).
- **Dashboard Patterns:** Statistics should be housed in a 3 or 4-column responsive grid of cards at the top of the view.
- **Density:** Use "Compact" spacing (8px-12px) within data tables and "Spacious" spacing (24px-32px) for page-level sectioning.
- **Mobile:** Transition to a single-column layout with 16px horizontal margins.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than aggressive shadows.

- **Level 0 (Background):** Primary page background.
- **Level 1 (Cards/Tables):** White (light mode) or Slate-800 (dark mode) with a 1px border (`Neutral-200` / `Slate-700`). No shadow.
- **Level 2 (Modals/Dropdowns):** Elevated using a soft, neutral shadow (10% opacity, 12px blur) to differentiate from the background.
- **Hover States:** Subtle background tint shift (e.g., `Neutral-50`) to indicate interactivity without visual noise.

## Shapes
The design system uses **Soft (0.25rem)** as the default roundedness. This reinforces the professional, structured nature of a financial tool. 

- **Small (4px):** Checkboxes, small buttons, and tags.
- **Medium (8px):** Input fields, cards, and primary buttons.
- **Large (12px):** Modals and empty state containers.
- **Circular:** Exclusively for user avatars and status pips.

## Components

### Status Indicators
- **Healthy:** Teal background tint with dark teal text + check icon.
- **Overlap/Warning:** Amber background tint with dark amber text + alert-triangle icon.
- **Leak/Urgency:** Red background tint with white text for high-visibility "Leak" banners.

### Data Tables
- Header rows should be sticky with a 1px bottom border and `label-caps` typography.
- Currency columns must be right-aligned and use `data-mono`.
- Row hover states should apply a subtle color change to assist horizontal scanning.

### Forms & Inputs
- **Input Fields:** Use a standard height of 40px with a 1px border. Focus state uses a 2px `primary-blue` ring.
- **Currency Input:** Should have a fixed prefix (e.g., "$") in the left slot, utilizing the monospaced font.

### Tabs
- Use an "Underline" pattern for top-level navigation (Overview, Subscriptions, Alerts). 
- Use "Pill" style segments for local filtering (e.g., Monthly vs. Yearly view).

### Modals & Dialogs
- **Confirmation:** Destructive actions (Delete) use a "Soft Red" button style to prevent accidental clicks.
- **Mocks:** Payment mockups should be framed within a centered modal (max-width 480px) with clear step indicators at the top.

### Cards
- Dashboard stats cards should feature a large `headline-lg` numeric value, a `data-mono` percentage change, and a 48px square icon in the top right corner.