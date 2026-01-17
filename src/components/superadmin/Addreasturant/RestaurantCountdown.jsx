import React, { useState, useEffect } from 'react';

const RestaurantCountdown = ({ endDate, paymentStatus }) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endDate || paymentStatus !== 'paid') return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    };

    // Set initial value immediately
    setCountdown(calculateCountdown());

    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, paymentStatus]);

  if (paymentStatus !== 'paid') return <span className="text-gray-500 text-xs">-</span>;

  return (
    <div className="text-xs text-indigo-600 font-semibold">
      {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
    </div>
  );
};

export default RestaurantCountdown;
