import { FileText } from "lucide-react";
import ContentBrowserPage from "./ContentBrowserPage";

export default function DataPacksPage() {
  return (
    <ContentBrowserPage
      contentType="datapack"
      icon={<FileText size={18} className="text-blue-400" />}
      title="Datapacks"
      subtitle="Browse and manage your datapacks"
      searchPlaceholder="Search datapacks..."
      addLabel="Add to world"
    />
  );
}
