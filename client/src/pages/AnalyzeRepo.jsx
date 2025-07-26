import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CTAButton from '../components/CTAButton';
import ResultBox from '../components/ResultBox';
import BadgePill from '../components/BadgePill';
import NeoBrutalistCard from '../components/NeoBrutalistCard';

const AnalyzeRepo = () => {
  const location = useLocation();
  const [repoUrl, setRepoUrl] = useState(location.state?.repoUrl || '');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    if (location.state?.repoUrl) {
      handleAnalyze();
    }
  }, []);

  const simulateProgress = () => {
    const steps = [
      { step: 'Validating repository URL...', progress: 10 },
      { step: 'Analyzing README documentation...', progress: 25 },
      { step: 'Checking dependencies...', progress: 45 },
      { step: 'Scanning code quality...', progress: 65 },
      { step: 'Fetching GitHub metrics...', progress: 85 },
      { step: 'Generating insights...', progress: 95 },
      { step: 'Analysis complete!', progress: 100 }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setCurrentStep(steps[currentIndex].step);
        setProgress(steps[currentIndex].progress);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return interval;
  };

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setProgress(0);
    setCurrentStep('Starting analysis...');

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        repoUrl: repoUrl.trim()
      });

      console.log('Analysis response received:', response.data);
      
      // Transform the new backend structure to match frontend expectations
      const transformedData = {
        success: response.data.success,
        overallScore: response.data.data?.scores?.overall || 0,
        readmeScore: response.data.data?.scores?.breakdown?.readme || 0,
        dependencyScore: response.data.data?.scores?.breakdown?.dependencies || 0,
        codeQualityScore: response.data.data?.scores?.breakdown?.codeQuality || 0,
        githubScore: response.data.data?.scores?.breakdown?.github || 0,
        
        // Pass through additional data that might be useful
        repositoryInfo: response.data.data?.repositoryInfo,
        metadata: response.data.data?.metadata,
        recommendations: response.data.data?.recommendations,
        analysis: response.data.data?.analysis,
        
        // Create score breakdown for the detailed view
        scoreBreakdown: {
          readmeWeight: Math.round((response.data.data?.scores?.weights?.readme || 0.25) * 100),
          dependencyWeight: Math.round((response.data.data?.scores?.weights?.dependencies || 0.25) * 100),
          codeQualityWeight: Math.round((response.data.data?.scores?.weights?.codeQuality || 0.30) * 100),
          githubWeight: Math.round((response.data.data?.scores?.weights?.github || 0.20) * 100)
        }
      };

      console.log('Transformed scores:', {
        overall: transformedData.overallScore,
        readme: transformedData.readmeScore,
        dependency: transformedData.dependencyScore,
        codeQuality: transformedData.codeQualityScore,
        github: transformedData.githubScore
      });

      setTimeout(() => {
        setAnalysisResult(transformedData);
        setLoading(false);
        clearInterval(progressInterval);
      }, 6000);

    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to analyze repository. Please try again.');
      console.error('Analysis error:', err);
    }
  };

  const handleUrlChange = (e) => {
    setRepoUrl(e.target.value);
    if (error) setError(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'neo-green';
    if (score >= 60) return 'neo-blue';
    if (score >= 40) return 'yellow';
    return 'neo-pink';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    if (score >= 40) return '⚠️';
    return '🔧';
  };

  return (
    <div className="min-h-screen bg-pastel-yellow p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl md:text-6xl text-black mb-4 transform -rotate-1">
            Repository Analyzer 🔍
          </h1>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Get AI-powered insights about your GitHub repository's health, documentation, and code quality
          </p>
        </div>

        {/* Input Section */}
        <NeoBrutalistCard className="mb-8" background="white">
          <div className="space-y-4">
            <label className="block font-display font-bold text-lg text-black">
              GitHub Repository URL 📂
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={repoUrl}
                onChange={handleUrlChange}
                placeholder="https://github.com/username/repository"
                className="flex-1 px-4 py-3 border-4 border-black font-mono text-lg focus:outline-none focus:ring-0 transform hover:-rotate-1 transition-transform"
                disabled={loading}
              />
              <CTAButton
                onClick={handleAnalyze}
                disabled={loading || !repoUrl.trim()}
                size="lg"
                color="green"
                className="whitespace-nowrap"
              >
                {loading ? 'Analyzing... 🔄' : 'Analyze Now! 🚀'}
              </CTAButton>
            </div>
          </div>
        </NeoBrutalistCard>

        {/* Error Display */}
        {error && (
          <NeoBrutalistCard className="mb-8" background="neo-pink">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-display font-bold text-lg text-black">Oops! Something went wrong</h3>
                <p className="text-black/80">{error}</p>
              </div>
            </div>
          </NeoBrutalistCard>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <NeoBrutalistCard background="white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xl text-black">Analysis in Progress 🔄</h3>
                  <span className="font-bold text-lg">{progress}%</span>
                </div>
                <div className="w-full bg-black/20 h-4 border-2 border-black">
                  <div 
                    className="bg-neo-green h-full transition-all duration-500 border-r-2 border-black"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-black/70 font-mono">{currentStep}</p>
              </div>
            </NeoBrutalistCard>

            {/* Demo Terminal Output */}
            <ResultBox 
              title="Live Analysis Output 📟"
              loading={true}
              content={`> Initializing DevInsight analysis engine...
> Repository URL: ${repoUrl}
> ${currentStep}
> Processing... Please wait while we analyze your repository 🔄`}
            />
          </div>
        )}

        {/* Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Overall Score */}
            <NeoBrutalistCard background="white" className="text-center">
              <div className="space-y-4">
                <h2 className="font-display font-black text-3xl text-black transform -rotate-1">
                  Overall Score {getScoreEmoji(analysisResult.overallScore)}
                </h2>
                <div className="text-6xl font-black text-black">
                  {analysisResult.overallScore}/100
                </div>
                <div className="flex justify-center">
                  <BadgePill color={getScoreColor(analysisResult.overallScore)} size="lg">
                    {analysisResult.overallScore >= 80 ? 'Excellent' : 
                     analysisResult.overallScore >= 60 ? 'Good' :
                     analysisResult.overallScore >= 40 ? 'Fair' : 'Needs Work'}
                  </BadgePill>
                </div>
              </div>
            </NeoBrutalistCard>

            {/* Score Breakdown */}
            {analysisResult.scoreBreakdown && (
              <NeoBrutalistCard background="neo-yellow" className="mb-6">
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-2xl text-black flex items-center gap-3">
                    <span>📊</span>
                    Detailed Score Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 p-3 border-2 border-black">
                      <div className="font-bold text-black mb-2">Weight Distribution:</div>
                      <div className="space-y-1 text-black">
                        <div>📄 README: {analysisResult.scoreBreakdown.readmeWeight || 25}%</div>
                        <div>📦 Dependencies: {analysisResult.scoreBreakdown.dependencyWeight || 25}%</div>
                        <div>🐛 Code Quality: {analysisResult.scoreBreakdown.codeQualityWeight || 30}%</div>
                        <div>⭐ GitHub Metrics: {analysisResult.scoreBreakdown.githubWeight || 20}%</div>
                      </div>
                    </div>
                    <div className="bg-white/50 p-3 border-2 border-black">
                      <div className="font-bold text-black mb-2">Weighted Contributions:</div>
                      <div className="space-y-1 text-black">
                        <div>📄 README: {((analysisResult.readmeScore || 0) * (analysisResult.scoreBreakdown.readmeWeight || 25) / 100).toFixed(1)} pts</div>
                        <div>📦 Dependencies: {((analysisResult.dependencyScore || 0) * (analysisResult.scoreBreakdown.dependencyWeight || 25) / 100).toFixed(1)} pts</div>
                        <div>🐛 Code Quality: {((analysisResult.codeQualityScore || 0) * (analysisResult.scoreBreakdown.codeQualityWeight || 30) / 100).toFixed(1)} pts</div>
                        <div>⭐ GitHub Metrics: {((analysisResult.githubScore || 0) * (analysisResult.scoreBreakdown.githubWeight || 20) / 100).toFixed(1)} pts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </NeoBrutalistCard>
            )}

            {/* Individual Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  name: 'README Quality', 
                  score: analysisResult.readmeScore, 
                  icon: '📄',
                  details: analysisResult.readmeAnalysis?.sections || 'Comprehensive documentation analysis'
                },
                { 
                  name: 'Dependencies', 
                  score: analysisResult.dependencyScore, 
                  icon: '📦',
                  details: analysisResult.dependencyAnalysis?.total_dependencies ? 
                    `${analysisResult.dependencyAnalysis.total_dependencies} total dependencies` : 
                    'Dependency security and health check'
                },
                { 
                  name: 'Code Quality', 
                  score: analysisResult.codeQualityScore, 
                  icon: '🐛',
                  details: analysisResult.codeQualityAnalysis?.total_files ? 
                    `${analysisResult.codeQualityAnalysis.total_files} files analyzed` : 
                    'Code complexity and smell detection'
                },
                { 
                  name: 'GitHub Metrics', 
                  score: analysisResult.githubScore, 
                  icon: '⭐',
                  details: analysisResult.githubAnalysis?.stars !== undefined ? 
                    `${analysisResult.githubAnalysis.stars} stars, ${analysisResult.githubAnalysis.forks} forks` : 
                    'Repository activity and engagement'
                }
              ].map((metric, index) => (
                <NeoBrutalistCard key={index} background="pastel-pink" className="text-center">
                  <div className="space-y-2">
                    <div className="text-2xl">{metric.icon}</div>
                    <h3 className="font-display font-bold text-sm text-black">{metric.name}</h3>
                    <div className="text-2xl font-black text-black">{metric.score}/100</div>
                    <BadgePill color={getScoreColor(metric.score)} size="sm">
                      {metric.score >= 80 ? 'Great' : 
                       metric.score >= 60 ? 'Good' :
                       metric.score >= 40 ? 'OK' : 'Poor'}
                    </BadgePill>
                    <div className="text-xs text-black/70 mt-2 leading-tight">
                      {typeof metric.details === 'string' ? metric.details : 'Analysis complete'}
                    </div>
                  </div>
                </NeoBrutalistCard>
              ))}
            </div>

            {/* Detailed Analytics */}
            <div className="space-y-6">
              {/* README Analysis */}
              {analysisResult.readmeAnalysis && (
                <NeoBrutalistCard background="neo-green">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-2xl text-black flex items-center gap-3">
                      <span>📄</span>
                      README Analysis ({analysisResult.readmeScore}/100)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Documentation Quality</h4>
                        <div className="space-y-2 text-sm text-black">
                          {typeof analysisResult.readmeAnalysis === 'object' ? (
                            <>
                              <div>Length: {analysisResult.readmeAnalysis.length || 'Unknown'} characters</div>
                              <div>Sections: {analysisResult.readmeAnalysis.sections || 'Basic structure'}</div>
                              <div>Installation Guide: {analysisResult.readmeAnalysis.hasInstallation ? '✅' : '❌'}</div>
                              <div>Usage Examples: {analysisResult.readmeAnalysis.hasUsage ? '✅' : '❌'}</div>
                              <div>Contributing Guide: {analysisResult.readmeAnalysis.hasContributing ? '✅' : '❌'}</div>
                            </>
                          ) : (
                            <div>{analysisResult.readmeAnalysis}</div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Recommendations</h4>
                        <div className="space-y-1 text-sm text-black">
                          {analysisResult.readmeScore < 60 && (
                            <>
                              <div>• Add comprehensive installation instructions</div>
                              <div>• Include usage examples and code snippets</div>
                              <div>• Add contributing guidelines</div>
                              <div>• Include project description and features</div>
                            </>
                          )}
                          {analysisResult.readmeScore >= 60 && analysisResult.readmeScore < 80 && (
                            <>
                              <div>• Enhance existing sections with more detail</div>
                              <div>• Add badges for build status and coverage</div>
                              <div>• Include API documentation</div>
                            </>
                          )}
                          {analysisResult.readmeScore >= 80 && (
                            <div>• Excellent documentation! Consider adding screenshots or diagrams</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NeoBrutalistCard>
              )}

              {/* Dependencies Analysis */}
              {analysisResult.dependencyAnalysis && (
                <NeoBrutalistCard background="neo-purple">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-2xl text-black flex items-center gap-3">
                      <span>📦</span>
                      Dependency Analysis ({analysisResult.dependencyScore}/100)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Package Overview</h4>
                        <div className="space-y-2 text-sm text-black">
                          {typeof analysisResult.dependencyAnalysis === 'object' ? (
                            <>
                              <div>Total: {analysisResult.dependencyAnalysis.total_dependencies || 0}</div>
                              <div>Production: {analysisResult.dependencyAnalysis.dependencies || 0}</div>
                              <div>Development: {analysisResult.dependencyAnalysis.devDependencies || 0}</div>
                              <div>Outdated: {analysisResult.dependencyAnalysis.outdated || 0}</div>
                            </>
                          ) : (
                            <div>{analysisResult.dependencyAnalysis}</div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Security Status</h4>
                        <div className="space-y-2 text-sm text-black">
                          <div>Vulnerabilities: {analysisResult.dependencyAnalysis.vulnerabilities || 0}</div>
                          <div>Security Score: {analysisResult.dependencyAnalysis.securityScore || 'Unknown'}</div>
                          <div>License Issues: {analysisResult.dependencyAnalysis.licenseIssues || 0}</div>
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Action Items</h4>
                        <div className="space-y-1 text-sm text-black">
                          {analysisResult.dependencyScore < 60 && (
                            <>
                              <div>• Update outdated packages</div>
                              <div>• Review security vulnerabilities</div>
                              <div>• Audit license compatibility</div>
                            </>
                          )}
                          {analysisResult.dependencyScore >= 60 && (
                            <div>• Dependencies are well maintained</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NeoBrutalistCard>
              )}

              {/* Code Quality Analysis */}
              {analysisResult.codeQualityAnalysis && (
                <NeoBrutalistCard background="neo-blue">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-2xl text-black flex items-center gap-3">
                      <span>🐛</span>
                      Code Quality Analysis ({analysisResult.codeQualityScore}/100)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Code Metrics</h4>
                        <div className="space-y-2 text-sm text-black">
                          {typeof analysisResult.codeQualityAnalysis === 'object' ? (
                            <>
                              <div>Files Analyzed: {analysisResult.codeQualityAnalysis.total_files || 0}</div>
                              <div>Lines of Code: {analysisResult.codeQualityAnalysis.total_lines || 0}</div>
                              <div>Functions: {analysisResult.codeQualityAnalysis.total_functions || 0}</div>
                              <div>Complexity Score: {analysisResult.codeQualityAnalysis.complexity_score || 'N/A'}</div>
                            </>
                          ) : (
                            <div>{analysisResult.codeQualityAnalysis}</div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Code Smells</h4>
                        <div className="space-y-2 text-sm text-black">
                          <div>Long Functions: {analysisResult.codeQualityAnalysis.long_functions || 0}</div>
                          <div>Large Files: {analysisResult.codeQualityAnalysis.large_files || 0}</div>
                          <div>Duplicate Code: {analysisResult.codeQualityAnalysis.duplicates || 0}</div>
                          <div>Magic Numbers: {analysisResult.codeQualityAnalysis.magic_numbers || 0}</div>
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Improvement Areas</h4>
                        <div className="space-y-1 text-sm text-black">
                          {analysisResult.codeQualityScore < 60 && (
                            <>
                              <div>• Refactor large functions</div>
                              <div>• Add code documentation</div>
                              <div>• Reduce file complexity</div>
                              <div>• Implement error handling</div>
                            </>
                          )}
                          {analysisResult.codeQualityScore >= 60 && analysisResult.codeQualityScore < 80 && (
                            <>
                              <div>• Add unit tests</div>
                              <div>• Improve code comments</div>
                              <div>• Consider design patterns</div>
                            </>
                          )}
                          {analysisResult.codeQualityScore >= 80 && (
                            <div>• Code quality is excellent!</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NeoBrutalistCard>
              )}

              {/* GitHub Metrics Analysis */}
              {analysisResult.githubAnalysis && (
                <NeoBrutalistCard background="neo-red">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-2xl text-black flex items-center gap-3">
                      <span>⭐</span>
                      GitHub Metrics Analysis ({analysisResult.githubScore}/100)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Repository Stats</h4>
                        <div className="space-y-2 text-sm text-black">
                          {typeof analysisResult.githubAnalysis === 'object' ? (
                            <>
                              <div>⭐ Stars: {analysisResult.githubAnalysis.stars || 0}</div>
                              <div>🍴 Forks: {analysisResult.githubAnalysis.forks || 0}</div>
                              <div>👁️ Watchers: {analysisResult.githubAnalysis.watchers || 0}</div>
                              <div>📊 Size: {analysisResult.githubAnalysis.size || 0} KB</div>
                            </>
                          ) : (
                            <div>{analysisResult.githubAnalysis}</div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Activity Metrics</h4>
                        <div className="space-y-2 text-sm text-black">
                          <div>Issues: {analysisResult.githubAnalysis.open_issues || 0}</div>
                          <div>Last Push: {analysisResult.githubAnalysis.last_push || 'Unknown'}</div>
                          <div>Contributors: {analysisResult.githubAnalysis.contributors || 1}</div>
                          <div>Commits: {analysisResult.githubAnalysis.commits || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Health Indicators</h4>
                        <div className="space-y-2 text-sm text-black">
                          <div>License: {analysisResult.githubAnalysis.license ? '✅' : '❌'}</div>
                          <div>README: {analysisResult.githubAnalysis.has_readme ? '✅' : '❌'}</div>
                          <div>Issues: {analysisResult.githubAnalysis.has_issues ? '✅' : '❌'}</div>
                          <div>Wiki: {analysisResult.githubAnalysis.has_wiki ? '✅' : '❌'}</div>
                        </div>
                      </div>
                      <div className="bg-white/50 p-4 border-2 border-black">
                        <h4 className="font-bold text-black mb-2">Growth Tips</h4>
                        <div className="space-y-1 text-sm text-black">
                          {analysisResult.githubScore < 40 && (
                            <>
                              <div>• Add comprehensive README</div>
                              <div>• Enable GitHub Pages</div>
                              <div>• Add project license</div>
                              <div>• Encourage contributions</div>
                            </>
                          )}
                          {analysisResult.githubScore >= 40 && analysisResult.githubScore < 70 && (
                            <>
                              <div>• Promote on social media</div>
                              <div>• Add project topics/tags</div>
                              <div>• Create release notes</div>
                            </>
                          )}
                          {analysisResult.githubScore >= 70 && (
                            <div>• Great community engagement!</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NeoBrutalistCard>
              )}
            </div>

            {/* AI Recommendations & Action Plan */}
            <NeoBrutalistCard background="neo-yellow">
              <div className="space-y-6">
                <h3 className="font-display font-bold text-2xl text-black flex items-center gap-3">
                  <span>💡</span>
                  AI-Powered Recommendations & Action Plan
                </h3>
                
                {/* Priority Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-100 p-4 border-2 border-black">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      🚨 High Priority
                    </h4>
                    <div className="space-y-2 text-sm text-red-700">
                      {analysisResult.overallScore < 40 && (
                        <>
                          <div>• Fix critical dependency vulnerabilities</div>
                          <div>• Add comprehensive README documentation</div>
                          <div>• Implement basic error handling</div>
                          <div>• Add project license</div>
                        </>
                      )}
                      {analysisResult.dependencyScore === 0 && (
                        <div>• Add package.json with proper dependencies</div>
                      )}
                      {analysisResult.readmeScore < 30 && (
                        <div>• Create detailed project documentation</div>
                      )}
                      {!analysisResult.overallScore || analysisResult.overallScore >= 40 ? (
                        <div>• No critical issues found!</div>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-100 p-4 border-2 border-black">
                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                      ⚠️ Medium Priority
                    </h4>
                    <div className="space-y-2 text-sm text-yellow-700">
                      {analysisResult.overallScore >= 40 && analysisResult.overallScore < 70 && (
                        <>
                          <div>• Improve code documentation</div>
                          <div>• Add unit tests</div>
                          <div>• Update outdated dependencies</div>
                          <div>• Enhance GitHub repository description</div>
                        </>
                      )}
                      {analysisResult.codeQualityScore < 70 && (
                        <div>• Refactor complex functions</div>
                      )}
                      {analysisResult.githubScore < 50 && (
                        <div>• Improve repository visibility</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-green-100 p-4 border-2 border-black">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      ✅ Nice to Have
                    </h4>
                    <div className="space-y-2 text-sm text-green-700">
                      {analysisResult.overallScore >= 70 && (
                        <>
                          <div>• Add CI/CD pipeline</div>
                          <div>• Create project website</div>
                          <div>• Add code coverage reports</div>
                          <div>• Implement advanced testing</div>
                        </>
                      )}
                      <div>• Add project screenshots</div>
                      <div>• Create contribution guidelines</div>
                      <div>• Add changelog documentation</div>
                    </div>
                  </div>
                </div>

                {/* Custom Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-black text-lg">Custom AI Recommendations:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisResult.recommendations.map((rec, index) => (
                        <div key={index} className="bg-white/70 p-4 border-2 border-black transform hover:rotate-1 transition-transform">
                          <p className="font-body text-black text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Roadmap */}
                <div className="bg-white/50 p-4 border-2 border-black">
                  <h4 className="font-bold text-black mb-3 text-lg">🗺️ 30-Day Improvement Roadmap</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-bold text-black mb-2">Week 1-2: Foundation</div>
                      <div className="space-y-1 text-black">
                        <div>📋 Update README with clear instructions</div>
                        <div>🔒 Fix security vulnerabilities</div>
                        <div>📜 Add proper licensing</div>
                        <div>🏷️ Add repository topics and description</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-black mb-2">Week 2-3: Enhancement</div>
                      <div className="space-y-1 text-black">
                        <div>🧪 Add unit tests and coverage</div>
                        <div>📦 Update dependencies</div>
                        <div>🎨 Improve code structure</div>
                        <div>📚 Add API documentation</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-black mb-2">Week 3-4: Optimization</div>
                      <div className="space-y-1 text-black">
                        <div>🚀 Set up CI/CD pipeline</div>
                        <div>📊 Add performance monitoring</div>
                        <div>🌐 Create project website</div>
                        <div>📢 Promote to community</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Projection */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 border-2 border-black">
                  <h4 className="font-bold text-black mb-3 text-lg">📈 Potential Score Improvement</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analysisResult.overallScore}</div>
                      <div className="text-sm text-black">Current Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.min(100, analysisResult.overallScore + 15)}
                      </div>
                      <div className="text-sm text-black">With README</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.min(100, analysisResult.overallScore + 25)}
                      </div>
                      <div className="text-sm text-black">+ Dependencies</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.min(100, analysisResult.overallScore + 40)}
                      </div>
                      <div className="text-sm text-black">Full Optimization</div>
                    </div>
                  </div>
                </div>
              </div>
            </NeoBrutalistCard>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <CTAButton 
                onClick={() => {
                  setAnalysisResult(null);
                  setRepoUrl('');
                  setProgress(0);
                  setCurrentStep('');
                }}
                color="green"
                size="lg"
              >
                Analyze Another Repo 🔄
              </CTAButton>
              <CTAButton 
                onClick={() => window.print()}
                color="blue"
                size="lg"
              >
                Export Report 📄
              </CTAButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeRepo;
