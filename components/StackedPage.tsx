"use client";

// import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
// import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/app/(main)/(routes)/documents/[...pages]/_components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Page } from "@/store/use-doc-store";
import { PDFViewer } from "@/components/pdfViewer";
import { usePageStore } from "@/store/use-page-store";

interface DocumentPageProps {
  uuid: string;
}

export default function StackedDocument({ uuid }: DocumentPageProps) {
  const [doc, setDoc] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [is_url, setIsUrl] = useState<boolean>(false);
  const { toggleChat, isChatOpen, setSelectedText } = usePageStore();
  // Dynamically import Editor with SSR disabled
  // const Editor = useMemo(
  //   () => dynamic(() => import("@/components/editor"), { ssr: false }),
  //   [],
  // );

  // Fetch document on mount
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const is_url = uuid.startsWith("http");
        setIsUrl(is_url);
        if (is_url) {
          setLoading(false);
          return;
        }
        // Fetch doc
        const supabase = createClient();
        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .eq("uuid", uuid)
          .single();
        if (error) {
          throw error;
        }
        let docContent = data.content;
        if (data.is_public && data.linked_to) {
          const { data: linkedPage, error: linkedError } = await supabase
            .from("pages")
            .select("content")
            .eq("uuid", data.linked_to)
            .single();

          if (linkedError) throw linkedError;
          // console.log(linkedPage)
          if (linkedPage) {
            docContent = linkedPage.content;
          }
        }
        if (data) {
          setDoc({ ...data, content: docContent });
        } else {
          setDoc(null);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Failed to load document");
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [uuid]);

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Not found state
  if (!is_url && !doc) {
    return <div>Document not found</div>;
  }
  console.log("Asunex", is_url, uuid);

  const handleExplain = (selectedText: string) => {
    if (selectedText) {
      setSelectedText({
        text: selectedText,
        pageType: "stack", // or "stack", depending on where this component is used
      })
      if (!isChatOpen) toggleChat()
    }
  }
  return (
    <div className="h-full overflow-y-auto w-full">
      {is_url ? (
        <PDFViewer
          pdfUrl={`${uuid}`}
          onExplain={handleExplain}
        />
      ) : (
        <>
          {/* <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
            <Toolbar initialData={doc} preview={true} />
            <Editor
              initialContent={doc.content as string}
              editable={false}
              uuid={uuid}
            />
          </div> */}
          <h1>No markdown</h1>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
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
