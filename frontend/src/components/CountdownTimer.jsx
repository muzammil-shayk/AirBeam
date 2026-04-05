import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

/**
 * Seconds to countdown from (default 5 minutes = 300 seconds)
 */
const DEFAULT_DURATION = 5 * 60;

const CountdownTimer = ({ createdAt, onExpire, label = "Deleting in" }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!createdAt) return;

    const calculateTimeLeft = () => {
      const createdTime = new Date(createdAt).getTime();
      const expirationTime = createdTime + DEFAULT_DURATION * 1000;
      const now = Date.now();
      const difference = Math.max(0, Math.floor((expirationTime - now) / 1000));
      return difference;
    };

    // Initialize
    const currentDifference = calculateTimeLeft();
    setTimeLeft(currentDifference);

    if (currentDifference <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, onExpire]);

  if (timeLeft === null || timeLeft <= 0) {
    return (
      <div className="flex items-center space-x-2 text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-sm border border-red-100">
        <Clock className="h-4 w-4" />
        <span>Expired</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div className={`flex items-center space-x-2 font-mono font-bold px-3 py-1 rounded-full text-sm border transition-colors ${
      isUrgent 
        ? "text-red-600 bg-red-50 border-red-200 animate-pulse" 
        : "text-teal-600 bg-teal-50 border-teal-200"
    }`}>
      <Clock className={`h-4 w-4 ${isUrgent ? "animate-spin-slow" : ""}`} />
      <span>
        {label}: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </span>
    </div>
  );
};

export default CountdownTimer;
