# DevInsight 🔍

**AI-Powered GitHub Repository Analysis Tool**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://maaz404.github.io/Devinsight)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)

A full-stack MERN application that analyzes GitHub repositories across multiple dimensions: documentation quality, dependency health, code quality, and repository metrics.

## ✨ Features

- **📄 README Analysis** - Documentation completeness and structure evaluation
- **📦 Dependency Health** - Package security and maintenance status checking
- **🐛 Code Quality** - Function complexity and design pattern analysis
- **📊 GitHub Metrics** - Repository popularity and community engagement
- **📱 Mobile Responsive** - Optimized for all devices with dark/light themes
- **⚡ Real-time Analysis** - Live progress tracking with detailed results

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token (recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/maaz404/Devinsight.git
cd Devinsight

# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install

# Environment configuration
# Create server/.env with:
GITHUB_TOKEN=your_github_token_here
MONGODB_URI=your_mongodb_uri_here (optional)
PORT=5000

# Start application
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

Access at: `http://localhost:5173`

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Ant Design, Tailwind CSS  
**Backend:** Node.js, Express.js, MongoDB Atlas  
**APIs:** GitHub REST API, npm Registry

## 📋 API Usage

**POST** `/api/analyze`

```json
{
  "repoUrl": "https://github.com/username/repository"
}
```

Returns comprehensive analysis with scores for README quality, dependency health, code quality, and GitHub metrics.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ for developers by developers
