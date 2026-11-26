# Cohort Health Metrics Dashboard

A frontend MVP for monitoring student attendance, assignment submissions, and cohort progress. It currently runs entirely in React using demonstration records from `src/data/students.json`.

## Run locally

1. Install Node.js (version 20 or newer).
2. In this project folder, run `npm install`.
3. Run `npm run dev` and open the local URL shown in your terminal.

To create a production build, run `npm run build`.

## MVP features

- KPI cards for student count, average attendance, average submission completion, and at-risk count.
- Student search by name, ID, or email; filter by risk status.
- Risk flag when attendance is below 75% **or** assignment completion is below 60%; each row shows the status, while CSV includes the reason.
- Attendance and assignment overview charts.
- CSV export of the currently filtered student list.

## Metric definitions

- Attendance percentage = sessions attended ÷ total sessions × 100.
- Assignment completion = assignments submitted ÷ assignments expected × 100.
- Cohort averages are the arithmetic mean of each student's percentage.
- At risk = attendance below 75% OR assignment completion below 60%.

## Scope and next steps

This MVP has no API, authentication, or database. It does not yet implement the planned PERN backend. A next step is to add an Express API and PostgreSQL schema, then replace the local JSON import with API requests.
