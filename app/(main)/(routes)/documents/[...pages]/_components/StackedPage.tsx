import React from "react";
import { useDocStore } from "@/store/use-doc-store";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "./cover";
import Editor from "@/components/editor";

interface StackedPageProps {
  uuid: string;
  onClose: () => void;
  onLinkClick?: (linkedPageId: string) => void;
}

export function StackedPage({ uuid, onClose }: StackedPageProps) {
  const { doc, loadingDoc, isLocked, updateDocAsync, getDocAsync } =
    useDocStore();

  React.useEffect(() => {
    getDocAsync(uuid);
  }, [getDocAsync, uuid]);

  if (loadingDoc) {
    return (
      <div className="h-full w-full bg-white dark:bg-gray-900 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="h-full w-full bg-white dark:bg-gray-900 flex items-center justify-center">
        Document not found
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-gray-200 dark:bg-gray-700 p-2 rounded-full"
      >
        Close
      </button>
      <Cover url={doc.image_url} preview={false} />
      <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
        <Toolbar initialData={doc} />
        <Editor
          onChange={async (content) => await updateDocAsync(uuid, { content })}
          initialContent={doc.content as string}
          editable={!isLocked}
          uuid={uuid}
          // onLinkClick={onLinkClick}
        />
      </div>
    </div>
  );
}
