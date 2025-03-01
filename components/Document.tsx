"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useDocStore } from "@/store/use-doc-store";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/app/(main)/(routes)/documents/[...pages]/_components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { DockNav } from "@/app/(main)/(routes)/documents/[...pages]/_components/docknav";
import { createClient } from "@/lib/supabase/client";
import { PDFViewer } from "@/components/pdfViewer";
import { usePageStore } from "@/store/use-page-store";
import { useLayoutWrapper } from "@/app/(main)/_hooks/use-layout-wrapper";

interface DocumentPageProps {
  uuid: string;
}

export default function Document({ uuid }: DocumentPageProps) {
  const { doc, loadingDoc, isLocked, updateDocAsync, getDocAsync } =
    useDocStore();
  const [paperId, setPaperId] = useState<string>("");
  const { toggleChat, isChatOpen, setSelectedText } = usePageStore();
  const { minimize } = useLayoutWrapper();

  const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

  useEffect(() => {
    getDocAsync(uuid);
  }, [uuid, getDocAsync]);

  useEffect(() => {
    const fetchPaperId = async () => {
      if (doc?.is_public && doc.linked_to) {
        const supabase = createClient();
        try {
          const { data: paper } = await supabase
            .from("pages")
            .select("open_access_id")
            .eq("uuid", doc.linked_to)
            .single();

          setPaperId(paper?.open_access_id || "");
        } catch (error) {
          console.error("Error fetching paper ID:", error);
          setPaperId("");
        }
      } else {
        setPaperId("");
      }
    };

    fetchPaperId();
  }, [doc?.is_public, doc?.linked_to]);

  if (loadingDoc) {
    return <DocumentSkeleton />;
  }

  if (!doc) {
    return <div>Document not found</div>;
  }

  const handleExplain = (selectedText: string) => {
    if (selectedText) {
      setSelectedText({
        text: selectedText,
        pageType: "main", // or "stack", depending on where this component is used
      })
      if (!isChatOpen) toggleChat()
    }
  }

  return (
    <div className="h-full overflow-y-auto w-full">
      {doc.open_access_id ? (
        <PDFViewer
          pdfUrl={`${doc.annotated_pdf_public_url}`}
          onExplain={handleExplain}
        />
      ) : (
        <>
          <Cover url={doc.image_url} preview={false} />
          <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
            <Toolbar initialData={doc} />
            <Editor
              onChange={(content) => updateDocAsync(uuid, { content })}
              initialContent={doc.content as string}
              editable={!isLocked}
              uuid={uuid}
              
            />
          </div>
        </>
      )}
      {!minimize && (
        <div className="fixed bottom-4 left-10 z-50">
          <DockNav
            isPublic={doc.is_public || false}
            paperId={paperId || doc.open_access_id}
          />
        </div>
      )}
    </div>
  );
}

function DocumentSkeleton() {
  return (
    <div>
      <Cover.Skeleton />
      <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
        <div className="space-y-4 pl-8 pt-4">
          <Skeleton className="h-14 w-[50%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
    </div>
  );
}
