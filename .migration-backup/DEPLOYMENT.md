# Deployment Guide: Hackathon Helper AI

This guide will help you deploy the "Hackathon Helper AI" application on **Render**.

## Prerequisites
1. A GitHub account.
2. A Render account (connect it to your GitHub).
3. Firebase Project (with Auth and Firestore enabled).
4. Google Gemini API Key.

## Step 1: Push to GitHub
1. Initialize a git repository: `git init`
2. Add all files: `git add .`
3. Commit: `git commit -m "Initial commit"`
4. Create a new repository on GitHub and push your code.

## Step 2: Configure Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Use the following settings:
   - **Name**: hackathon-helper-ai
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or any other)

## Step 3: Add Environment Variables
In the Render dashboard, go to the **Environment** tab of your service and add:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY`

*Copy these values from your `.env.local` file.*

## Step 4: Deploy
Click **Deploy Web Service**. Render will build and deploy your application. Once finished, you'll receive a public URL (e.g., `https://hackathon-helper-ai.onrender.com`).

## Step 5: Firebase Authorized Domains
1. Go to your **Firebase Console**.
2. Navigate to **Authentication > Settings > Authorized Domains**.
3. Add your Render URL (e.g., `hackathon-helper-ai.onrender.com`) to the list.

Your application is now live!
