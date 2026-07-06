# TrackGuard AI 🛡️
[![Build & Verify](https://github.com/kalim-j/trackguard-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/kalim-j/trackguard-ai/actions/workflows/deploy.yml)

### AI-Powered Railway Animal Intrusion Detection System

Protecting every animal on every railway track — with 5km early warning, multi-species AI detection, and real-time monitoring dashboard.

## Live Demo
[trackguard-ai.vercel.app](https://trackguard-ai.vercel.app)

## Tech Stack
Next.js 14 · TypeScript · Firebase Auth · Supabase · React Three Fiber · Tailwind CSS · Recharts · Vercel

## Features
- Google OAuth login
- Real-time train tracking (RailOne API)
- Demo animal detection data (iNaturalist + GBIF)
- 3D railway track visualization (WAP-7 loco model)
- Live alert dashboard with 5km radius detection
- Analytics species breakdown, time-of-day heatmap
- Sensor health monitoring
- ALP & station master notification system

## Setup
1. Clone repo: `git clone https://github.com/kalim-j/trackguard-ai`
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill values
4. `npm run dev`

## Environment Variables
See `.env.example` for all required keys.

## Disclaimer
Animal detection data shown is sourced from public biodiversity databases (iNaturalist, GBIF) for demonstration purposes only. This is an academic project.

## Author
Kalim — CSE Student, Rathinam Technical Campus, Coimbatore
