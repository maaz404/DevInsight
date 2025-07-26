# 🔑 GitHub Token Setup Guide

## Why You Need a GitHub Token

Your **GitHub metrics** and **code quality** scores are showing **0** because:

1. **GitHub Token Missing**: The current token is set to placeholder `your_actual_token_here`
2. **Rate Limits**: Without authentication, GitHub API limits to 60 requests/hour vs 5000 with token

## 🚀 Quick Setup (2 minutes)

### Step 1: Create GitHub Personal Access Token

1. Go to **GitHub.com** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name: `DevInsight Analysis Tool`
4. Select these permissions:
   - ✅ **public_repo** (access public repositories)
   - ✅ **read:user** (read user profile)
   - ✅ **repo:status** (access commit status)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Add Token to Environment

1. Open `server/.env` file
2. Replace this line:
   ```
   GITHUB_TOKEN=your_actual_token_here
   ```
   
   With your actual token:
   ```
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd server
npm start
```

## ✅ Verification

After setup, your analysis should show:
- **GitHub Score**: 20-100 (instead of 0)
- **Code Quality Score**: 30-100 (instead of 0)
- **Overall Score**: Significantly improved

## 🔒 Security Note

- Keep your token private
- Never commit it to GitHub
- The `.env` file is already in `.gitignore`

## 🆘 Still Having Issues?

If you're still getting 0 scores after token setup, it might be:
1. **Token expired** - Generate a new one
2. **Wrong permissions** - Ensure `public_repo` is checked
3. **Rate limiting** - Wait a few minutes and try again
