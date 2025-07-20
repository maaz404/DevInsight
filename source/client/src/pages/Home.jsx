import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          DevInsight
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered GitHub Repository Analyzer
        </p>
        <div className="w-24 h-1 bg-primary-500 mx-auto"></div>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Unlock Insights from Your GitHub Repositories
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Get comprehensive analysis of code quality, complexity, and development patterns 
            using advanced AI algorithms. Perfect for developers, teams, and project managers.
          </p>
          <Link
            to="/analyze"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Start Analyzing
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Code Quality Analysis</h3>
          <p className="text-gray-600">
            Comprehensive analysis of code quality metrics, best practices, and potential improvements.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Performance Insights</h3>
          <p className="text-gray-600">
            Identify performance bottlenecks and get AI-powered suggestions for optimization.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Team Collaboration</h3>
          <p className="text-gray-600">
            Analyze collaboration patterns, contribution metrics, and team productivity insights.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500">
        <p>&copy; 2025 DevInsight. Built with React, Node.js, and AI.</p>
      </footer>
    </div>
  )
}

export default Home;
