import { useState, useEffect } from 'react';

/**
 * FloatingSeatTimer Component
 * Displays a countdown to the 3:00 PM unlock window for floating seats.
 */
const FloatingSeatTimer = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isUnlocked: false });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date();
            target.setHours(15, 0, 0, 0); // 3:00 PM

            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft(prev => ({ ...prev, isUnlocked: true }));
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds, isUnlocked: false });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (timeLeft.isUnlocked) {
        return (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800 animate-pulse">
                <span className="text-xl">🚀</span>
                <span className="text-sm font-bold uppercase tracking-tight">Floating seats are now open for tomorrow!</span>
            </div>
        );
    }

    const formatNum = (num) => num.toString().padStart(2, '0');

    return (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-60">Unlock Countdown</span>
                <div className="flex items-center font-mono text-xl font-black">
                    {formatNum(timeLeft.hours)}
                    <span className="mx-1 animate-pulse">:</span>
                    {formatNum(timeLeft.minutes)}
                    <span className="mx-1 animate-pulse">:</span>
                    {formatNum(timeLeft.seconds)}
                </div>
            </div>
            <div className="h-8 w-px bg-blue-200 dark:bg-blue-800"></div>
            <span className="text-[10px] font-medium leading-tight">UNTIL<br />3:00 PM</span>
        </div>
    );
};

export default FloatingSeatTimer;
