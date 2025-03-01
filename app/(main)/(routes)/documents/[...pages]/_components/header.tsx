import {
  useParams,
  usePathname,
  useSelectedLayoutSegment,
} from "next/navigation";
import React from "react";
import { useHeader } from "../_hooks/use-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2Icon,
  LoaderIcon,
  MoreHorizontalIcon,
  // Share2Icon,
  StarIcon,
  XCircleIcon,
  ChevronRightIcon,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderMoreMenuPopover from "./popover/header-more-menu-popover";
import { useSidebarStore } from "@/store/use-sidebar-store";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
// import { Json } from "@/lib/supabase/database.types"
import { Emoji } from "@/components/popover/emoji-picker-popover";
import { usePageStore } from "@/store/use-page-store";

type SaveStatusType = "start" | "success" | "failed" | null;

interface StatusConfig {
  Icon: LucideIcon;
  text: string;
  className: string;
  animation?: string;
}

interface SaveStatusProps {
  status: SaveStatusType;
}

interface BreadcrumbItem {
  uuid: string;
  title: string;
  emoji?: Emoji | null;
}

interface BreadcrumbsProps {
  currentUuid: string;
}

const statusConfig: Record<NonNullable<SaveStatusType>, StatusConfig> = {
  start: {
    Icon: LoaderIcon,
    text: "Saving",
    className: "text-muted-foreground",
    animation: "animate-spin",
  },
  success: {
    Icon: CheckCircle2Icon,
    text: "Save success",
    className: "text-green-600",
  },
  failed: {
    Icon: XCircleIcon,
    text: "Save failed",
    className: "text-destructive",
  },
};

const SaveStatus: React.FC<SaveStatusProps> = ({ status }) => {
  if (!status) return null;

  const config = statusConfig[status];
  if (!config) return null;

  const { Icon, text, className, animation } = config;

  return (
    <p className={`flex items-center gap-x-1 text-xs ${className}`}>
      <Icon className={`inline-block ${animation || ""}`} size={14} />
      <span className="hidden md:inline">{text}</span>
    </p>
  );
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentUuid }) => {
  const { publicSidebarTree, privateSidebarTree } = useSidebarStore();
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);

  React.useEffect(() => {
    if (!privateSidebarTree || !publicSidebarTree || !currentUuid) return;

    const getBreadcrumbs = (
      uuid: string,
      acc: BreadcrumbItem[] = [],
    ): BreadcrumbItem[] => {
      const node = privateSidebarTree.get(uuid) || publicSidebarTree.get(uuid);
      if (!node) return acc;
      acc.unshift({
        uuid: node.uuid,
        title: node.title || "Untitled",
        emoji: node.emoji as Emoji,
      });

      if (node.parent_uuid) {
        return getBreadcrumbs(node.parent_uuid, acc);
      }

      return acc;
    };

    const crumbs = getBreadcrumbs(currentUuid);
    setBreadcrumbs(crumbs);
  }, [publicSidebarTree, privateSidebarTree, currentUuid]);

  if (!breadcrumbs.length) {
    return <span className="text-sm font-medium">Untitled</span>;
  }

  return (
    <div className="flex items-center gap-x-1 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.uuid}>
          {index > 0 && (
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <Link
            href={`/documents/${crumb.uuid}`}
            className="flex items-center gap-x-1 font-medium hover:text-foreground/80"
          >
            {crumb.emoji && (
              <span
                role="img"
                aria-label={crumb.emoji?.name}
                className="block w-4 text-sm antialiased"
              >
                {crumb.emoji?.native}
              </span>
            )}
            <span>{crumb.title}</span>
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
};

export default function DocDetailHeader() {
  const path = usePathname();
  const params = useParams();
  const segment = useSelectedLayoutSegment();
  const { saveStatus, showLoadingIndicator } = useHeader();
  const { toggleChat, isChatOpen } = usePageStore();

  const shouldRender =
    segment === "(routes)" &&
    path.startsWith("/documents") &&
    params.pages &&
    params.pages[0];
  const uuid = params.pages && params.pages[0];
  if (!shouldRender) return null;

  return (
    <div className="flex w-full items-center justify-between">
      {showLoadingIndicator ? (
        <DocDetailHeader.Skeleton />
      ) : (
        <>
          <div className="flex items-center gap-x-2">
            <Breadcrumbs currentUuid={uuid as string} />
            <SaveStatus status={saveStatus} />
          </div>
          <div className="flex items-center space-x-2">
            {/* <ExploreBtn/> */}
            {/* <Button
              variant="ghost"
              size="sm"
              className=" h-7 text-sm font-normal flex gap-1"
            >
              Share
              <Share2Icon className="h-4 w-4" />
            </Button> */}

            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-full text-sm font-normal flex gap-1 ${isChatOpen ? "bg-secondary" : ""}`}
              onClick={toggleChat}
            >
              Chat
              <MessageCircle className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-7 w-7">
              <StarIcon className="h-4 w-4" />
            </Button>

            <HeaderMoreMenuPopover>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </HeaderMoreMenuPopover>
          </div>
        </>
      )}
    </div>
  );
}

DocDetailHeader.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex w-full items-center justify-between">
      <Skeleton className="h-7 w-[200px] bg-primary/5 md:w-[300px]" />
      <div className="flex items-center space-x-3">
        <Skeleton className="hidden h-7 w-[100px] bg-primary/5 md:block" />
        <Skeleton className="h-7 w-7 bg-primary/5" />
        <Skeleton className="h-7 w-7 bg-primary/5" />
        <Skeleton className="h-7 w-7 bg-primary/5" />
      </div>
    </div>
  );
};
