import React, { useEffect, useState } from 'react';
import { getTimeZone } from '../utils';
import './analog-clock.css';

const AnalogClock = ({ now }) => {
  const [hands, setHands] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateClockHands = () => {
      const timeZone = getTimeZone();
      const localTime = new Date(now.toLocaleString('en-US', { timeZone }));

      const hours = localTime.getHours();
      const minutes = localTime.getMinutes();
      const seconds = localTime.getSeconds();

      setHands({
        hours: hours * 30 + minutes / 2, // 30 degrees per hour + adjustment for minutes
        minutes: minutes * 6, // 6 degrees per minute
        seconds: seconds * 6, // 6 degrees per second
      });
    };

    updateClockHands();
  }, [now]);

  // Generate time markers
  const timeMarkers = Array.from({ length: 60 }, (_, i) => (
    <span key={i} style={{ '--index': i + 1 }}>
      <p className={i % 5 === 4 ? 'major-mark' : ''}></p>
    </span>
  ));

  return (
    <div className="secondary-card calendar-overview-card">
      <div className="clock">
        <div className="seconds-bar">{timeMarkers}</div>
        <div className="hands-box">
          <div
            className="hand hour"
            style={{ transform: `rotate(${hands.hours}deg)` }}
          >
            <i></i>
          </div>
          <div
            className="hand minute"
            style={{ transform: `rotate(${hands.minutes}deg)` }}
          >
            <i></i>
          </div>
          <div
            className="hand second"
            style={{ transform: `rotate(${hands.seconds}deg)` }}
          >
            <i></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogClock;
