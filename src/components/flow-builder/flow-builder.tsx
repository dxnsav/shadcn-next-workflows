"use client";

import {
  Background,
  type EdgeTypes,
  type NodeChange,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useCallback } from "react";
import { useDeleteKeyCode } from "@/hooks/use-delete-key-code";
import { useOnNodesDelete } from "@/hooks/use-on-nodes-delete";
import { useNodeAutoAdjust } from "@/hooks/use-node-auto-adjust";
import CustomDeletableEdge from "./components/edges/custom-deletable-edge";
import { useAddNodeOnEdgeDrop } from "@/hooks/use-add-node-on-edge-drop";
import { useDragDropFlowBuilder } from "@/hooks/use-drag-drop-flow-builder";
import { useIsValidConnection } from "@/hooks/use-is-valid-connection";
import CustomControls from "./components/controls/custom-controls";
import { cn } from "@/lib/utils";
import AddNodeFloatingMenu from "./components/add-node-floating-menu/add-node-floating-menu";
import { useFlowStore } from "@/stores/flow-store";
import { useShallow } from "zustand/shallow";
import { NODE_TYPES } from "./components/blocks";

const edgeTypes: EdgeTypes = {
  deletable: CustomDeletableEdge,
};

export const FlowBuilder = () => {
  const [nodes, edges, onNodesChange, onEdgesChange, onConnect] = useFlowStore(
    useShallow((s) => [
      s.nodes,
      s.edges,
      s.actions.nodes.onNodesChange,
      s.actions.edges.onEdgesChange,
      s.actions.edges.onConnect,
    ])
  );
  const { getNodes } = useReactFlow();
  const [isBuilderBlurred] = useFlowStore(
    useShallow((s) => [s.view.mobile, s.builder.blurred])
  );
  const {
    handleOnEdgeDropConnectEnd,
    floatingMenuWrapperRef,
    handleAddConnectedNode,
  } = useAddNodeOnEdgeDrop();

  const deleteKeyCode = useDeleteKeyCode();
  const onNodesDelete = useOnNodesDelete(nodes);

  const [onDragOver, onDrop] = useDragDropFlowBuilder();
  const isValidConnection = useIsValidConnection(nodes, edges);

  const autoAdjustNode = useNodeAutoAdjust();

  const handleAutoAdjustNodeAfterNodeMeasured = useCallback(
    (id: string) => {
      setTimeout(() => {
        const node = getNodes().find((n) => n.id === id);
        if (!node) {
          return;
        }

        if (node.measured === undefined) {
          handleAutoAdjustNodeAfterNodeMeasured(id);
          return;
        }

        autoAdjustNode(node);
      });
    },
    [autoAdjustNode, getNodes]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "dimensions") {
          const node = getNodes().find((n) => n.id === change.id);
          if (node) {
            autoAdjustNode(node);
          }
        }

        if (change.type === "add") {
          handleAutoAdjustNodeAfterNodeMeasured(change.item.id);
        }
      });
      onNodesChange(changes);
    },
    [
      autoAdjustNode,
      getNodes,
      handleAutoAdjustNodeAfterNodeMeasured,
      onNodesChange,
    ]
  );

  return (
    <div className="relative size-full">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        onInit={({ fitView }) => fitView().then()}
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        onNodesChange={handleNodesChange}
        edgeTypes={edgeTypes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={handleOnEdgeDropConnectEnd}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={(_, node) => {
          autoAdjustNode(node);
        }}
        onNodesDelete={onNodesDelete}
        isValidConnection={isValidConnection}
        multiSelectionKeyCode={null}
        deleteKeyCode={deleteKeyCode}
        snapGrid={[16, 16]}
        snapToGrid
        fitView
      >
        <Background gap={32} />
        <CustomControls />
      </ReactFlow>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 backdrop-blur-3xl transition-all",
          isBuilderBlurred &&
            "opacity-100 bg-background/30 backdrop-saturate-50 pointer-events-auto",
          !isBuilderBlurred &&
            "opacity-0 bg-zinc-800/0 backdrop-saturate-100 pointer-events-none"
        )}
      >
        <div ref={floatingMenuWrapperRef} className="relative size-full">
          <AddNodeFloatingMenu onNodeAdd={handleAddConnectedNode} />
        </div>
      </div>
    </div>
  );
};