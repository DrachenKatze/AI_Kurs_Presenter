"use client";

import { TemplateDesigner } from "@/components/canvas/TemplateDesigner";
import { DataView } from "@/components/data/DataView";
import { PresentationView } from "@/components/presentation/PresentationView";
import { Tabs as UiTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/state/ProjectContext";
import { EmptyState } from "./EmptyState";

const TABS = [
  { value: "data", label: "Data View", view: <DataView /> },
  { value: "template", label: "Template Designer", view: <TemplateDesigner /> },
  { value: "presentation", label: "Presentation View", view: <PresentationView /> },
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
          {state.project ? t.view : <EmptyState />}
        </TabsContent>
      ))}
    </UiTabs>
  );
}
