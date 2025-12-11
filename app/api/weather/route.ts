// app/api/weather/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type TimeAPIResponse = {
  datetime: string;
  timezone: string;
  day_of_week: number;
  day_of_year: number;
  week_number: number;
};

export async function GET() {
  try {

    // Use WorldTimeAPI (free, no API key needed) for time
    // Using a default timezone - in production, you'd detect from IP
    const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/America/New_York", {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!timeResponse.ok) {
      throw new Error("Time API failed");
    }

    const timeData = (await timeResponse.json()) as TimeAPIResponse;

    // For weather, we'll use a free API that doesn't require key
    // Using wttr.in which is free and doesn't require API key
    // Fallback to a simple time-based greeting if weather fails
    let weatherData = null;
    try {
      const weatherResponse = await fetch(
        `https://wttr.in/?format=j1`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (weatherResponse.ok) {
        const weather = await weatherResponse.json();
        weatherData = {
          location: weather.nearest_area?.[0]?.areaName?.[0]?.value || "Unknown",
          temp: weather.current_condition?.[0]?.temp_F || null,
          condition: weather.current_condition?.[0]?.weatherDesc?.[0]?.value || "Unknown",
          icon: weather.current_condition?.[0]?.weatherCode || null,
        };
      }
    } catch {
      // Weather is optional, continue without it
      console.log("Weather API failed, continuing without weather data");
    }

    // Determine time of day
    const hour = new Date(timeData.datetime).getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    if (hour >= 5 && hour < 12) {
      timeOfDay = "morning";
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = "evening";
    } else {
      timeOfDay = "night";
    }

    // Generate contextual suggestion based on time
    const suggestions = {
      morning: [
        "Start your day with planning tools",
        "Morning productivity workflows",
        "Research and organization tools",
      ],
      afternoon: [
        "Afternoon creative work",
        "Collaboration and communication tools",
        "Design and content creation",
      ],
      evening: [
        "Evening creative projects",
        "Content creation workflows",
        "Relaxing creative activities",
      ],
      night: [
        "Late-night creative work",
        "Quiet focus tools",
        "Planning for tomorrow",
      ],
    };

    return NextResponse.json({
      time: {
        datetime: timeData.datetime,
        timezone: timeData.timezone,
        hour,
        timeOfDay,
      },
      weather: weatherData,
      suggestion: suggestions[timeOfDay][Math.floor(Math.random() * suggestions[timeOfDay].length)],
    });
  } catch (error) {
    console.error("Weather/Time API error:", error);
    // Return fallback data
    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    if (hour >= 5 && hour < 12) {
      timeOfDay = "morning";
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = "evening";
    } else {
      timeOfDay = "night";
    }

    return NextResponse.json({
      time: {
        datetime: new Date().toISOString(),
        timezone: "UTC",
        hour,
        timeOfDay,
      },
      weather: null,
      suggestion: "Find the perfect AI tool for your task",
    });
  }
}

