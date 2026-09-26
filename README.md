# Skill Exchange Platform

A full-stack platform where users list skills they can teach and skills they want to learn, browse other members, send exchange requests, message matched users, and leave ratings after an exchange.

**Stack:** HTML/CSS/JavaScript (frontend) · Node.js + Express (backend) · MongoDB Atlas (database)

## 1. Install dependencies

Open this folder in VS Code, open a terminal, and run:

```
npm install
```

This reads `package.json` and installs Express, Mongoose, bcryptjs, jsonwebtoken, dotenv, and cors into a `node_modules` folder (this folder is intentionally not pushed to GitHub — see `.gitignore`).

## 2. Set up your environment variables

1. Copy `.env.example` to a new file named exactly `.env`
2. Open `.env` and fill in:
   - `MONGODB_URI` — your MongoDB Atlas connection string (from Atlas → Connect → Drivers), with your real password in place of `<db_password>`, and add a database name before the `?`, e.g. `.../skillexchange?retryWrites=true...`
   - `JWT_SECRET` — any long random string, e.g. `myS3cretKeyForSkillExchange2026`
   - `PORT` — leave as `3000` unless it's already in use

**Never commit `.env` to GitHub** — it's already excluded via `.gitignore`, but double check before pushing.

## 3. Run the server

```
npm start
```

You should see:
```
Connected to MongoDB
Server running at http://localhost:3000
```

Open **http://localhost:3000** in your browser — that's your whole app (frontend + backend running from the same server).

## 4. Project structure

```
backend/
  server.js          - Express app entry point
  models/             - Mongoose schemas (User, Request, Message, Rating)
  routes/             - API endpoints (auth, users, requests, messages, ratings)
  middleware/auth.js   - JWT verification for protected routes
frontend/
  index.html, login.html, signup.html, dashboard.html, browse.html,
  requests.html, messages.html
  css/style.css       - shared styling
  js/                 - one JS file per page + api.js (shared fetch helper)
```

## 5. How the core flow works

1. **Sign up / log in** → gets a JWT token, stored in the browser's localStorage
2. **Dashboard** → set your name, bio, skills you can teach, skills you want
3. **Browse** → search other members by skill, send them an exchange request
4. **Requests** → recipient accepts/rejects; once accepted, either side can open **Messages** to chat
5. **Mark complete & rate** → after the exchange, either person can leave a star rating, which updates the other person's average rating shown on their profile card

## 6. Working as a team on one laptop

Before each person's turn, set the Git author so their commits are attributed to them:
```
git config user.name "Their Name"
git config user.email "their-github-email@example.com"
```
Then code, then:
```
git add .
git commit -m "Describe what you did"
git push
```

## Troubleshooting

- **"MongoDB connection error"** → double-check `MONGODB_URI` in `.env`, and that your MongoDB Atlas Network Access allows `0.0.0.0/0`
- **Port already in use** → change `PORT` in `.env` to something else, e.g. `3001`
- **Blank page / styles missing** → make sure the server is running and you're visiting `http://localhost:3000`, not opening the HTML files directly from disk
