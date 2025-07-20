# 🚀 DevInsight - AI-Powered Repository Analyzer

> **Transform your GitHub repositories into actionable insights with AI-powered analysis**

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange.svg)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue.svg)](https://tailwindcss.com/)

## 🌟 Overview

DevInsight is a comprehensive full-stack application that analyzes GitHub repositories using AI to provide detailed insights about code quality, documentation, and best practices. Get instant feedback on your projects with beautiful, actionable reports.

![DevInsight Demo](https://via.placeholder.com/800x400?text=Add+Your+App+Screenshot+Here)

## ✨ Features

### 🎯 **Core Functionality**

- **🔍 Repository Analysis** - Deep analysis of GitHub repositories
- **🤖 AI-Powered Insights** - GPT-4 powered code quality assessment
- **📊 Visual Reports** - Beautiful dashboards with score meters and metrics
- **💾 Data Persistence** - MongoDB storage for analysis history
- **🚀 Real-time Processing** - Fast analysis with progress indicators

### 🛡️ **Security & Performance**

- **🔒 Rate Limiting** - API protection and abuse prevention
- **✅ Input Validation** - Comprehensive request validation
- **🌐 CORS Protection** - Secure cross-origin requests
- **⚡ Optimized Performance** - Efficient data processing

### 🎨 **User Experience**

- **📱 Responsive Design** - Works on all devices
- **🎭 Beautiful UI** - Modern design with Tailwind CSS
- **🔄 Error Handling** - User-friendly error messages
- **📈 Progress Tracking** - Real-time analysis progress

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### **Backend**

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **OpenAI API** - GPT-4 for AI analysis

### **DevOps & Tools**

- **MongoDB Atlas** - Cloud database
- **Environment Variables** - Secure configuration
- **RESTful APIs** - Clean API architecture

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- MongoDB Atlas account
- OpenAI API key

### **Installation**

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/devinsight.git
cd devinsight
```

2. **Install dependencies**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**

```bash
# Copy environment template
cd ../server
cp .env.example .env
```

4. **Configure your `.env` file**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

5. **Start the application**

```bash
# Terminal 1 - Start backend server
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm start
```

6. **Access the application**

```
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

## 📖 Usage

1. **Enter GitHub Repository URL**

   - Navigate to the analysis page
   - Enter any public GitHub repository URL
   - Click "Analyze Repository"

2. **View AI Analysis**

   - Code quality assessment with scores
   - README quality evaluation
   - Improvement recommendations
   - Technical debt analysis

3. **Review Results**
   - Overall readiness score
   - Detailed breakdowns by category
   - Actionable improvement suggestions
   - Historical analysis data

## 🏗️ Project Structure

```
devinsight/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   └── index.js            # Server entry point
├── README.md
└── .gitignore
```

## 🔧 API Endpoints

### **Analysis**

- `POST /api/analyze` - Analyze GitHub repository
- `GET /api/analyze/test` - Test endpoint

### **Projects**

- `GET /api/projects` - Get all analyzed projects
- `GET /api/projects/:id` - Get specific project analysis

## 🎯 Key Features Demonstrated

### **Full-Stack Development**

- ✅ Frontend-backend communication
- ✅ RESTful API design
- ✅ Database integration
- ✅ External API integration (GitHub, OpenAI)

### **Modern React Development**

- ✅ Functional components with hooks
- ✅ Component composition
- ✅ State management
- ✅ Error boundaries

### **Backend Engineering**

- ✅ Express.js middleware
- ✅ MongoDB database design
- ✅ API rate limiting
- ✅ Input validation and sanitization

### **AI Integration**

- ✅ OpenAI GPT-4 API
- ✅ Prompt engineering
- ✅ AI response processing
- ✅ Intelligent code analysis

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**

```bash
cd client
npm run build
# Deploy build folder
```

### **Backend (Heroku/Railway)**

```bash
cd server
# Add Procfile: web: node index.js
# Configure environment variables
# Deploy to platform
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- GitHub for the repository API
- MongoDB for the database platform
- The amazing open-source community

## 📧 Contact

**Email** - maazakbar404@gmail.com

**Project Link:** https://github.com/maaz404/devinsight

---

⭐ **Star this repository if you found it helpful!**
