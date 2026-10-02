"use client";

import { DataView } from "@/components/data/DataView";
import { Tabs as UiTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/state/ProjectContext";
import { EmptyState } from "./EmptyState";

const TABS = [
  { value: "data", label: "Data View" },
  { value: "template", label: "Template Designer" },
  { value: "presentation", label: "Presentation View" },
];

export function Tabs() {
  const { state } = useProject();
  return (
    <UiTabs defaultValue="data" className="flex-1 p-4">
      <TabsList className="bg-tab">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          {!state.project ? (
            <EmptyState />
          ) : t.value === "data" ? (
            <DataView />
          ) : (
            <p className="p-4">{t.label}: coming soon</p>
          )}
        </TabsContent>
      ))}
    </UiTabs>
  );
}
