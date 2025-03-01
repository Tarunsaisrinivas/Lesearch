"use client";

import { useParams } from "next/navigation";
import Document from "./Document";
import StackedDocument from "./StackedPage";
import { CircleX } from "lucide-react";
import { usePageStore } from "@/store/use-page-store";
import { ChatBot } from "@/app/(main)/(routes)/documents/[...pages]/_components/chatBot";

export default function EditorLayout() {
  const params = useParams();
  const pageParams = Array.isArray(params.pages)
    ? params.pages
    : params.pages
      ? [params.pages]
      : [];

  const { stackedPage, removePage, isChatOpen } = usePageStore();

  return (
    <div className="flex relative h-full w-full ">
      {pageParams[0] && <Document uuid={pageParams[0]} />}
      {(stackedPage) && !isChatOpen && (
        <>
          <StackedDocument uuid={stackedPage} />
          <div className="absolute top-2 right-4 flex items-center justify-center">
            <CircleX
              color="red"
              onClick={removePage}
              className="hover:cursor-pointer rounded-full w-6 h-6"
            />
          </div>
        </>
      )}
      {isChatOpen && pageParams[0] && (
        <>
          <ChatBot pageId={pageParams[0]} />
          <div className="absolute top-2 right-4 flex items-center justify-center">
            <CircleX
              color="red"
              onClick={() => usePageStore.getState().toggleChat()}
              className="hover:cursor-pointer rounded-full w-6 h-6"
            />
          </div>
        </>
      )}
    </div>
  );
}
