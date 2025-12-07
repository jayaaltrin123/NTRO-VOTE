---
description: Deployment guide for Heroku (Backend) and Netlify (Frontend)
---

# Deploy NTRO-VOTE to Heroku and Netlify

This guide provides step-by-step instructions to deploy the Spring Boot backend to Heroku and the React frontend to Netlify.

---

## Part 1: Backend Deployment (Heroku)

### Prerequisites
- Heroku Account
- Heroku CLI installed (`brew tap heroku/brew && brew install heroku`)
- Git installed

### Step 1: Login to Heroku
```bash
heroku login
```

### Step 2: Create Heroku App
1. Create a new app for the backend:
   ```bash
   heroku create ntro-vote-backend
   ```
   *(Note: App name must be unique. If `ntro-vote-backend` is taken, try adding numbers like `ntro-vote-backend-123`)*

### Step 3: Add Database (MySQL)
Heroku's native MySQL add-on (ClearDB) is no longer free. We recommend using **JawsDB MariaDB** which has a free tier.

1. Add JawsDB to your Heroku app:
   ```bash
   heroku addons:create jawsdb:kite
   ```
2. Get the database connection string:
   ```bash
   heroku config:get JAWSDB_URL
   ```
   *Format: `mysql://username:password@hostname:3306/dbname`*

### Step 4: Configure Environment Variables
Set the necessary environment variables in Heroku.

```bash
# Set Java Version
heroku config:set JAVA_RUNTIME_VERSION=17

# Set Spring Profile
heroku config:set SPRING_PROFILES_ACTIVE=prod

# Set Database Config (Parse values from JAWSDB_URL)
# User: username part of JAWSDB_URL
# Password: password part of JAWSDB_URL
# URL: jdbc:mysql://hostname:3306/dbname
heroku config:set SPRING_DATASOURCE_USERNAME=<your-db-username>
heroku config:set SPRING_DATASOURCE_PASSWORD=<your-db-password>
heroku config:set SPRING_DATASOURCE_URL="jdbc:mysql://<hostname>:3306/<dbname>?useSSL=false&allowPublicKeyRetrieval=true"

# Set JWT Secret (Generate a secure random string)
heroku config:set JWT_SECRET=your-very-secure-random-secret-key-at-least-32-chars

# Set Twilio Config
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set TWILIO_PHONE_NUMBER=your_number

# Set CORS Origin (Your future Netlify URL)
# For now, you can set it to * to allow initial testing, then restrict it later
heroku config:set CORS_ALLOWED_ORIGINS="*"
```

### Step 5: Deploy Code
1. If your backend is in a subdirectory (`backend/`), valid deployment requires a `Procfile` if not using the Maven plugin, OR ensuring the root dir is deployed.
2. The easiest way for a subdirectory mono-repo is to use `git subtree`:

   ```bash
   # Commit your changes first!
   git add .
   git commit -m "Prepare for deployment"

   # Push only the backend folder to Heroku
   git subtree push --prefix backend heroku main
   ```

### Step 6: Verify Deployment
```bash
heroku logs --tail
```
Check for "Started NtroVoteApplication in ... seconds".

---

## Part 2: Frontend Deployment (Netlify)

### Prerequisites
- Netlify Account
- GitHub Repository pushed

### Step 1: Connect to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import from existing project"**.
3. Choose **GitHub**.
4. Authorize Netlify and select your `NTRO-VOTE` repository.

### Step 2: Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist` or `dist` (Netlify usually detects this from `vite.config.js`)

### Step 3: Configure Environment Variables
Click **"Show advanced"** or go to **Site Settings > Environment Variables** after creation.

Add:
- `VITE_API_URL`: Your Heroku backend URL (e.g., `https://ntro-vote-backend-123.herokuapp.com`)

### Step 4: Deploy
Click **"Deploy Site"**.

### Step 5: Update Backend CORS
Once you have your Netlify URL (e.g., `https://super-vote-app.netlify.app`), update your Heroku config to only allow this origin:

```bash
heroku config:set CORS_ALLOWED_ORIGINS="https://super-vote-app.netlify.app"
```

---

## Troubleshooting

### Backend
- **App Crashes (H10)**: Check logs with `heroku logs --tail`.
- **Database Connection**: Ensure `SPRING_DATASOURCE_URL` starts with `jdbc:mysql://` and not `mysql://` (JawsDB gives `mysql://`).
- **Memory**: Free dynos have limited memory. Ensure your app isn't too heavy.

### Frontend
- **404 on Refresh**: Ensure `netlify.toml` is present in the `frontend` root with the redirect rules.
- **API Errors**: Check the console. If CORS errors appear, verify `CORS_ALLOWED_ORIGINS` on Heroku matches your Netlify URL exactly (no trailing slash).
