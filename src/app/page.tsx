"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FlowBuilder } from "@/components/flow-builder/flow-builder";
import { ModeToggle } from "@/components/ui/button-theme-toggle";
import { SidebarModule } from "@/components/flow-builder/components/blocks/sidebar/sidebar-module";

export default function Home() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col  h-dvh">
        <ModeToggle />
        <div className="flex grow divide-x divide-card-foreground/10">
          <div className="grow bg-card md:bg-transparent">
            <FlowBuilder />
          </div>
          <SidebarModule />
        </div>
      </div>
    </ReactFlowProvider>
  );
}