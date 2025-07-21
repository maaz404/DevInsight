# DevInsight 🔍 - AI-Powered GitHub Repository Analyzer

🚀 **Transform your GitHub repositories into actionable insights with comprehensive multi-dimensional analysis**

[![Deploy to GitHub Pages](https://github.com/maaz404/Devinsight/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/maaz404/Devinsight/actions/workflows/deploy-frontend.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://maaz404.github.io/Devinsight)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://mongodb.com/)

## 🌟 Overview

DevInsight is a comprehensive full-stack application that analyzes GitHub repositories using advanced AI and multiple analysis engines to provide detailed insights about code quality, documentation, dependencies, and development practices. Built with enterprise-grade resilience and mobile-first design principles.

## ✨ Core Features

### 🔍 **Multi-Dimensional Analysis Engine**

- **📄 README Quality Assessment** - Documentation completeness, structure, and clarity analysis
- **📦 Dependency Health Check** - Real-time package security, outdated dependencies, and maintenance status
- **🐛 Code Smell Detection** - Function complexity, design patterns, and code quality metrics
- **📊 GitHub API Metrics** - Repository popularity, activity, community engagement, and development velocity
- **🤖 AI-Powered Recommendations** - OpenAI-driven actionable insights and improvement suggestions

### 🎨 **Modern User Experience**

- **📱 Fully Mobile Responsive** - Optimized layouts for desktop, tablet, and mobile devices
- **🌙 Adaptive Theming** - Dark/Light mode with Ant Design v5 components
- **⚡ Real-time Analysis** - Live progress tracking with detailed step-by-step feedback
- **📈 Interactive Dashboards** - Rich data visualizations and responsive charts
- **💾 Analysis History** - MongoDB-powered project tracking and result persistence

### 🛡️ **Enterprise-Grade Resilience**

- **🔄 Network Resilience** - Comprehensive retry logic with exponential backoff
- **⏱️ Timeout Protection** - 30-second timeouts for all external API requests
- **🚨 Graceful Degradation** - Provides partial results when services fail
- **📁 Missing File Tolerance** - Works seamlessly without README or package.json files
- **🔑 GitHub Token Support** - Enhanced rate limits (5000 vs 60 requests/hour)
- **🔒 Security Focused** - Rate limiting, input validation, and secure token handling

## 🏗️ Architecture

```
DevInsight/
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AntdScoreMeter.jsx
│   │   │   ├── InputBox.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ScoreMeter.jsx
│   │   ├── features/          # Feature-specific components
│   │   │   ├── readme-analyzer/
│   │   │   ├── dependency-analyzer/
│   │   │   ├── code-smell-scanner/
│   │   │   └── github-api-analyzer/
│   │   ├── pages/            # Main application pages
│   │   │   ├── Home.jsx
│   │   │   └── AnalyzeRepo.jsx
│   │   └── theme/            # Ant Design theme configuration
│   │       ├── antdTheme.js
│   │       └── ThemeProvider.jsx
│   └── public/               # Static assets
└── server/                   # Node.js + Express Backend
    ├── features/             # Modular analysis engines
    │   ├── readme-analyzer/  # Documentation quality analysis
    │   ├── dependency-analyzer/ # Package health checking
    │   ├── code-smell-scanner/  # Code quality analysis
    │   └── github-api-analyzer/ # Repository metrics
    ├── middleware/           # Rate limiting and validation
    ├── models/              # MongoDB data models
    ├── routes/              # API route handlers
    └── services/            # External service integrations
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ with npm/yarn
- **GitHub Personal Access Token** (recommended for enhanced rate limits)
- **MongoDB Atlas** account (optional - app works without database)
- **OpenAI API Key** (optional - for AI analysis features)

### Installation

1. **Clone and Setup**

```bash
git clone https://github.com/maaz404/Devinsight.git
cd Devinsight
```

2. **Backend Setup**

```bash
cd server
npm install
```

3. **Frontend Setup**

```bash
cd ../client
npm install
```

4. **Environment Configuration**
   Create `server/.env`:

```env
# GitHub API Configuration (Highly Recommended)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devinsight
MONGODB_DATABASE=devinsight

# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration (Optional)
OPENAI_API_KEY=sk-your_openai_api_key
```

5. **Launch Application**

```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

Access at: `http://localhost:5173`

## 📊 API Documentation

### POST /api/analyze

Comprehensive repository analysis endpoint with resilient error handling.

**Request:**

```json
{
  "repoUrl": "https://github.com/username/repository"
}
```

**Response:**

```json
{
  "success": true,
  "repositoryInfo": {
    "owner": "username",
    "repo": "repository",
    "url": "https://github.com/username/repository"
  },
  "readmeAnalysis": {
    "score": 85,
    "hasReadme": true,
    "sections": {
      "installation": true,
      "usage": true,
      "api": false,
      "contributing": true
    },
    "recommendations": [
      "Add API documentation section",
      "Include usage examples"
    ],
    "error": null
  },
  "dependencyAnalysis": {
    "totalDependencies": 45,
    "outdatedDependencies": 3,
    "securityVulnerabilities": 0,
    "healthScore": 92,
    "packages": [
      {
        "name": "react",
        "current": "17.0.2",
        "latest": "18.2.0",
        "status": "outdated"
      }
    ],
    "error": null
  },
  "codeSmellAnalysis": {
    "score": 78,
    "totalIssues": 5,
    "criticalIssues": 0,
    "issues": [
      {
        "type": "Large Function",
        "severity": "medium",
        "suggestion": "Consider breaking down complex functions"
      }
    ],
    "error": null
  },
  "githubMetrics": {
    "stars": 1250,
    "forks": 89,
    "openIssues": 12,
    "closedIssues": 156,
    "recentActivity": "Very Active",
    "popularityScore": 88,
    "healthScore": 91,
    "contributors": 15,
    "error": null
  },
  "aiAnalysis": {
    "overallScore": 84,
    "summary": "Well-maintained project with good documentation and active community",
    "recommendations": [
      "Update outdated dependencies",
      "Add comprehensive test coverage",
      "Consider adding contributing guidelines"
    ]
  },
  "processingTime": "2.3s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Handling

- **Missing Files**: Returns structured results with fallback values
- **API Failures**: Implements retry logic with exponential backoff
- **Rate Limiting**: Graceful handling with informative error messages
- **Network Issues**: Timeout protection and partial result delivery

## 🛠️ Feature Details

### 📄 README Analyzer

**Capabilities:**

- Documentation structure validation
- Content quality assessment
- Missing section detection
- Best practices compliance
- Installation guide verification

**Error Resilience:**

- Handles missing README files gracefully
- Provides fallback analysis with score of 0
- Returns structured recommendations for improvement

### 📦 Dependency Analyzer

**Capabilities:**

- Real-time npm registry queries
- Outdated package detection
- Security vulnerability scanning
- License compatibility checking
- Bundle size impact analysis

**Performance Features:**

- Batch processing (5 packages at a time)
- Concurrent API requests with Promise.allSettled
- 30-second timeout protection per batch

### 🐛 Code Smell Scanner

**Detection Areas:**

- Function complexity analysis
- Code duplication identification
- Design pattern violations
- Performance anti-patterns
- Maintainability metrics

**Analysis Scope:**

- JavaScript/TypeScript files
- React component patterns
- Node.js best practices
- General code quality principles

### 📊 GitHub Metrics Analyzer

**Metrics Tracked:**

- Repository popularity (stars, forks, watchers)
- Development activity (commits, releases, issues)
- Community engagement (contributors, discussions)
- Project health (maintenance, responsiveness)
- Language diversity and distribution

**API Integration:**

- GitHub REST API v3
- Enhanced rate limits with token authentication
- Comprehensive retry logic for reliability

## 🔧 Configuration Guide

### GitHub Token Setup

1. **Generate Token**: GitHub Settings → Developer settings → Personal access tokens → Generate new token
2. **Required Permissions**:
   - `public_repo` - Access public repositories
   - `read:user` - Read user profile information
   - `repo:status` - Access commit status
3. **Add to Environment**: `GITHUB_TOKEN=ghp_your_token_here`
4. **Benefits**: 5000 requests/hour vs 60 without token

### MongoDB Setup (Optional)

1. **Create Cluster**: MongoDB Atlas → Create new cluster
2. **Database Access**: Create user with read/write permissions
3. **Network Access**: Add your IP address to whitelist
4. **Connection String**: Add to `.env` as `MONGODB_URI`
5. **Graceful Fallback**: Application continues without database

### OpenAI Integration (Optional)

1. **API Key**: OpenAI Dashboard → API Keys → Create new key
2. **Usage**: Powers AI-driven analysis and recommendations
3. **Fallback**: Mock analysis provided when unavailable

## 📱 Mobile Optimization

**Responsive Breakpoints:**

- **Mobile**: 320px - 767px (optimized layouts)
- **Tablet**: 768px - 1199px (adaptive components)
- **Desktop**: 1200px+ (full feature set)

**Mobile Features:**

- Touch-friendly interface design
- Condensed information layouts
- Optimized loading states
- Responsive data visualizations
- Thumb-friendly navigation

## 🚨 Troubleshooting

### Common Issues

**❌ 401 Authorization Errors**

```bash
# Solutions:
1. Verify GitHub token validity
2. Check token permissions (public_repo, read:user)
3. Ensure .env file is in server/ directory
4. Restart server after token changes
```

**❌ Analysis Timeouts**

```bash
# Solutions:
1. Check internet connectivity
2. Try with smaller repositories first
3. Verify GitHub API status
4. Increase timeout in configuration
```

**❌ Database Connection Issues**

```bash
# Solutions:
1. Verify MongoDB URI format
2. Check network connectivity
3. Validate database credentials
4. Application continues without database
```

**❌ Port Conflicts**

```bash
# Solutions:
1. Change port: PORT=5001 in .env
2. Kill existing processes: taskkill /F /IM node.exe
3. Check for other applications using ports
```

### Performance Tips

- Use GitHub token for optimal rate limits
- Large repositories may take 30-60 seconds
- Batch processing handles extensive dependencies
- Consider result caching for frequent analyses

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
DEBUG=true
```

## 🧪 Development

### Project Standards

- **Modular Architecture**: Feature-based organization
- **Error-First Design**: Comprehensive error handling
- **Responsive Development**: Mobile-first approach
- **Performance Focused**: Optimized API interactions
- **Security Conscious**: Input validation and sanitization

### Adding New Analysis Features

1. **Create Feature Directory**: `server/features/new-analyzer/`
2. **Implement Core Logic**: `index.js` with error handling
3. **Add API Routes**: `routes.js` with validation
4. **Integrate Main Route**: Update `server/routes/analyze.js`
5. **Frontend Component**: Create corresponding UI component
6. **Documentation**: Update API docs and README

### Testing Strategy

```bash
# Backend testing
cd server
npm test

# Frontend testing
cd client
npm test

# End-to-end testing
npm run test:e2e
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork Repository**: Create your feature branch
2. **Follow Standards**: Use existing code style and patterns
3. **Add Error Handling**: Comprehensive error management required
4. **Include Tests**: Unit tests for new features
5. **Update Documentation**: README and API docs
6. **Pull Request**: Detailed description of changes

### Development Setup

```bash
git clone https://github.com/your-username/Devinsight.git
cd Devinsight
git checkout -b feature/amazing-feature
# Make changes
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Ant Design](https://ant.design/)** - React UI component library
- **[GitHub API](https://docs.github.com/en/rest)** - Repository data access
- **[npm Registry](https://registry.npmjs.org/)** - Package information source
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Database hosting platform
- **[Vite](https://vitejs.dev/)** - Frontend build tool and dev server
- **[OpenAI](https://openai.com/)** - AI-powered analysis capabilities

## 📧 Support & Community

- **🐛 Issues**: [GitHub Issues](https://github.com/maaz404/Devinsight/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/maaz404/Devinsight/discussions)
- **📖 Documentation**: [Project Wiki](https://github.com/maaz404/Devinsight/wiki)
- **🚀 Live Demo**: [DevInsight Demo](https://maaz404.github.io/Devinsight)

---

**DevInsight** - Empowering developers with comprehensive repository insights and actionable recommendations 🚀

_Built with ❤️ by developers, for developers_
