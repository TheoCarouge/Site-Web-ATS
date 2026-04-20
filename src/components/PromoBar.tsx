import { useState, useEffect } from "react";

export default function PromoBar() {
  const [timeLeft, setTimeLeft] = useState({ hours: 34, minutes: 52, seconds: 34 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-[#ff4e6e] text-white text-sm font-bold py-2 px-4 flex justify-center items-center gap-4">
      <span>– 20 % sur tout</span>
      <div className="flex items-center gap-1">
        <span>Se termine dans :</span>
        <div className="bg-black/20 px-1 rounded">{format(timeLeft.hours)}</div>
        <span>:</span>
        <div className="bg-black/20 px-1 rounded">{format(timeLeft.minutes)}</div>
        <span>:</span>
        <div className="bg-black/20 px-1 rounded">{format(timeLeft.seconds)}</div>
      </div>
      <button className="underline hover:no-underline">Valider le code</button>
    </div>
  );
}
