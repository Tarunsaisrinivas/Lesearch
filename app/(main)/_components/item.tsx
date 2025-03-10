"use client";

import {
  ChevronDown,
  ChevronRight,
  type LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
// import { createDocument, archiveDocument } from "@/app/actions/documentActions"
// import { useSession } from "next-auth/react";

interface ItemProps {
  id?: string;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  onFetchDocuments?: () => void;
  icon: LucideIcon;
}

export const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
  // onFetchDocuments,
}: ItemProps) => {
  // const router = useRouter();
  const [isLoading, 
    // setIsLoading
  ] = useState(false);
  // const { data: session } = useSession();

  // const onArchive = async (
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => {
  //   event.stopPropagation()
  //   if (!id) return
  //   setIsLoading(true)
  //   try {
  //     await archiveDocument(id)
  //     router.push("/documents")
  //     toast.success("Note moved to trash!")
  //     onFetchDocuments?.();
  //   } catch (error) {
  //     console.log(error)
  //     toast.error("Failed to archive note.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  // const onCreate = async (
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => {
  //   event.stopPropagation()
  //   if (!id || !session?.user.id) return
  //   setIsLoading(true)
  //   try {
  //     const documentId = await createDocument("Untitled", id, session?.user.id)
  //     if (!expanded) {
  //       onExpand?.()
  //     }
  //     router.push(`/documents/${documentId}`)
  //     toast.success("New note created!")
  //     onFetchDocuments?.();
  //   } catch (error) {
  //     console.log(error)
  //     toast.error("Failed to create a new note.")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div
      onClick={onClick}
      role="button"
      style={{
        paddingLeft: level ? `${level * 12 + 12}px` : "12px",
      }}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
        active && "bg-primary/5 text-primary",
      )}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
          onClick={handleExpand}
        >
          <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </div>
      )}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">{documentIcon}</div>
      ) : (
        <Icon className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground" />
      )}
      <span className="truncate">{label}</span>
      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
              <div
                role="button"
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60"
              align="start"
              side="right"
              forceMount
            >
              <DropdownMenuItem
              // onClick={onArchive}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="text-xs text-muted-foreground p-2">
                {/* Last edited by: {session?.user.firstname} */}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            role="button"
            // onClick={onCreate}
            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? ` ${level * 12 + 25}px ` : "12px",
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]"/>
    </div>
  );
};
