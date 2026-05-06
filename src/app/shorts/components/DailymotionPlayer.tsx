"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

interface DailymotionPlayerProps {
  videoId: string;
  title: string;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export default function DailymotionPlayer({
  videoId,
  title,
  isActive,
  isMuted,
  onMuteToggle,
}: DailymotionPlayerProps) {
  const [loadedSrc, setLoadedSrc] = useState("");

  const src =
    `https://www.dailymotion.com/embed/video/${videoId}` +
    `?autoplay=${isActive ? 1 : 0}` +
    `&mute=${isMuted ? 1 : 0}` +
    "&ui-logo=0" +
    "&ui-start-screen-info=0" +
    "&sharing-enable=0" +
    "&queue-enable=0" +
    "&endscreen-enable=0" +
    "&ui-theme=dark";
  const loaded = loadedSrc === src;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950">
          <div className="h-11 w-11 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      )}

      <iframe
        key={src}
        src={src}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoadedSrc(src)}
      />
    </div>
  );
}
