"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
  type HighlightArea,
  highlightPlugin,
  type RenderHighlightTargetProps,
  type RenderHighlightsProps,
} from "@react-pdf-viewer/highlight";
import { Button } from "./ui/button";
import { usePageStore } from "@/store/use-page-store";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import openLinksPlugin from "./openLinksPlugin";

interface PDFViewerProps {
  pdfUrl: string | File;
  onExplain: (text: string) => void;
}

interface Note {
  id: number;
  highlightAreas: HighlightArea[];
  quote: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onExplain }) => {
  const [fileUrl, setFileUrl] = useState<string | Uint8Array>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const {addTab,  setActiveTab , updateTabUrl } = usePageStore();

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const highlightText = useCallback((props: RenderHighlightTargetProps) => {
    setNotes((prevNotes) => [
      ...prevNotes,
      {
        id: prevNotes.length + 1,
        highlightAreas: props.highlightAreas,
        quote: props.selectedText,
      },
    ]);
    props.cancel();
  }, []);

  const removeHighlight = useCallback((noteId: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    setSelectedNoteId(null);
  }, []);

  const renderHighlightTarget = useCallback(
    (props: RenderHighlightTargetProps) => (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "2px",
          padding: "8px",
          position: "absolute",
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top}%`,
          transform: "translate(0, -100%)",
          zIndex: 1,
          display: "flex",
          gap: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          onClick={() => highlightText(props)}
          variant="outline"
          size="sm"
        >
          Highlight
        </Button>
        <Button
          onClick={() => {
            onExplain(props.selectedText);
            props.cancel();
          }}
          variant="outline"
          size="sm"
        >
          Explain
        </Button>
      </div>
    ),
    [highlightText, onExplain],
  );

  const renderHighlights = useCallback(
    ({ pageIndex, rotation, getCssProperties }: RenderHighlightsProps) => (
      <div>
        {notes.map((note) => (
          <React.Fragment key={note.id}>
            {note.highlightAreas
              .filter((area) => area.pageIndex === pageIndex)
              .map((area, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "yellow",
                    opacity: 0.4,
                    cursor: "pointer",
                    ...getCssProperties(area, rotation),
                  }}
                  onClick={() => setSelectedNoteId(note.id)}
                />
              ))}
          </React.Fragment>
        ))}
        {selectedNoteId && (
          <div
            style={{
              background: "#fff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "2px",
              padding: "8px",
              position: "absolute",
              left: 0,
              top: 0,
              transform: "translate(0, -100%)",
              zIndex: 1,
              display: "flex",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Button
              onClick={() => removeHighlight(selectedNoteId)}
              variant="outline"
              size="sm"
            >
              Remove Highlight
            </Button>
          </div>
        )}
      </div>
    ),
    [notes, selectedNoteId, removeHighlight],
  );
  if (selectedNoteId) {
    console.log(selectedNoteId);
  }

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    renderHighlights,
  });

  useEffect(() => {
    if (typeof pdfUrl === "string") {
      setFileUrl(pdfUrl);
    } else if (pdfUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          setFileUrl(new Uint8Array(e.target.result));
        }
      };
      reader.readAsArrayBuffer(pdfUrl);
    }
  }, [pdfUrl]);

  if (!fileUrl) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div className="h-full w-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[
            defaultLayoutPluginInstance,
            highlightPluginInstance,
            openLinksPlugin(addTab, setActiveTab,updateTabUrl ),
          ]}
          defaultScale={SpecialZoomLevel.PageWidth}
        />
      </Worker>
    </div>
  );
};
