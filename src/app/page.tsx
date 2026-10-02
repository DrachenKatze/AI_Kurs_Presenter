import { Tabs } from "@/components/shell/Tabs";
import { TopBar } from "@/components/shell/TopBar";
import { ProjectProvider } from "@/state/ProjectContext";

export default function Home() {
  return (
    <ProjectProvider>
      <TopBar />
      <Tabs />
    </ProjectProvider>
  );
}
