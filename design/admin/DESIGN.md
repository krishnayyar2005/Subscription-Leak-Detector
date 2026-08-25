---
name: Essara Admin
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf6'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d3e3ff'
  on-surface: '#0b1c30'
  on-surface-variant: '#434656'
  inverse-surface: '#213146'
  inverse-on-surface: '#ebf1ff'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#016a61'
  on-secondary: '#ffffff'
  secondary-container: '#9defe3'
  on-secondary-container: '#0d6f66'
  tertiary: '#6f4500'
  on-tertiary: '#ffffff'
  tertiary-container: '#8b5c19'
  on-tertiary-container: '#ffdfbd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#a0f1e6'
  secondary-fixed-dim: '#84d5ca'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb7'
  tertiary-fixed-dim: '#f8bb70'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e3ff'
  status-online: '#10b981'
  status-warning: '#f59e0b'
  status-critical: '#ef4444'
  table-row-hover: '#f1f5f9'
  admin-sidebar: '#0b1c30'
typography:
  display-lg:
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
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  table-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  status-pill:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  admin-sidebar-width: 260px
  header-height: 64px
  table-cell-padding-x: 12px
  table-cell-padding-y: 8px
  gutter: 24px
  margin-page: 32px
---

## Brand & Style
The administrative extension of the design system evolves from "Financial Calm" to **"Operational Authority."** It is optimized for high-velocity oversight, where the target audience consists of systems administrators and financial controllers who require immediate, low-friction access to system health and category hierarchies.

The design style is **Systematic Minimalism**. It eschews visual flair in favor of information density and logical grouping. Every pixel is dedicated to utility, utilizing a "Glass-and-Steel" aesthetic—clear, structured, and resilient. The dashboard must feel like a high-precision instrument: reliable, fast, and uncompromisingly professional.

## Colors
This design system employs a specialized palette for administrative oversight, emphasizing system state and data categorization.

- **Primary (#0052ff):** Used for global actions, system-level navigation, and focus indicators.
- **Surface Tiers:** Uses a refined slate-white scale (`#f8f9ff` to `#d3e4fe`) to differentiate between the global navigation sidebar, background workspace, and foreground data containers.
- **System Status Indicators:** A dedicated "Traffic Light" set is introduced for the global status bar:
    - **Online/Active:** Vibrant Emerald for server uptime and healthy processes.
    - **Warning/Latency:** Amber for non-critical spikes or pending approvals.
    - **Critical/Down:** Crimson for system outages or security breaches.
- **Category Colors:** For management controls, use a rotating set of muted jewel tones to differentiate categories without competing with primary action buttons.

## Typography
Typography is tuned for extreme density. 

- **Geist (Headlines):** Reserved for page titles and high-level metric summaries.
- **Inter (Body & Controls):** Used for all administrative inputs, descriptions, and category labels. Size is reduced to 14px (`body-md`) as the default for admin views to increase vertical data visibility.
- **JetBrains Mono (Data):** The primary font for all table cells. This ensures that IDs, timestamps, and financial figures remain perfectly aligned for scanning.
- **Hierarchy:** Use `label-caps` for table headers and grouping titles to provide a strong visual "anchor" for the eyes when scrolling through thousands of records.

## Layout & Spacing
The layout follows a **Fixed-Sidebar / Fluid-Content** model to provide a persistent control anchor.

- **Global Sidebar:** A fixed 260px container on the left, utilizing a dark theme (`admin-sidebar`) to visually separate navigation from data.
- **The Workbench:** The main content area uses a fluid grid but maintains a 1280px "comfortable max-width" for content readability, centering on larger displays.
- **Data Density:** Admin tables use a "Compact" rhythm with 8px vertical cell padding. Page margins are generous (32px) to provide visual relief from the dense interior data.
- **Breakpoints:** 
    - **Desktop (1440px+):** Full sidebar + 12-column content.
    - **Tablet (768px - 1439px):** Sidebar collapses to icons only; content expands.
    - **Mobile (<768px):** Sidebar becomes a bottom-sheet or hamburger overlay; data tables switch to "Card-List" view.

## Elevation & Depth
Elevation in the admin system is strictly functional, used to separate "Global Controls" from "Task-Specific Content."

- **Tonal Layering:** The primary workspace background is slightly tinted (`surface-bright`), while data tables and forms are housed in white containers (`surface-container-lowest`). This creates depth through color rather than shadow.
- **The "Command" Layer:** Global system status indicators and top-level search bars use a 1px `outline-variant` border. Shadows are only permitted on floating elements like context menus or tooltips to ensure they don't get lost against dense table data.
- **Active State:** Navigation items and selected table rows use a subtle background shift (`surface-container-high`) rather than a shadow, maintaining the flat, high-precision aesthetic.

## Shapes
The admin system shifts toward **Soft (0.25rem)** roundedness to maximize space efficiency. Sharper corners allow for tighter alignment of grid-based data.

- **0.125rem (Extra Small):** Used for status pips and "Category" tags.
- **0.25rem (Standard):** Primary buttons, input fields, and table containers.
- **Circular:** Exclusively for system status indicators (pips) and user profile avatars. 
- **0px (Sharp):** Used for sidebar navigation items and top-bar borders to emphasize the structural "frame" of the dashboard.

## Components

### Dense Data Tables
- **Header:** Sticky, `label-caps` text, `#f8f9ff` background with a 2px bottom border.
- **Rows:** 40px fixed height. Alternate row striping using `surface-container-low` for extremely wide datasets.
- **Actions:** Use a "Hover-only" visibility for row-level actions (Edit, Delete) to reduce visual clutter until needed.

### Category Management
- **Tags:** Small, semi-transparent background pips with high-contrast text. 
- **Controls:** Use "Drag-and-Drop" handles (6-dot icon) for manual reordering of categories, utilizing the `primary-blue` for the active drag state.

### Global Status Bar
- A thin (32px) horizontal bar at the very top or integrated into the sidebar.
- Contains a pulsating "Ping" indicator (using status colors) and a shorthand latency metric (e.g., "12ms").

### Admin Input Fields
- **Search:** A global search bar in the header with a `/` keyboard shortcut indicator.
- **Bulk Actions:** A floating footer bar that appears when 1 or more table rows are selected, allowing for "Batch Edit" or "Batch Delete."

### System Cards
- Use for "Server Health" or "Daily Volume." These lack the padding of standard cards, featuring a "Sparkline" graph that goes edge-to-edge at the bottom of the card.