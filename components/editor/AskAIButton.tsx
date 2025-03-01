"use client";

import { useComponentsContext } from "@blocknote/react";
import { BrainCircuit } from "lucide-react";

interface AskAIBtnProps {
  onClick: () => void;
}

export function AskAIBtn({ onClick }: AskAIBtnProps) {
  const Components = useComponentsContext()!;

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"Ask AI"}
      onClick={onClick}
    >
      <BrainCircuit className="h-4 w-4" /> Explain
    </Components.FormattingToolbar.Button>
  );
}
