import { Button } from "@/components/ui/button";
import {
  FileUpIcon,
  HomeIcon,
  PlusCircleIcon,
  SearchIcon,
  Trash2Icon,
  MessageCircle,
} from "lucide-react";
import NewDocDialog from "./dialog/new-doc-dialog";
import SearchDialog from "./dialog/search-dialog";
// import TrashDialog from "./dialog/trash-dialog"
import { useRouter } from "next/navigation";
import { useLayoutStore } from "@/store/use-layout-store";
import { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLayoutWrapper } from "../_hooks/use-layout-wrapper";
import { TrashBox } from "./trash-box";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SidebarMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerMinimize } = useLayoutStore();
  const { isMobile } = useLayoutWrapper();
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>(""); // Store feedback input

  const navigateHandler = (path: "documents") => {
    triggerMinimize(path);
    router.push(`/${path}`);
  };

  const handleSubmitFeedback = () => {
    console.log("Feedback submitted:", feedback);
    toast.success("Feedback submitted successfully!");
    setFeedback(""); // Clear input after submission
    setOpenPopover(null); // Close popover after submission
  };

  return (
    <div className="flex flex-col pb-3">
      <SearchDialog>
        <Button
          onClick={(e) => e.stopPropagation()}
          variant="ghost"
          className="h-8 justify-start px-3 font-normal text-primary/70 hover:bg-primary/5"
        >
          <SearchIcon className="mr-3 h-4 w-4" />
          Search
        </Button>
      </SearchDialog>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 justify-start px-3 font-normal text-muted-foreground hover:bg-muted"
          >
            <Trash2Icon className="mr-3 h-4 w-4" />
            Trash
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-full" side={isMobile ? "bottom" : "right"}>
          <TrashBox />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        className="h-8 justify-start px-3 font-normal text-primary/70 hover:bg-primary/5"
        onClick={() => navigateHandler("documents")}
      >
        <HomeIcon className="mr-3 h-4 w-4" />
        Home
      </Button>

      {/* Feedback Popover with Input */}
      <Popover
        open={openPopover === "feedback"}
        onOpenChange={(isOpen) => setOpenPopover(isOpen ? "feedback" : null)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 justify-start px-3 font-normal text-primary/70 hover:bg-primary/5"
          >
            <MessageCircle className="mr-3 h-4 w-4" />
            Feedback
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-3 w-64">
          <p className="text-sm text-muted-foreground mb-2">We value your feedback!</p>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback..."
            className="w-full h-20 p-2 text-sm border rounded-md"
          />
          <Button
            onClick={handleSubmitFeedback}
            className="mt-2 w-full bg-primary text-white dark:text-black"
            disabled={!feedback.trim()}
          >
            Submit
          </Button>
        </PopoverContent>
      </Popover>

      <NewDocDialog>
        <Button
          variant="ghost"
          className="h-8 justify-start px-3 font-normal text-primary/70 hover:bg-primary/5"
        >
          <PlusCircleIcon className="mr-3 h-4 w-4" />
          New Page
        </Button>
      </NewDocDialog>

      <Button
        variant="ghost"
        className="h-8 justify-start px-3 font-normal text-primary/70 hover:bg-primary/5"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileUpIcon className="mr-3 h-4 w-4" />
        <input
          title="file"
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
        />
        Upload Pdf
      </Button>
    </div>
  );
}
