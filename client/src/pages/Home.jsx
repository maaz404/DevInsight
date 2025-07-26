import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '../components/CTAButton';
import ResultBox from '../components/ResultBox';
import BadgePill from '../components/BadgePill';
import NeoBrutalistCard from '../components/NeoBrutalistCard';

const Home = () => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');

  const handleAnalyze = () => {
    if (repoUrl.trim()) {
      navigate('/analyze', { state: { repoUrl: repoUrl.trim() } });
    }
  };

  const features = [
    {
      icon: '📄',
      title: 'README Analysis',
      description: 'AI-powered documentation quality assessment with actionable insights',
      color: 'neo-green'
    },
    {
      icon: '📦',
      title: 'Dependency Health',
      description: 'Check for outdated packages, security vulnerabilities, and optimization opportunities',
      color: 'neo-blue'
    },
    {
      icon: '🐛',
      title: 'Code Quality Scan',
      description: 'Automated detection of code smells, complexity issues, and best practice violations',
      color: 'neo-pink'
    },
    {
      icon: '⭐',
      title: 'GitHub Metrics',
      description: 'Comprehensive analysis of repository activity, community engagement, and project health',
      color: 'yellow'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Repositories Analyzed', icon: '📊' },
    { number: '95%', label: 'Accuracy Rate', icon: '🎯' },
    { number: '5sec', label: 'Average Analysis Time', icon: '⚡' },
    { number: '24/7', label: 'Available', icon: '🚀' }
  ];

  return (
    <div className="min-h-screen bg-pastel-yellow">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-black mb-6 transform -rotate-2">
            Hi, I'm DevInsight 👀
          </h1>
          <p className="text-xl md:text-2xl text-black/80 mb-8 font-body max-w-3xl mx-auto">
            Your AI-powered GitHub repository analyzer that provides instant insights about code quality, 
            documentation, dependencies, and project health. Get actionable recommendations in seconds! ⚡
          </p>
          
          {/* Demo Badge */}
          <div className="flex justify-center mb-8">
            <BadgePill color="neo-green" size="lg">
              ✨ Free • No Signup Required • Instant Results
            </BadgePill>
          </div>
        </div>
      </section>

      {/* Input Section */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <NeoBrutalistCard className="text-center" background="white">
            <div className="space-y-6">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-black">
                Analyze Your Repository 🔍
              </h2>
              <p className="text-black/70 text-lg">
                Paste your GitHub repository URL below and get instant AI-powered insights
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="flex-1 px-4 py-4 border-4 border-black font-mono text-lg focus:outline-none focus:ring-0 transform hover:-rotate-1 transition-transform"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <CTAButton 
                  onClick={handleAnalyze}
                  disabled={!repoUrl.trim()}
                  size="lg"
                  color="green"
                  className="whitespace-nowrap"
                >
                  Analyze Now! 🚀
                </CTAButton>
              </div>
            </div>
          </NeoBrutalistCard>
        </div>
      </section>

      {/* Demo Terminal Output */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <ResultBox 
            title="Live Demo Analysis 🖥️"
            status="success"
            content={`> DevInsight AI Analysis Engine v2.0
> Repository: https://github.com/facebook/react
> Status: Analysis Complete ✅

📄 README Quality Score: 92/100
   ✅ Comprehensive documentation
   ✅ Clear installation instructions
   ✅ Usage examples provided
   ⚠️  Could include more troubleshooting tips

📦 Dependencies Health: 88/100  
   ✅ All packages up to date
   ✅ No critical vulnerabilities found
   ✅ Optimal bundle size

🐛 Code Quality: 95/100
   ✅ Excellent test coverage (97%)
   ✅ Consistent coding standards
   ✅ Low complexity score

⭐ GitHub Metrics: 98/100
   ✅ High community engagement
   ✅ Regular maintenance
   ✅ Strong contributor base

🎉 Overall Score: 93/100 - Excellent Repository!

💡 AI Recommendations:
• Consider adding more detailed API documentation
• Expand troubleshooting section in README
• Great work overall! This is a well-maintained project 🌟`}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-4xl md:text-5xl text-black mb-4 transform rotate-1">
              What We Analyze 🔬
            </h2>
            <p className="text-xl text-black/70 max-w-3xl mx-auto">
              Our AI examines every aspect of your repository to give you comprehensive insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <NeoBrutalistCard 
                key={index} 
                background={index % 2 === 0 ? 'pastel-pink' : 'neo-blue'}
                className="transform hover:rotate-2 transition-transform duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{feature.icon}</div>
                    <h3 className="font-display font-bold text-xl text-black">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-black/80 font-body">
                    {feature.description}
                  </p>
                  <div className="flex justify-start">
                    <BadgePill color={feature.color} size="sm">
                      AI-Powered ✨
                    </BadgePill>
                  </div>
                </div>
              </NeoBrutalistCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <NeoBrutalistCard background="white" className="text-center">
            <div className="space-y-8">
              <h2 className="font-display font-black text-3xl md:text-4xl text-black transform -rotate-1">
                Trusted by Developers Worldwide 🌍
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-3xl">{stat.icon}</div>
                    <div className="font-display font-black text-2xl md:text-3xl text-black">
                      {stat.number}
                    </div>
                    <div className="text-black/70 font-body text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeoBrutalistCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <NeoBrutalistCard background="neo-green" className="text-center">
            <div className="space-y-6">
              <h2 className="font-display font-black text-3xl md:text-4xl text-black transform rotate-1">
                Ready to Optimize Your Repository? 🚀
              </h2>
              <p className="text-black/80 text-lg max-w-2xl mx-auto">
                Join thousands of developers who use DevInsight to improve their code quality, 
                documentation, and project health. Get started in seconds!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <CTAButton 
                  onClick={() => document.querySelector('input').focus()}
                  size="xl"
                  color="black"
                >
                  Start Free Analysis 🎯
                </CTAButton>
                <a 
                  href="https://github.com/maaz404/Devinsight" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <CTAButton size="xl" color="blue">
                    View Source Code 💻
                  </CTAButton>
                </a>
              </div>
              
              <div className="flex justify-center">
                <BadgePill color="white" size="lg">
                  ⭐ Open Source • MIT License • Community Driven
                </BadgePill>
              </div>
            </div>
          </NeoBrutalistCard>
        </div>
      </section>
    </div>
  );
};

export default Home;
