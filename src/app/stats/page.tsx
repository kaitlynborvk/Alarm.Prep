"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { userStatsService, UserStats } from '@/services/userStatsService';

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [insights, setInsights] = useState<{
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    const userStats = userStatsService.getUserStats();
    const userInsights = userStatsService.getPerformanceInsights();
    setStats(userStats);
    setInsights(userInsights);
  }, []);

  const resetData = () => {
    if (confirm('Are you sure you want to reset all your performance data? This cannot be undone.')) {
      userStatsService.resetUserData();
      const userStats = userStatsService.getUserStats();
      const userInsights = userStatsService.getPerformanceInsights();
      setStats(userStats);
      setInsights(userInsights);
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading your performance statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-md mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-alarm-black mb-2">Performance Stats</h1>
          <p className="text-gray-600">Track your progress and identify areas for improvement</p>
        </div>

        {stats.totalQuestions === 0 ? (
          // No data state
          <div className="text-center py-12 px-6 bg-white rounded-lg border border-alarm-black/10">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practice Data Yet</h3>
            <p className="text-gray-500 mb-4">Start answering questions to see your performance statistics!</p>
            <Link href="/" className="inline-block px-4 py-2 bg-alarm-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="bg-white rounded-lg p-6 border border-alarm-black/10">
              <h2 className="text-xl font-semibold text-alarm-black mb-4">Overall Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-alarm-blue">{stats.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(stats.averageTime)}s</div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-white rounded-lg p-6 border border-alarm-black/10">
              <h2 className="text-xl font-semibold text-alarm-black mb-4">Performance by Difficulty</h2>
              <div className="space-y-4">
                {Object.entries(stats.difficultyStats).map(([difficulty, data]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        difficulty === 'easy' ? 'bg-green-500' : 
                        difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium capitalize">{difficulty}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{data.total > 0 ? data.accuracy.toFixed(1) : 0}%</div>
                      <div className="text-sm text-gray-600">{data.correct}/{data.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Type Performance */}
            {Object.keys(stats.typeStats).length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-alarm-black/10">
                <h2 className="text-xl font-semibold text-alarm-black mb-4">Performance by Question Type</h2>
                <div className="space-y-4">
                  {Object.entries(stats.typeStats).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="font-medium">{type}</span>
                      <div className="text-right">
                        <div className="font-semibold">{data.accuracy.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">{data.correct}/{data.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Insights */}
            {insights && (
              <div className="bg-white rounded-lg p-6 border border-alarm-black/10">
                <h2 className="text-xl font-semibold text-alarm-black mb-4">Performance Insights</h2>
                
                {insights.strengths.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-green-700 mb-2">Strengths 💪</h3>
                    <ul className="space-y-1">
                      {insights.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-green-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.improvements.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-orange-700 mb-2">Areas for Improvement 📈</h3>
                    <ul className="space-y-1">
                      {insights.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-orange-600 flex items-start">
                          <span className="text-orange-500 mr-2">!</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">Recommendations 💡</h3>
                    <ul className="space-y-1">
                      {insights.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-blue-600 flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recent Activity */}
            {stats.recentPerformance.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-alarm-black/10">
                <h2 className="text-xl font-semibold text-alarm-black mb-4">Recent Activity</h2>
                <div className="space-y-2">
                  {stats.recentPerformance.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{day.correct}/{day.total}</span>
                        <div className={`px-2 py-1 rounded text-xs ${
                          day.accuracy >= 80 ? 'bg-green-100 text-green-800' :
                          day.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {day.accuracy.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <Link href="/" className="flex-1 py-3 bg-alarm-blue text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Continue Practicing
              </Link>
              <button 
                onClick={resetData}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Reset Data
              </button>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
