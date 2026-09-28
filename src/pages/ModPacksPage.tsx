import { Package } from "lucide-react";
import ContentBrowserPage from "./ContentBrowserPage";

export default function ModPacksPage(){
  return (
    <ContentBrowserPage
      contentType="modpack"
      icon={<Package size={18} className="text-blue-400" />}
      title="Modpacks"
      subtitle="Discover modpacks!"
      searchPlaceholder="Search modspacks..."
      addLabel="Install intance"
    />
  );
}