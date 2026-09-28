import { Box } from "lucide-react";
import ContentBrowserPage from "./ContentBrowserPage";

export default function ModsPage() {
  return (
    <ContentBrowserPage
      contentType="mod"
      icon={<Box size={18} className="text-blue-400" />}
      title="Mods"
      subtitle="Browse and manage your mods"
      searchPlaceholder="Search mods..."
    />
  );
}