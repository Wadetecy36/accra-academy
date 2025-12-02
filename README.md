# Accra Academy - Full-Stack AI Website

A modern, full-stack web application for Accra Academy, featuring a **RAG-powered AI Chatbot** (Google Gemini 2.5), a **Real-time News Feed**, and a secured **Admin Dashboard** for data management.

## 🚀 Features

### Frontend (Client)
*   **Modern UI:** Built with HTML5, Tailwind CSS (CDN), and Swiper.js.
*   **Interactive Gallery:** Masonry grid with filtering and cinematic lightbox.
*   **AI Chat Widget:** Floating assistant that remembers conversation context.
*   **Real-time News:** Fetches live updates about the school via Google News RSS.

### Backend (Server)
*   **Node.js & Express:** Serves the static site and handles API requests.
*   **MongoDB Atlas:** Stores chat logs and the AI's "Knowledge Base" (RAG).
*   **Google Gemini 2.5 Flash:** Powers the chatbot intelligence.
*   **Admin Dashboard:**
    *   View live chat logs.
    *   Add/Delete facts from the AI's brain (No-code CMS).
    *   Bulk upload data via CSV.

---

## 📂 Project Structure

```text
accra-academy-website/
│   .gitignore           # Ignores node_modules & .env
│   index.html           # Homepage (Chatbot integrated)
│   about.html           # History & Timeline
│   admin.html           # 🔒 Secure Admin Dashboard
│   news.html            # Live RSS News Feed
│   gallery.html         # Interactive Gallery
│   package.json         # Root config
│
├───assets/              # Images (WebP format recommended)
│
├───css/
│       custom.css       # Custom styles & animations
│
├───js/
│       script.js        # Frontend logic (Chat UI, Swiper, AOS)
│
└───server/              # 🧠 THE BACKEND
        server.js        # Express API (Chat, Logs, News)
        seed.js          # Database Seeder script
        package.json     # Backend dependencies
        .env             # Secrets (API Keys - DO NOT COMMIT)
🛠️ Setup Guide
1. Prerequisites
Node.js (v18 or higher) installed.
MongoDB Atlas account (Free tier).
Google AI Studio API Key.
2. Installation
Clone the repository and install dependencies for the backend.
code
Bash
# Go to the server directory
cd server

# Install packages (Express, Mongoose, RSS-Parser, etc.)
npm install
3. Configuration (.env)
Create a file named .env inside the server/ folder and add your credentials:
code
Env
GEMINI_API_KEY=your_google_gemini_key_here
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xyz.mongodb.net/accra_academy?retryWrites=true&w=majority
4. Database Seeding (Optional)
To populate the database with initial facts (Anthem, Founders, History), run the seeder script once.
code
Bash
# Inside server/ folder
node seed.js
5. Running the Application
Start the unified server. This serves both the API and the Frontend.
code
Bash
# Inside server/ folder
node server.js
The app will run at: http://localhost:3000
🔐 Admin Dashboard
Access the command center to monitor chats and update the AI.
URL: http://localhost:3000/admin.html
Default Password: bleoo1931
☁️ Deployment
Option A: Render (Easiest)
Push code to GitHub.
Create a Web Service on Render connected to the repo.
Build Command: cd server && npm install
Start Command: node server/server.js
Add Environment Variables (MONGO_URI, GEMINI_API_KEY) in Render settings.
Option B: Vercel (Fastest)
Ensure vercel.json exists in root.
Deploy using Vercel CLI or Dashboard.
Add Environment Variables in Vercel project settings.
🤝 Contributing
Fork the repository.
Create a feature branch (git checkout -b feature/AmazingFeature).
Commit changes (git commit -m 'Add AmazingFeature').
Push to branch (git push origin feature/AmazingFeature).
Open a Pull Request.
📄 License
Distributed under the MIT License.