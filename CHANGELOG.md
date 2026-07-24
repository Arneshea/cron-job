# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-07-19

### Added
- Email + password authentication (Auth.js, bcrypt-hashed passwords, JWT sessions)
- Job CRUD: register, edit, pause/resume, delete monitored jobs
- Cron-expression scheduling with a configurable grace period per job
- Public ping endpoint (`/api/ping/[token]`) with duplicate-ping guard
- Background checker (`/api/cron/check`) that flags overdue jobs as Missed
- Webhook alerting (Slack/Discord-compatible) on the transition into Missed
- Dashboard with live status, check-in history timeline per job
- Landing page with SEO metadata, OpenGraph tags, and JSON-LD structured data
- Seed script with a demo account and sample healthy/missed jobs
