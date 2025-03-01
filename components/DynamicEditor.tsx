"use client";

import dynamic from "next/dynamic";

const EditorComponent = dynamic(() => import("./editor"), { ssr: false });

export const Editor = (props: React.ComponentProps<typeof EditorComponent>) => (
  <EditorComponent {...props} />
);
