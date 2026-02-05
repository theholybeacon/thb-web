"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"

export function SpeedInsightsWrapper() {
  return (
    <SpeedInsights
      beforeSend={(data) => {
        const url = data.url
          .replace(/\/session\/[a-zA-Z0-9-]+/, '/session/[id]')
          .replace(/\/study\/[a-zA-Z0-9-]+/, '/study/[id]');
        return { ...data, url };
      }}
    />
  )
}
