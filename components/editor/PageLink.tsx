import { createReactInlineContentSpec } from "@blocknote/react";
// import { useRouter, usePathname } from 'next/navigation';
import { useState } from "react";
import { toastError, toastSuccess } from "../toast";
// import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// import { Terminal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { usePageStore } from "@/store/use-page-store";

export const PageLink = createReactInlineContentSpec(
  {
    type: "page-link",
    propSchema: {
      id: { type: "string", default: "" },
      name: { type: "string", default: "" },
    },
    content: "none",
  },
  {
    render: ({ inlineContent }) => {
      const PageLinkContent = () => {
        // const router = useRouter();
        // const currentPath = usePathname();
        const [showNoPageDialog, setShowNoPageDialog] = useState(false);
        const [showArxivDialog, setShowArxivDialog] = useState(false);
        const { stackedPage, addPage } = usePageStore();

        const handleClick = () => {
          const pageId = inlineContent.props.id;
          // const pathParts = currentPath.split('/documents/').filter(Boolean);
          if (!pageId) {
            setShowNoPageDialog(true);
          } else if (pageId.startsWith("arxiv")) {
            setShowArxivDialog(true);
          } else {
            if (stackedPage === pageId) {
              toastError({ description: "Page already opened" });
            } else {
              // router.push(`${currentPath}/${pageId}`);
              // const baseUuid = pathParts[0].split('/')[0];
              // const newPath = `/documents/${baseUuid}/${pageId}`;
              // console.log(baseUuid)
              // router.push(newPath);
              addPage(pageId);
            }
          }
        };
        // const handleClick = () => {
        //   const pageId = inlineContent.props.id;
        //   const pathParts = currentPath.split('/').filter(Boolean);
        //   console.log(pathParts)
        //   if (!pageId) {
        //     setShowNoPageDialog(true);
        //   } else if (pageId.startsWith('arxiv')) {
        //     setShowArxivDialog(true);
        //   } else {
        //     if (pathParts.includes(pageId)) {
        //       toastError({ description: "Page already opened" });
        //     } else {
        //       router.push(`${currentPath}/${pageId}`);
        //     }
        //   }
        // };

        const handleConvertArxiv = () => {
          // Implement the conversion logic here
          toastSuccess({ description: "Converting Arxiv page to database" });
          setShowArxivDialog(false);
          // After conversion, you might want to navigate to the new page
          // router.push(`${currentPath}/${convertedPageId}`);
        };

        return (
          <>
            <span className="page-link" onClick={handleClick}>
              {inlineContent.props.name}
            </span>

            <AlertDialog
              open={showNoPageDialog}
              onOpenChange={setShowNoPageDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <AlertCircle />
                    No Page Found
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    No page was found in Arxiv or the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowNoPageDialog(false)}>
                    OK
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={showArxivDialog}
              onOpenChange={setShowArxivDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Arxiv Page Found</AlertDialogTitle>
                  <AlertDialogDescription>
                    An Arxiv page was found. Would you like to convert it to our
                    database?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConvertArxiv}>
                    Convert
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      };
      return <PageLinkContent />;
    },
  },
);
