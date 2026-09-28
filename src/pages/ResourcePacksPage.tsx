import { Palette } from "lucide-react";
import ContentBrowserPage from "./ContentBrowserPage";

export default function ResourcePacksPage() {
  return (
    <ContentBrowserPage
      contentType="resourcepack"
      icon={<Palette size={18} className="text-blue-400" />}
      title="Resource Packs"
      subtitle="Browse and customize your game textures and audio"
      searchPlaceholder="Search resource packs..."
    />
  );
}