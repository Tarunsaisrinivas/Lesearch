import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import { useState, useCallback } from "react";

export function PageLinkButton() {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isSelected, setIsSelected] = useState(false);

  const handleLinkClick = useCallback(() => {
    setIsLinkModalOpen(true);
  }, []);

  const handleLinkSubmit = useCallback(
    (url: string) => {
      if (url.trim() !== "") {
        const linkUrl =
          url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `doc://${url}`;

        editor.toggleStyles({
          textColor: "blue",
        });
        editor.createLink(linkUrl);
      }
      setIsLinkModalOpen(false);
      setUrl("");
    },
    [editor],
  );

  useEditorContentOrSelectionChange(() => {
    const activeStyles = editor.getActiveStyles();
    setIsSelected(
      activeStyles.textColor === "blue" && editor.getSelectedLinkUrl() !== null,
    );
  }, editor);

  return (
    <>
      <Components.FormattingToolbar.Button
        mainTooltip="Create Page Link"
        onClick={handleLinkClick}
        isSelected={isSelected}
      >
        🔗
      </Components.FormattingToolbar.Button>
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <input
              type="text"
              placeholder="Enter URL or page ID"
              className="border p-2 mb-2 w-full"
              value={url}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLinkSubmit(url);
                }
              }}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setUrl("");
                }}
                className="mr-2 px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLinkSubmit(url)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
