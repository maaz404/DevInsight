import React, { useState } from 'react';
import axios from 'axios';
import InputBox from '../components/InputBox';
import ResultCard from '../components/ResultCard';
import ScoreMeter from '../components/ScoreMeter';
import Loader from '../components/Loader';

const AnalyzeRepo = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setResults(null);
      
      console.log('Submitting analysis for:', repoUrl); // Debug log
      
      const response = await axios.post('/api/analyze', {
        repoUrl: repoUrl.trim()
      });
      
      console.log('Analysis response:', response.data);
      setResults(response.data);
      
    } catch (error) {
      console.error('Analysis error:', error);
      console.error('Error response:', error.response?.data); // Show server error
      console.error('Error status:', error.response?.status); // Show status code
      
      // Show the specific server error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to analyze repository. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    setRepoUrl(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analyze GitHub Repository
          </h1>
          <p className="text-gray-600">
            Get AI-powered insights into code quality, structure, and best practices
          </p>
        </header>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputBox
              label="GitHub Repository URL"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={handleUrlChange}
              error={error}
              required
              helperText="Enter the complete GitHub repository URL (e.g., https://github.com/facebook/react)"
            />
            
            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              {loading ? 'Analyzing...' : 'Analyze Repository'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <Loader />
            <p className="text-gray-600 mt-4">
              Analyzing repository... This may take a few moments.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && results.success && (
          <div className="space-y-6">
            {/* Repository Information */}
            <ResultCard title="Repository Information" variant="default">
              <div className="grid grid-cols-2 gap-4">
                <ResultCard.Section 
                  label="Repository" 
                  value={`${results.repositoryInfo?.owner}/${results.repositoryInfo?.repo}` || 'N/A'}
                />
                <ResultCard.Section 
                  label="Analysis Date" 
                  value={new Date().toLocaleDateString()} 
                />
                <ResultCard.Section 
                  label="Files Analyzed" 
                  value={results.repositoryInfo?.totalFiles || 0}
                />
                <ResultCard.Section 
                  label="Code Files" 
                  value={results.repositoryInfo?.codeFiles || 0}
                />
              </div>
            </ResultCard>

            {/* AI Analysis Results */}
            {results.aiAnalysis && (
              <ResultCard title="🤖 AI Analysis Results" variant="gradient">
                
                {/* Readiness Score */}
                <div className="mb-6">
                  <ScoreMeter 
                    score={results.aiAnalysis.readinessScore || 0} 
                    label="Overall Readiness Score"
                    colorScheme="default"
                  />
                </div>

                {/* Code Quality */}
                {results.aiAnalysis.codeQuality && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">💻 Code Quality Assessment</h4>
                    <ScoreMeter 
                      score={results.aiAnalysis.codeQuality.score || 0} 
                      label="Code Quality Score"
                      size="small"
                      colorScheme="blue"
                    />
                    
                    {results.aiAnalysis.codeQuality.comments && results.aiAnalysis.codeQuality.comments.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Comments:</p>
                        <ResultCard.List 
                          items={results.aiAnalysis.codeQuality.comments} 
                          type="info" 
                        />
                      </div>
                    )}
                    
                    {results.aiAnalysis.codeQuality.strengths && results.aiAnalysis.codeQuality.strengths.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-green-700 mb-2">Strengths:</p>
                        <ResultCard.List 
                          items={results.aiAnalysis.codeQuality.strengths} 
                          type="success" 
                        />
                      </div>
                    )}
                    
                    {results.aiAnalysis.codeQuality.improvements && results.aiAnalysis.codeQuality.improvements.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-yellow-700 mb-2">Suggested Improvements:</p>
                        <ResultCard.List 
                          items={results.aiAnalysis.codeQuality.improvements} 
                          type="improvement" 
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* README Quality */}
                {results.aiAnalysis.readmeQuality && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">📖 README Analysis</h4>
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        results.aiAnalysis.readmeQuality.exists 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {results.aiAnalysis.readmeQuality.exists ? '✅ README Found' : '❌ No README'}
                      </span>
                      {results.aiAnalysis.readmeQuality.score && (
                        <ScoreMeter 
                          score={results.aiAnalysis.readmeQuality.score} 
                          label="README Quality"
                          size="small"
                          colorScheme="purple"
                        />
                      )}
                    </div>
                    {results.aiAnalysis.readmeQuality.feedback && (
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {results.aiAnalysis.readmeQuality.feedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Overall Summary */}
                {results.aiAnalysis.overallSummary && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">📋 Overall Summary</h4>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-blue-800">{results.aiAnalysis.overallSummary}</p>
                    </div>
                  </div>
                )}
              </ResultCard>
            )}

            {/* Analysis Details */}
            <ResultCard title="Analysis Details" variant="info">
              <div className="grid grid-cols-2 gap-4">
                <ResultCard.Section 
                  label="Processing Time" 
                  value={results.processingTime || 'N/A'}
                />
                <ResultCard.Section 
                  label="Analysis ID" 
                  value={results.databaseId || 'Not saved'}
                />
                <ResultCard.Section 
                  label="Database Status" 
                  value={results.savedToDatabase ? 'Saved' : 'Not saved'}
                />
                <ResultCard.Section 
                  label="Analysis Type" 
                  value="AI-Powered Analysis"
                />
              </div>
            </ResultCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeRepo;
