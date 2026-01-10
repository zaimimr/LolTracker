import { Coffee } from "lucide-react";
import { Button } from "./button";

interface KofiButtonProps {
  username: string;
}

export function KofiButton({ username }: KofiButtonProps) {
  return (
    <a
      href={`https://ko-fi.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      <Button variant="outline" size="sm">
        <Coffee className="mr-2 h-4 w-4" />
        Support on Ko-fi
      </Button>
    </a>
  );
}
