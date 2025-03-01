export type ActionStatus = "success" | "failed";
export type EmitActionStatus = (v: ActionStatus) => void;
export interface UndoRedoInstance {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  history: {
    past: unknown[];
    present: unknown;
    future: unknown[];
  };
}

// type Block = {
//   id: string;
//   type: string;
//   props: {
//     textColor: string;
//     backgroundColor: string;
//     textAlignment: string;
//     level?: number; // For headings
//     width?: number; // For column blocks
//   };
//   content: InlineContent[] | TableContent | undefined;
//   children: Block[];
// };

// type InlineContent = Link | StyledText;

// type Link = {
//   type: "link";
//   content: StyledText[];
//   href: string;
// };

// type StyledText = {
//   type: "text";
//   text: string;
//   styles: Styles;
// };

// type Styles = {
//   bold?: boolean;
//   italic?: boolean;
//   color?: string;
//   fontSize?: number;
// };

// type TableContent = any; // Adjust this type as per your table content structure
