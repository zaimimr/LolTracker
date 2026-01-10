import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  className?: string;
  slot?: string;
}

export function AdBanner({ className, slot }: AdBannerProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error) {
      // Silently handle ad blocker or AdSense errors
      console.debug("AdSense:", error);
    }
  }, []);

  return (
    <div className={cn("ad-container my-4 flex justify-center", className)}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7050229813846454"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
