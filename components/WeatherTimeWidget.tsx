// components/WeatherTimeWidget.tsx
"use client";

import { useEffect, useState } from "react";
import InteractiveTooltip from "./InteractiveTooltip";

type WeatherTimeData = {
  time: {
    datetime: string;
    timezone: string;
    hour: number;
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
  };
  weather: {
    location: string;
    temp: number | null;
    condition: string;
    icon: number | null;
  } | null;
  suggestion: string;
};

export default function WeatherTimeWidget() {
  const [data, setData] = useState<WeatherTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch weather/time data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-white/20">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="text-xs text-white/80">Loading...</span>
      </div>
    );
  }

  const { time, weather, suggestion } = data;
  const date = new Date(time.datetime);
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const timeOfDayEmoji = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌆",
    night: "🌙",
  };

  const timeOfDayGreeting = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good night",
  };

  return (
    <InteractiveTooltip
      content={
        <div>
          <div className="font-semibold mb-2">{timeOfDayGreeting[time.timeOfDay]}!</div>
          <div className="text-xs text-gray-300 mb-1">
            <strong>Time:</strong> {timeString}
          </div>
          {weather && (
            <>
              <div className="text-xs text-gray-300 mb-1">
                <strong>Location:</strong> {weather.location}
              </div>
              {weather.temp && (
                <div className="text-xs text-gray-300 mb-1">
                  <strong>Temperature:</strong> {weather.temp}°F
                </div>
              )}
              <div className="text-xs text-gray-300">
                <strong>Condition:</strong> {weather.condition}
              </div>
            </>
          )}
          <div className="text-xs text-gray-300 mt-2 pt-2 border-t border-gray-700">
            <strong>Suggestion:</strong> {suggestion}
          </div>
        </div>
      }
      position="bottom"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all cursor-pointer">
        <span className="text-sm">{timeOfDayEmoji[time.timeOfDay]}</span>
        <span className="text-xs text-white/90 font-medium">{timeString}</span>
        {weather && weather.temp && (
          <span className="text-xs text-white/70">{weather.temp}°F</span>
        )}
      </div>
    </InteractiveTooltip>
  );
}

