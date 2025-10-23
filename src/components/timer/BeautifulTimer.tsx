'use client';

import { useTimer } from '@/contexts/TimerContext';
import { useEffect, useState } from 'react';

export function BeautifulTimer() {
  const { timeLeft, isRunning, currentSession, progress } = useTimer();
  const [particles, setParticles] = useState<Array<{id: number; size: number; x: number; y: number; duration: number}>>([]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Create floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 20
    }));
    setParticles(newParticles);
  }, []);

  const circumference = 2 * Math.PI * 170;

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {/* Floating Particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Main Timer */}
      <div className="glass rounded-3xl p-12 border border-primary/20 glow-border">
        <div className="text-center space-y-8">
          {/* Session Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-muted-foreground">
              FOCUS SESSION
            </h1>
            <h2 className="text-xl font-medium text-accent glow-text">
              {currentSession?.title || 'Ready to Focus'}
            </h2>
          </div>

          {/* Circular Timer */}
          <div className="timer-circle mx-auto">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              {/* Background Circle */}
              <circle
                cx="200"
                cy="200"
                r="170"
                stroke="hsl(var(--muted) / 0.2)"
                strokeWidth="8"
                fill="none"
              />
              
              {/* Progress Circle */}
              <circle
                cx="200"
                cy="200"
                r="170"
                stroke="url(#progress-gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                className="timer-progress-fill transition-all duration-1000 ease-out"
              />
              
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsl(var(--success))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className={`text-7xl font-bold font-mono glow-text ${isRunning ? 'animate-pulse' : ''}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              
              <div className={`text-lg px-6 py-2 rounded-full border backdrop-blur-sm ${
                isRunning 
                  ? 'border-success/50 text-success bg-success/10 glow-text' 
                  : 'border-primary/50 text-primary bg-primary/10'
              }`}>
                {isRunning ? 'IN PROGRESS' : 'READY'}
              </div>
            </div>
          </div>

          {/* Start Button */}
          {!currentSession && (
            <button className="glow-button px-12 py-4 rounded-2xl text-xl font-semibold text-white transition-all duration-300">
              BEGIN FOCUS
            </button>
          )}

          {/* Session Info */}
          {currentSession && (
            <div className="glass rounded-2xl p-6 border border-primary/10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-muted-foreground text-sm">DURATION</div>
                  <div className="text-2xl font-bold text-primary">
                    {currentSession.duration_minutes}m
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">FOCUS SCORE</div>
                  <div className="text-2xl font-bold text-success">
                    {currentSession.focus_score || '--'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">DISTRACTIONS</div>
                  <div className="text-2xl font-bold text-accent">
                    {currentSession.distractions}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}