# Zypher

Zypher is a fast, minimal, and temporary file and text sharing app built for real-time convenience. No accounts, no clutter - just drop, share, and forget. Each upload gives you a code and a link to retrieve. Everything auto-deletes after 10 minutes. It can also work as a standalone app (Go to website -> Add to Homescreen)

---

## Features

- Upload multiple files (up to 10MB total) or just plain text
- Get a short code + sharable link
- Retrieve instantly via code or link
- Files auto-expire after 10 minutes

---

## Stack

**Frontend:** React, React Router, CSS Modules, FontAwesome, Vercel  
**Backend:** Node.js, Express, Multer, UUID, Render

---

## Run Locally

**Backend**

cd serverfiles
npm install
node index.js

**Frontend**

cd clientfiles
npm install
npm run dev

zypher/
├── clientFiles/ (React frontend)
├── serverFiles/ (Express backend)

**Note**

Uploads are stored in memory. Data will reset if backend sleeps (Render free tier). -> Issue fixed using cronjobs 
