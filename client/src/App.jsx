import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AnalyzeRepo from './pages/AnalyzeRepo';
import NotFound from './pages/NotFound';

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-black text-white border-b-4 border-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display font-black text-xl text-white hover:text-neo-green transition-colors">
            DevInsight 👀
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`font-display font-bold transition-colors ${
                location.pathname === '/' ? 'text-neo-green' : 'text-white hover:text-neo-green'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/analyze" 
              className={`font-display font-bold transition-colors ${
                location.pathname === '/analyze' ? 'text-neo-green' : 'text-white hover:text-neo-green'
              }`}
            >
              Analyze
            </Link>
            <a 
              href="https://github.com/maaz404/Devinsight" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-neo-green transition-colors"
            >
              <div className="flex items-center gap-2 font-bold">
                <span>GitHub</span>
                <span className="text-lg">🔗</span>
              </div>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-display font-bold py-2 ${
                  location.pathname === '/' ? 'text-neo-green' : 'text-white'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/analyze" 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-display font-bold py-2 ${
                  location.pathname === '/analyze' ? 'text-neo-green' : 'text-white'
                }`}
              >
                Analyze
              </Link>
              <a 
                href="https://github.com/maaz404/Devinsight" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white font-bold py-2 flex items-center gap-2"
              >
                <span>GitHub</span>
                <span>🔗</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-white py-8 border-t-4 border-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display font-black text-xl mb-4 text-neo-green">
              DevInsight 👀
            </h3>
            <p className="text-white/80">
              AI-powered GitHub repository analysis tool that provides actionable insights for developers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-white/80 hover:text-neo-green transition-colors">
                Home
              </Link>
              <Link to="/analyze" className="block text-white/80 hover:text-neo-green transition-colors">
                Analyze Repository
              </Link>
              <a 
                href="https://github.com/maaz404/Devinsight" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-white/80 hover:text-neo-green transition-colors"
              >
                Source Code
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Features</h4>
            <div className="space-y-1 text-white/80 text-sm">
              <div>📄 README Analysis</div>
              <div>📦 Dependency Health Check</div>
              <div>🐛 Code Quality Scanning</div>
              <div>⭐ GitHub Metrics Analysis</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/60">
          <p>© 2024 DevInsight. Built with ❤️ and lots of ☕</p>
        </div>
      </div>
    </footer>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<AnalyzeRepo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
