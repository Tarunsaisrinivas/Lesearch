import { createReactInlineContentSpec } from "@blocknote/react";
import katex from "katex";

export const ConvertEquation = createReactInlineContentSpec(
  {
    type: "equation",
    propSchema: {
      equation: {
        type: "string",
        default: "",
      },
    },
    content: "none",
  },
  {
    render: ({ inlineContent }) => {
      const EquationContent = () => {
        const html = katex.renderToString(
          inlineContent.props.equation.replace(/\$/g, ""),
          {
            throwOnError: false,
            displayMode: false,
          },
        );

        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      };
      return <EquationContent />;
    },
  },
);
