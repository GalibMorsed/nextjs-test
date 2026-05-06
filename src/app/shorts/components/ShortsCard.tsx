"use client";

import { 
  ArrowUpRight, 
  Clock3, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import DailymotionPlayer from "./DailymotionPlayer";

export interface ShortsVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  source: string;
  avatar: string;
  watchUrl: string;
  embedUrl: string;
}

interface ShortsCardProps {
  video: ShortsVideo;
  index: number;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  fullScreen?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return String(views);
}

export default function ShortsCard({
  video,
  index,
  isActive,
  isMuted,
  onMuteToggle,
  fullScreen = false,
}: ShortsCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <article
      data-index={index}
      className={`shorts-card relative flex w-full snap-start flex-col overflow-hidden bg-black transition-all duration-500 
        ${fullScreen ? "h-full" : "h-[calc(100vh-65px)] md:h-full md:min-h-[820px] md:rounded-[32px] md:border md:border-white/10 md:shadow-2xl"}`}
    >
      <DailymotionPlayer
        videoId={video.id}
        title={video.title}
        isActive={isActive}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
      />

      {/* Action Sidebar removed per user request */}

      {/* Top Content Overlay (Moved from bottom to avoid blocking player controls) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent px-5 pt-8 pb-20 md:px-6">
        <div className="flex items-center gap-3 pointer-events-auto">
          {video.avatar ? (
            <img
              src={video.avatar}
              alt=""
              className="h-9 w-9 rounded-full border-2 border-white/20 object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full border-2 border-white/15 bg-white/10" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none shadow-sm">
              {video.source}
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-white/80">
              <Clock3 size={14} />
              <span>{formatDuration(video.duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
