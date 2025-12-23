import { tool } from 'ai';
import { z } from 'zod/v3';

async function getCoordinates(
  city: string
): Promise<{ latitude: number; longitude: number } | null> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`
  );
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    };
  }
  return null;
}

export const getWeather = tool({
  description:
    '获取指定城市或位置的当前天气信息。可以直接输入城市名称（如"深圳"、"北京"）或经纬度坐标。',
  inputSchema: z.object({
    city: z.string().optional().describe('城市名称，如"深圳"、"北京"、"上海"'),
    latitude: z
      .number()
      .optional()
      .describe('纬度（可选，如果提供了城市名称则不需要）'),
    longitude: z
      .number()
      .optional()
      .describe('经度（可选，如果提供了城市名称则不需要）'),
  }),
  execute: async ({ city, latitude, longitude }) => {
    let lat = latitude;
    let lon = longitude;

    if (city && (lat === undefined || lon === undefined)) {
      const coords = await getCoordinates(city);
      if (!coords) {
        return { error: `无法找到城市"${city}"的位置信息` };
      }
      lat = coords.latitude;
      lon = coords.longitude;
    }

    if (lat === undefined || lon === undefined) {
      return { error: '请提供城市名称或经纬度坐标' };
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
    );

    const weatherData = await response.json();
    return { ...weatherData, city };
  },
});
