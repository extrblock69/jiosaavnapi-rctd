# JioSaavn Web Application

A modern, minimal, dark-themed web application to search and stream music via an unofficial JioSaavn API.

## Project Structure

This project consists of two main parts:
1. **Frontend (`/frontend`)**: A React + Vite + Tailwind CSS application.
2. **Backend (`/backend`)**: An Express JS server integrated with a core JioSaavn API module.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- npm

## Getting Started

### 1. Setup Backend

The backend server serves the custom JioSaavn API endpoints (`/api/search/songs`, `/api/songs`, etc.).

```bash
cd backend/jiosaavn-api-main
npm install

# Start the Express server
npx tsx src/express-server.ts
```

The backend server will run on `http://localhost:4000`.

### 2. Setup Frontend

The frontend is a fast React SPA.

```bash
cd frontend
npm install

# Start the Vite development server
npm run build && npm run preview
```

The frontend will run on `http://localhost:4173`. Open it in your browser.

## Features

- **Search**: Search for any song on JioSaavn seamlessly.
- **Audio Stream**: Click on any song to fetch its high-quality stream URL and play it directly in the browser.
- **Dark Theme**: Sleek, modern black & white UI using Tailwind CSS.
- **Diagnostics Test Mode**: A dedicated terminal-like diagnostics runner that logs full end-to-end API workflows to help test and verify system functionality without checking the browser console. Access it via the top right corner.

## Note
This was built on top of an unofficial JioSaavn API structure and utilizes a highly targeted Express JS server to serve exactly the endpoints the React UI requires.
