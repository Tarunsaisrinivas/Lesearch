"use client";
import "katex/dist/katex.min.css";
import {
  Block,
  BlockNoteSchema,
  defaultInlineContentSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  useCreateBlockNote,
  DefaultReactSuggestionItem,
  FormattingToolbarController,
  FormattingToolbar,
  BlockTypeSelect,
  FileCaptionButton,
  FileReplaceButton,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton,
} from "@blocknote/react";
import { useMemo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";
import { PageLink } from "@/components/editor/PageLink";
import { useUserStore } from "@/store/use-user-store";
import { Emoji } from "./popover/emoji-picker-popover";
import { ConvertEquationBtn } from "./editor/ConvertEquationBtn";
import { ConvertEquation } from "./editor/ConvertEquation";
import { AskAIBtn } from "./editor/AskAIButton";
import { usePageStore } from "@/store/use-page-store";

interface PageItem {
  id: string;
  name: string;
  emoji: Emoji;
}

const fetchPages = async (
  query: string,
  user_id: string,
  uuid: string,
): Promise<PageItem[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pages")
      .select("uuid, title, emoji")
      .eq("user_id", user_id)
      .or("is_deleted.is.null,is_deleted.is.false")
      .neq("uuid", uuid)
      .filter("title", "ilike", `%${query}%`)
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map((page) => ({
      id: page.uuid,
      name: page.title,
      emoji: page.emoji,
    }));
  } catch (error) {
    console.error("Error fetching pages:", error);
    toast.error("Failed to fetch pages. Please try again.");
    return [];
  }
};

interface EditorProps {
  onChange?: (content: string) => Promise<void>;
  initialContent?: string;
  uuid: string;
  editable?: boolean;
}

export default function Editor({
  onChange,
  initialContent,
  editable = true,
  uuid,
}: EditorProps) {
  const { currentUser } = useUserStore();
  const editorRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const th = theme === "dark" || theme === "system" ? "dark" : "light";
  const { setSelectedText } = usePageStore();

  const parsedContent = useMemo(() => {
    if (typeof initialContent === "string") {
      try {
        return JSON.parse(initialContent);
      } catch (error) {
        console.error("Failed to parse initial content:", error);
        return undefined;
      }
    }
    return initialContent;
  }, [initialContent]);

  const handleUploadFile = useCallback(async (file: File): Promise<string> => {
    try {
      const supabase = createClient();
      const filename = `${uuidv4()}-${file.name}`;
      let folder = "";
      const fileType = file.type;

      if (fileType.startsWith("image/")) {
        folder = "images";
      } else if (fileType === "application/pdf") {
        folder = "documents";
      } else if (fileType.startsWith("video/")) {
        folder = "videos";
      } else if (fileType.startsWith("audio/")) {
        folder = "audio";
      } else {
        toast.error("Unsupported file type");
        return "";
      }

      const { error } = await supabase.storage
        .from("editor-uploads")
        .upload(`${folder}/${filename}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("editor-uploads")
        .getPublicUrl(`${folder}/${filename}`);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      return "";
    }
  }, []);

  const schema = useMemo(
    () =>
      BlockNoteSchema.create({
        inlineContentSpecs: {
          ...defaultInlineContentSpecs,
          "page-link": PageLink,
          equation: ConvertEquation,
        },
      }),
    [],
  );

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent as Block[],
    uploadFile: handleUploadFile,
  });
  const { toggleChat, isChatOpen } = usePageStore();
  const updateContent = useCallback(
    async (content: string) => {
      try {
        if (onChange) await onChange(content);
      } catch (error) {
        console.error("Failed to save changes:", error);
        toast.error("Failed to save changes");
      }
    },
    [onChange],
  );

  const debouncedUpdate = useMemo(
    () => debounce(updateContent, 1000),
    [updateContent],
  );

  const handleEditorChange = useCallback(() => {
    try {
      const blocks = editor.document;
      debouncedUpdate(JSON.stringify(blocks));
    } catch (error) {
      console.error("Error handling editor change:", error);
      toast.error("Failed to process changes");
    }
  }, [editor, debouncedUpdate]);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handleEquationConversion = useCallback(() => {
    const selectedText = editor.getSelectedText();

    if (selectedText) {
      const replacementContent = [
        {
          type: "equation" as const,
          props: { equation: selectedText },
        },
        " ",
      ];

      editor.insertInlineContent(replacementContent);
    }
  }, [editor]);

  const handleSelectedText = useCallback(() => {
    const selectedText = editor.getSelectedText();
    if (selectedText) {
      setSelectedText({text: selectedText , pageType:"main"});
      if (!isChatOpen) toggleChat();
    }
  }, [editor, setSelectedText, toggleChat, isChatOpen]);

  const getPageLinkMenuItems = useCallback(
    async (query: string): Promise<DefaultReactSuggestionItem[]> => {
      if (!currentUser?.id) return [];
      const pages = await fetchPages(query, currentUser.id, uuid);
      return pages.map((page) => ({
        key: page.id,
        title: page.name,
        icon: page.emoji ? (
          <span role="img" aria-label={page.emoji.name}>
            {page.emoji.native}
          </span>
        ) : null,
        onItemClick: () => {
          editor.insertInlineContent([
            {
              type: "page-link",
              props: { id: page.id, name: page.name },
            },
            " ",
          ]);
        },
      }));
    },
    [editor, currentUser, uuid],
  );

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.userSelect = "text";
    }
  }, []);

  return (
    <div ref={editorRef} className="relative w-full">
      <style jsx global>{`
        .page-link {
          color: green;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleEditorChange}
        theme={th}
        
        formattingToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter="@"
          getItems={async (query) =>
            filterSuggestionItems(await getPageLinkMenuItems(query), query)
          }
        />
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <AskAIBtn key="AskAI" onClick={handleSelectedText} />
              {editable && (
                <ConvertEquationBtn
                  key="convertEquation"
                  onConvert={handleEquationConversion}
                />
              )}
              <BlockTypeSelect key={"blockTypeSelect"} />

              <FileCaptionButton key={"fileCaptionButton"} />
              <FileReplaceButton key={"replaceFileButton"} />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              <BasicTextStyleButton
                key={"codeStyleButton"}
                basicTextStyle={"code"}
              />

              <TextAlignButton
                textAlignment={"left"}
                key={"textAlignLeftButton"}
              />
              <TextAlignButton
                textAlignment={"center"}
                key={"textAlignCenterButton"}
              />
              <TextAlignButton
                textAlignment={"right"}
                key={"textAlignRightButton"}
              />

              <ColorStyleButton key={"colorStyleButton"} />

              <NestBlockButton key={"nestBlockButton"} />
              <UnnestBlockButton key={"unnestBlockButton"} />

              <CreateLinkButton key={"createLinkButton"} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
    </div>
  );
}
