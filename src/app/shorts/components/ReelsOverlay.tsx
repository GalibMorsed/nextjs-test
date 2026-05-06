"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import ShortsCard, { ShortsVideo } from "./ShortsCard";

interface ReelsOverlayProps {
  category: string;
  onClose: () => void;
}

export default function ReelsOverlay({ category, onClose }: ReelsOverlayProps) {
  const [videos, setVideos] = useState<ShortsVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryLabel = category.replace(/-/g, " ");

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setActiveIndex(0);
      try {
        const params = new URLSearchParams({ category });
        const response = await fetch(`/api/shorts?${params.toString()}`);
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error("Failed to fetch shorts:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [category]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, clientHeight } = scrollContainerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToVideo = (index: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: index * scrollContainerRef.current.clientHeight,
      behavior: "smooth",
    });
  };

  const nextVideo = () => {
    if (activeIndex < videos.length - 1) {
      scrollToVideo(activeIndex + 1);
    }
  };

  const prevVideo = () => {
    if (activeIndex > 0) {
      scrollToVideo(activeIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") nextVideo();
      if (e.key === "ArrowUp") prevVideo();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, videos.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 px-6 text-center text-white">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 rounded-full bg-white/10 p-3 transition-all hover:bg-white/20"
        >
          <X size={24} />
        </button>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold capitalize">
            No Indian {categoryLabel} videos found
          </h2>
          <p className="mt-3 text-sm text-white/70">
            We only show India-specific news reels for the selected category.
            Try another category in the meantime.
          </p>
        </div>
      </div>
    );
  }

  const activeVideo = videos[activeIndex];

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen overflow-hidden bg-black">
      {/* Dynamic Blurred Background (Desktop) */}
      {activeVideo && (
        <div 
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage: `url(${activeVideo.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px) brightness(0.4)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Desktop Navigation Controls */}
      <div className="absolute inset-x-0 inset-y-0 z-10 hidden md:flex items-center justify-between px-8 pointer-events-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 left-8 p-3 rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 pointer-events-auto"
        >
          <X size={24} />
        </button>

        {/* Vertical Navigation Arrows */}
        <div className="absolute right-8 flex flex-col gap-4 pointer-events-auto">
          <button
            onClick={prevVideo}
            disabled={activeIndex === 0}
            className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronUp size={28} />
          </button>
          <button
            onClick={nextVideo}
            disabled={activeIndex === videos.length - 1}
            className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronDown size={28} />
          </button>
        </div>
      </div>

      {/* Reels Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative z-20 h-full w-full snap-y snap-mandatory overflow-y-auto scrollbar-hide md:mx-auto md:w-[420px] md:rounded-[32px] md:shadow-[0_0_80px_rgba(0,0,0,0.5)]"
      >
        {videos.map((video, index) => (
          <div key={video.id} className="h-full w-full snap-start">
            <ShortsCard
              video={video}
              index={index}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(!isMuted)}
              fullScreen={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
