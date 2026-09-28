import { Sparkle } from "lucide-react";
import ContentBrowserPage from "./ContentBrowserPage";

export default function ShadersPage() {
  return (
    <ContentBrowserPage
      contentType="shader"
      icon={<Sparkle size={18} className="text-blue-400" />}
      title="Shaders"
      subtitle="Browse and customize your game visuals"
      searchPlaceholder="Search shaders..."
    />
  );
}