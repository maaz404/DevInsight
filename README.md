# DevInsight 🔍

### AI-Powered GitHub Repository Analyzer

<div align="center">

[![Deploy to GitHub Pages](https://github.com/maaz404/Devinsight/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/maaz404/Devinsight/actions/workflows/deploy-frontend.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://maaz404.github.io/DevInsight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat&logo=openai)](https://openai.com/)

**[✨ Live Demo](https://maaz404.github.io/Devinsight)** • **[📖 Documentation](#-table-of-contents)** • **[🤝 Contributing](#-contributing)**

_Instant AI feedback on code quality, documentation, and project readiness._

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#%EF%B8%8F-configuration)
- [📂 Project Structure](#-project-structure)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)

## 🌟 Features

### 🔍 **Core Analysis**

- **GitHub Repository Analysis** – Analyze any public GitHub repo for code quality, structure, and best practices
- **AI-Powered Insights** – GPT-4 provides intelligent suggestions and comprehensive readiness scores
- **Real-time Progress** – Live progress tracking with step-by-step analysis indicators
- **Code Metrics Display** – Summary of complexity, modularity, and documentation quality

### 🎨 **User Experience**

- **Visual Dashboards** – Clean Ant Design-based UI with interactive score meters and charts
- **Dark/Light Mode Toggle** – Smart theming system with Ant Design v5 design tokens
- **Fully Responsive** – Seamless experience across desktop, tablet, and mobile devices
- **Modern UI/UX** – Intuitive interface with soft shadows and elegant color schemes

### 🔐 **Performance & Security**

- **Secure API Handling** – Protected GitHub token usage and backend analysis logic
- **Data Persistence** – MongoDB Atlas storage for historical analysis and user sessions
- **Rate Limiting** – Intelligent request throttling to prevent API abuse
- **Error Handling** – Robust error management with user-friendly feedback

## 📸 Screenshots

<div align="center">

### 🏠 **Landing Page**

<img src="https://github.com/user-attachments/assets/1064bc24-8a6c-4cff-a11a-b959db690480" alt="DevInsight Landing Page" width="800"/>

_Modern, clean landing page with clear value proposition and intuitive navigation_

### 🔍 **Repository Analysis Interface**

<img src="https://github.com/user-attachments/assets/a43eab8f-9cd8-46bb-b3f7-5ad6ff7603e5" alt="Repository Analysis" width="800"/>

_Streamlined interface for GitHub repository URL input and analysis initiation_

### 📊 **AI-Powered Dashboard**

<img src="https://github.com/user-attachments/assets/40a70f8f-f7b6-483e-bb94-486cfa0e3415" alt="AI Analysis Dashboard" width="800"/>

_Comprehensive dashboard displaying code quality metrics, insights, and actionable recommendations_

### 📈 **Detailed Analysis Reports**

<img src="https://github.com/user-attachments/assets/9a00a56d-15a9-4d06-973b-649f5c682f69" alt="Detailed Reports" width="800"/>

_Beautiful visual reports with performance metrics and detailed AI-generated insights_

</div>

## 🛠️ Tech Stack

<div align="center">

| Category       | Technologies                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**   | ![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react) ![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat&logo=vite) ![Ant Design](https://img.shields.io/badge/Ant%20Design-5.x-0170FE?style=flat&logo=antdesign) |
| **Backend**    | ![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js) ![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)                                                                                |
| **Database**   | ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)                                                                                                                                                                   |
| **AI/ML**      | ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat&logo=openai)                                                                                                                                                                     |
| **Deployment** | ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=github) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat&logo=githubactions)                                                        |

</div>

### **Frontend Architecture**

- **React 18** with modern hooks and functional components
- **Vite** for lightning-fast development and optimized builds
- **Ant Design v5** with design token system for consistent theming
- **React Router** for client-side routing
- **Axios** for HTTP client with interceptors

### **Backend Architecture**

- **Node.js & Express** RESTful API server
- **MongoDB Atlas** cloud database with Mongoose ODM
- **Rate limiting** and validation middleware
- **CORS** configuration for secure cross-origin requests

### **AI Integration**

- **OpenAI GPT-4 API** for intelligent code analysis
- **GitHub API** for repository data fetching
- **Custom prompt engineering** for relevant insights

## 🚀 Quick Start

### **Prerequisites**

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

### **Installation**

```bash
# Clone the repository
git clone https://github.com/maaz404/DevInsight.git
cd DevInsight

# Install all dependencies (both client and server)
npm run install:all

# Start both development servers
npm run dev:both
```

### **Individual Development**

```bash
# Frontend only (React + Vite) - Port 5173
npm run dev:client

# Backend only (Node.js + Express) - Port 3000
npm run dev:server

# Build for production
npm run build
```

### **Available Scripts**

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `npm run dev:both`    | Start both frontend and backend servers       |
| `npm run dev:client`  | Start React development server                |
| `npm run dev:server`  | Start Node.js development server              |
| `npm run build`       | Build React app for production                |
| `npm run preview`     | Preview production build locally              |
| `npm run install:all` | Install dependencies for both client & server |

## ⚙️ Configuration

### **Environment Variables**

Create the following `.env` files:

#### **Client Environment** (`client/.env`)

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=DevInsight
```

#### **Server Environment** (`server/.env`)

```bash
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devinsight

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key
GITHUB_TOKEN=ghp_your-github-personal-access-token

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=http://localhost:5173
```

### **GitHub Token Setup**

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Add the token to your server `.env` file

### **OpenAI API Setup**

1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add the key to your server `.env` file

## 📂 Project Structure

```
DevInsight/
├── 📁 client/                    # React frontend
│   ├── 📁 public/                # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── AntdScoreMeter.jsx
│   │   │   ├── InputBox.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ScoreMeter.jsx
│   │   ├── 📁 pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   └── AnalyzeRepo.jsx
│   │   ├── 📁 theme/             # Theme configuration
│   │   │   ├── antdTheme.js
│   │   │   └── ThemeProvider.jsx
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # App entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   ├── vite.config.js            # Vite configuration
│   └── tailwind.config.js        # Tailwind CSS config
├── 📁 server/                    # Node.js backend
│   ├── 📁 middleware/            # Express middleware
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── 📁 models/                # MongoDB models
│   │   └── Project.js
│   ├── 📁 routes/                # API routes
│   │   ├── analyze.js
│   │   └── projects.js
│   ├── 📁 services/              # Business logic
│   │   └── openai.js
│   ├── server.js                 # Express server setup
│   └── package.json
├── 📁 screenshots/               # Project screenshots
├── 📁 .github/workflows/         # GitHub Actions
├── package.json                  # Root package.json
└── README.md                     # Project documentation
```

## 🌐 Deployment

### **Automatic Deployment with GitHub Actions**

The project includes automated deployment to GitHub Pages:

1. **Push to main branch** triggers the deployment workflow
2. **Frontend builds** automatically with Vite
3. **Deploys to GitHub Pages** with custom domain support

#### **Manual Deployment**

```bash
# Build the client
npm run build

# Deploy to GitHub Pages (if configured)
npm run deploy
```

#### **Backend Deployment**

Deploy the server to platforms like:

- **Render** (Recommended)
- **Vercel**
- **Heroku**
- **Railway**

### **Environment Setup for Production**

Update environment variables for production:

```bash
# Client production environment
VITE_API_URL=https://your-backend-domain.com/api

# Server production environment
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Workflow**

1. **Fork the repository**

   ```bash
   gh repo fork maaz404/DevInsight
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Frontend changes: Edit files in `client/src/`
   - Backend changes: Edit files in `server/`

4. **Test locally**

   ```bash
   npm run dev:both
   ```

5. **Commit your changes**

   ```bash
   git commit -m "✨ Add amazing feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### **Development Guidelines**

- **Code Style**: Follow existing patterns and use meaningful variable names
- **Components**: Keep React components small and focused
- **API**: Maintain RESTful principles for backend endpoints
- **Testing**: Add tests for new features when possible
- **Documentation**: Update README for significant changes

### **Reporting Issues**

Found a bug? Have a feature request?

[🐛 Report an Issue](https://github.com/maaz404/DevInsight/issues/new)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Maaz Sheikh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 👨‍💻 Author

<div align="center">

**Maaz Sheikh**

[![GitHub](https://img.shields.io/badge/GitHub-@maaz404-181717?style=flat&logo=github)](https://github.com/maaz404)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Maaz%20Sheikh-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/sheikhmaazakbar/)

_Full-Stack Developer passionate about AI-powered solutions_

</div>

---

<div align="center">

### **⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/maaz404/DevInsight?style=social)](https://github.com/maaz404/DevInsight/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/maaz404/DevInsight?style=social)](https://github.com/maaz404/DevInsight/network/members)

**Made with ❤️ and automated with 🚀 GitHub Actions**

[⬆️ Back to Top](#devinsight-)

</div>
