# Accra Academy – Full-Stack AI Website

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Active-blue)
![Node](https://img.shields.io/badge/Node-18%2B-orange)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-purple)

A modern, full-stack web platform built for **Accra Academy**, featuring a powerful **RAG-powered AI Chatbot**, a dynamic **News Feed**, and a secure **Admin Dashboard** for knowledge management.

---

## 📑 Table of Contents
- [Features Overview](#-features-overview)
- [Project Structure](#-project-structure)
- [Setup Guide](#️-setup-guide)
- [Admin Dashboard](#-admin-dashboard)
- [Deployment](#️-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features Overview

### Frontend
- Modern responsive UI using Tailwind CSS (CDN)
- AI Chat Widget (Google Gemini 2.5 Flash)
- Masonry gallery with filtering + animated lightbox
- Live Google News RSS integration

### Backend
- Node.js + Express REST API
- MongoDB Atlas for Knowledge Base + logs
- Google Gemini RAG intelligence
- Admin Dashboard for CMS-like management

---

## 📂 Project Structure
```text
accra-academy-website/
│   .gitignore
│   index.html
│   about.html
│   admin.html
│   news.html
│   gallery.html
│   package.json
│
├── assets/
├── css/
│     custom.css
│     input.css
│     style.css
├── csv/
│     hall_data.csv
│     calendar_data.csv
├── js/
│     script.js
└── server/
      server.js
      seed.js
      package.json
      .env
```

---

## 🛠️ Setup Guide

### 1. Requirements
- Node.js 18+
- MongoDB Atlas
- Google Gemini API Key

### 2. Installation
```bash
cd server
npm install
```

### 3. Configure Environment Variables
Create `.env` inside `/server`:

```env
GEMINI_API_KEY=your_key
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/accra_academy
```

### 4. Seed Database (optional)
```bash
node seed.js
```

### 5. Run App
```bash
node server.js
```
App runs at: **http://localhost:3000**

---

## 🔐 Admin Dashboard
- URL: `http://localhost:3000/admin.html`
- Default Password: **bleoo1931**

---

## ☁️ Deployment

### Render Deployment
Build:
```bash
cd server && npm install
```
Start:
```bash
node server/server.js
```

Environment Variables:
- GEMINI_API_KEY
- MONGO_URI

### Vercel Deployment
Use if backend is hosted externally.

---

## 🤝 Contributing
```bash
git checkout -b feature/MyFeature
git commit -m "Add MyFeature"
git push origin feature/MyFeature
```

---

## 📄 License
MIT License
