# Admin Template - Vue Version

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Vue 3 + Vite admin dashboard template with Element Plus, Tailwind CSS, Pinia, and command palette.

Live demo: [https://vue-admin.dynaxfy.com](https://vue-admin.dynaxfy.com)

## Looking for React version?

This repository is the Vue implementation.
For the React implementation, see [reeswell/react-admin](https://github.com/reeswell/react-admin).

## Features

- Tags view tab navigation
- Global command palette
- Theme primary color customization
- Responsive admin layout
- Mock login flow for demo usage

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Element Plus
- Tailwind CSS
- Pinia
- VueUse
- TypeScript

## Quick Start

```bash
pnpm install
pnpm dev
```

App runs at `http://localhost:3000`.

## Build

```bash
pnpm build
pnpm preview
```

## Environment Variables

Copy from example files and create your local env file:

- `.env.development.example`
- `.env.production.example`
- `.env.test.example`

Example:

```bash
cp .env.development.example .env.development
```

`/api` requests are proxied in dev when `API_PROXY_TARGET` is set (for example `http://localhost:8080`).

## Demo Account

- username: `admin`
- password: `admin123`

This account is for local/template demo only.
