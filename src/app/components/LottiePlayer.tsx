"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LottiePlayerProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export default function LottiePlayer({
  src,
  className,
  loop = true,
  autoplay = true,
}: LottiePlayerProps) {
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}
