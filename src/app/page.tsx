import { ToolPage } from "@/components/layout/tool-page";
import { ToolCard } from "@/components/tools/tool-card";
import { tools } from "@/lib/tools/registry";

export default function HomePage() {
  return (
    <ToolPage
      title="Dev Tools"
      description="Local developer utilities for everyday coding tasks."
      contentClassName="max-w-5xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </ToolPage>
  );
}
