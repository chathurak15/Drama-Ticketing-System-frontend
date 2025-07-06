import React from 'react';

const TimeCounter = ({ timeLeft, totalTime = 840 }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColorByTime = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 50) return 'stroke-[#661F19]';
    if (percentage > 25) return 'stroke-[#8B2635]';
    if (percentage > 10) return 'stroke-[#B91C1C]';
    return 'stroke-[#DC2626]';
  };

  const getGlowColor = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 50) return 'shadow-[#661F19]/50';
    if (percentage > 25) return 'shadow-[#8B2635]/50';
    if (percentage > 10) return 'shadow-[#B91C1C]/50';
    return 'shadow-[#DC2626]/50';
  };

  return (
    <div className="relative inline-block">
      {/* Background Circle */}
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgb(55, 65, 81)"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${getColorByTime()} transition-all duration-300 ease-in-out`}
          style={{
            filter: timeLeft <= totalTime * 0.1 ? 'drop-shadow(0 0 8px currentColor)' : 'none'
          }}
        />
      </svg>
      
      {/* Time Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div 
            className={`text-lg font-bold font-mono transition-all duration-300 ${
              timeLeft <= totalTime * 0.1 
                ? 'text-[#DC2626] animate-pulse' 
                : timeLeft <= totalTime * 0.25 
                ? 'text-[#B91C1C]' 
                : timeLeft <= totalTime * 0.5 
                ? 'text-[#8B2635]' 
                : 'text-[#661F19]'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Pulsing Ring Effect for Low Time */}
      {timeLeft <= totalTime * 0.1 && timeLeft > 0 && (
        <div className={`absolute inset-0 rounded-full animate-ping ${getGlowColor()} shadow-lg`}></div>
      )}
    </div>
  );
};

export default TimeCounter;