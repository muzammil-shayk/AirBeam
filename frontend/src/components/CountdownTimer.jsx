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

  // First render with a createdAt: the effect has not computed yet. Hold the layout instead of flashing "Expired".
  if (timeLeft === null && createdAt) {
    return (
      <div className="timer">
        <span className="timer__label">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {label}
        </span>
        <span className="timer__digits num">-:--</span>
      </div>
    );
  }

  if (timeLeft === null || timeLeft <= 0) {
    return (
      <div className="timer" data-expired="true">
        <span className="timer__label">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Expired
        </span>
        <span className="timer__digits num">0:00</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div className="timer" data-urgent={isUrgent}>
      <span className="timer__label">
        <Clock className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      <span className="timer__digits num" role="timer">
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </span>
    </div>
  );
};

export default CountdownTimer;
