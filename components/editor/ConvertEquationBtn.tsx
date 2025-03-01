"use client";

import { useComponentsContext } from "@blocknote/react";
import { ArrowUpAZ } from "lucide-react";

interface ConvertEquationBtnProps {
  onConvert: () => void;
}

export function ConvertEquationBtn({ onConvert }: ConvertEquationBtnProps) {
  const Components = useComponentsContext()!;

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"Convert to Equation"}
      onClick={onConvert}
    >
      <ArrowUpAZ className="h-4 w-4" /> Katex
    </Components.FormattingToolbar.Button>
  );
}
