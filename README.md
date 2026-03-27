# Job Dashboard

A premium dark-mode dashboard for tracking a job search in real time. Data lives in a Google Sheet accessed server-side via a Google Cloud Service Account — no caching, every page load fetches live. Runs locally via Next.js dev server.

Built with Next.js App Router, TypeScript, Tailwind CSS v4, and Recharts.

<img width="2029" height="1221" alt="image" src="https://github.com/user-attachments/assets/be5a8cc3-c381-4926-9eb8-a9cdf09ac77d" />
<img width="2093" height="706" alt="image" src="https://github.com/user-attachments/assets/378adc81-154a-4ffb-91de-6a8940693d95" />

---

## Features

- **Live Google Sheets sync** — server-side fetch via `googleapis` + service account, zero client-side secrets
- **Pipeline metrics** — Total Applications, Active Pipeline, Interviewed, Offers Received, Unsuccessful, with average-per-day trends
- **Charts** — daily application timeline, stacked company bar (active vs rejected), status donut, application funnel, Sankey flow, industry breakdown, location breakdown
- **Collapsible applications table** — full history with status colour coding and toggle
- **Dark glassmorphism UI** — `#0B0C10` base, purple/amber/green/red status palette, backdrop blur panels, hover micro-animations
- **Mock data fallback** — works locally without credentials

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS v4 |
| Charts | Recharts |
| Data | Google Sheets API v4 (`googleapis`, `google-auth-library`) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Server component — fetches sheets data, calculates metrics
│   ├── layout.tsx
│   └── globals.css               # Dark mode, glassmorphism, animations
├── components/
│   ├── MetricCard.tsx            # KPI tile with trend indicator
│   ├── TimelineChart.tsx         # Daily application volume (line chart)
│   ├── CompanyBarChart.tsx       # Applications by company, active vs rejected (stacked bar)
│   ├── StatusDonut.tsx           # Status distribution (donut chart)
│   ├── ApplicationFunnel.tsx     # Pipeline funnel visualisation
│   ├── ApplicationSankey.tsx     # Sankey flow diagram
│   ├── IndustryBreakdown.tsx     # Applications by industry
│   ├── LocationBreakdown.tsx     # Applications by location
│   ├── RecentApplicationsTable.tsx  # Full application history table
│   ├── DashboardClient.tsx       # Client wrapper for interactive state
│   ├── SyncBadge.tsx             # Live data sync indicator
│   └── ThemeToggle.tsx           # Light / dark toggle
└── lib/
    └── google-sheets.ts          # Sheets API client + data normalisation
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/job-dashboard.git
cd job-dashboard
npm install
```

### 2. Set up Google Sheets

1. Create a Google Sheet with headers in row 1. Data starts at row 2, columns A–F:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Date Applied | Sender (Company) | Sender Email | — | — | Category (Status) |

2. Go to [Google Cloud Console](https://console.cloud.google.com) → create a project → enable **Google Sheets API**
3. Create a **Service Account** → download the JSON key
4. Share your Google Sheet with the service account email (Viewer access)

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
GOOGLE_OAUTH_SPREADSHEET_ID=your-sheet-id-from-the-url
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If credentials are missing or the API fails, the dashboard falls back to mock data automatically.

---

## Running in Demo Mode

Clone and run with no credentials — the dashboard serves realistic generated data automatically.

```bash
git clone https://github.com/your-username/job-dashboard.git
cd job-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no `.env.local` present, mock data loads automatically across all charts and tables.

To explicitly force demo mode (overrides credentials if present):

```bash
# .env.local
DEMO_MODE=true
```

---

## Status Colour Palette

| Status | Colour |
|---|---|
| Active / Primary | `#8B5CF6` purple |
| Rejected / Unsuccessful | `#EF4444` red |
| Interview | `#F59E0B` amber |
| Offer | `#10B981` green |

---

*Built by Cogniflow Technologies*
