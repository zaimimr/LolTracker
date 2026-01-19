import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  className?: string;
  slot: string;
}

export function AdBanner({ className, slot }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!slot || isAdLoaded.current) return;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
      isAdLoaded.current = true;
    } catch (error) {
      console.debug("AdSense:", error);
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={cn("ad-container my-4 flex justify-center", className)}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px" }}
        data-ad-client="ca-pub-7050229813846454"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
