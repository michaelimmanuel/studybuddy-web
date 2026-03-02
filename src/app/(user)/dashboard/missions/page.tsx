"use client";

import React, { useState, useEffect } from 'react';
import { missionsService, Mission, MissionStats } from '@/services/missions.service';
import MissionCard from '@/components/dashboard/MissionCard';

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await missionsService.getMissions();
      setMissions(data.missions);
      setStats(data.stats);
    } catch (err) {
      setError('Failed to load missions. Please try again.');
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMissions = () => {
    if (filter === 'ALL') return missions;
    if (filter === 'COMPLETED') return missions.filter(m => m.progress?.isCompleted);
    if (filter === 'IN_PROGRESS') return missions.filter(m => !m.progress?.isCompleted && (m.progress?.current || 0) > 0);
    return missions.filter(m => m.type === filter);
  };

  const filteredMissions = filterMissions();

  const filterTabs = [
    { id: 'ALL', label: 'All', icon: '🎯' },
    { id: 'QUIZ_COMPLETION', label: 'Quiz', icon: '📝' },
    { id: 'CBT_COMPLETION', label: 'CBT', icon: '💡' },
    { id: 'OSCE_COMPLETION', label: 'OSCE', icon: '📚' },
    { id: 'STUDY_STREAK', label: 'Streaks', icon: '🔥' },
    { id: 'HIGH_SCORE', label: 'High Scores', icon: '⭐' },
    { id: 'COMPLETED', label: 'Completed', icon: '✅' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
        <p className="text-white/80">{error}</p>
        <button
          onClick={loadMissions}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Missions & Achievements</h1>
            <p className="text-white/70">Complete missions to earn points and unlock achievements</p>
          </div>
          <div className="text-right">
            <div className="text-5xl mb-2">🏆</div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm text-white/70">Completed</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.completedMissions} / {stats.totalMissions}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📈</span>
                <span className="text-sm text-white/70">Completion Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.completionRate.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <span className="text-sm text-white/70">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.currentStreak} days
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏅</span>
                <span className="text-sm text-white/70">Longest Streak</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.longestStreak} days
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Missions Grid */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-white mb-2">No missions found</h3>
          <p className="text-white/70">Try selecting a different filter or complete some quizzes to unlock missions!</p>
        </div>
      )}

      {/* Motivational Message */}
      {stats && stats.completedMissions > 0 && stats.completedMissions < stats.totalMissions && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Keep Going! 💪</h3>
          <p className="text-white/80">
            You've completed {stats.completedMissions} missions. Only {stats.totalMissions - stats.completedMissions} more to go!
          </p>
        </div>
      )}

      {/* All Completed Celebration */}
      {stats && stats.completedMissions === stats.totalMissions && stats.totalMissions > 0 && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/50 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations! 🏆</h3>
          <p className="text-white/80 text-lg">
            You've completed all available missions! You're a true champion!
          </p>
        </div>
      )}
    </div>
  );
}
