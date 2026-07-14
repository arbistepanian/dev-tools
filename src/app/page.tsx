import { Header } from "@/components/layout/header";
import { ToolCard } from "@/components/tools/tool-card";
import { tools } from "@/lib/tools/registry";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Header
        title="Dev Tools"
        description="Local developer utilities for everyday coding tasks."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
