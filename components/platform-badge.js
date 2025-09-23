import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/formatters";

export function PlatformBadge({ platform, followers }) {
  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "facebook":
        return "bg-blue-600 text-white";
      case "twitter":
        return "bg-sky-500 text-white";
      case "youtube":
        return "bg-red-600 text-white";
      case "tiktok":
        return "bg-black text-white";
      case "snapchat":
        return "bg-yellow-400 text-black";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <Badge className={`${getPlatformColor(platform)} px-3 py-1 font-medium`}>
      {platform} • {formatNumber(Number(followers))}
    </Badge>
  );
}
