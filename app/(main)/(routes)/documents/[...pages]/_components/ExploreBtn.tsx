import { Button } from "@/components/ui/button";
import { usePageStore } from "@/store/use-page-store";
import { CopyX, MessageSquareText, ScrollText, SquareMenu } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const ExploreBtn = () => {
  const router = useRouter();
  const params = useParams();
  const  {tabs, toggleStack, isStackOpen } = usePageStore()
  const navigateHandler = (path: "papersearch") => {
    router.push(`/${path}`);
  };
  const navigateHandler2 = (path: "aidiscourse") => {
    router.push(`/${path}`);
  };
    const shouldRender = tabs.length >0 &&
    params.pages &&
    params.pages[0];
  
  return (
    <div className="flex">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigateHandler("papersearch")}
      >
        <ScrollText className="w-4 h-4" />
        Explore papers
      </Button>
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigateHandler2("aidiscourse")}
      >
        <MessageSquareText className="w-4 h-4" />
        AI Discourse
      </Button>
      {shouldRender && <Button
        variant="ghost"
        className="gap-2"
        onClick={toggleStack}
      >
       {isStackOpen? <CopyX className="w-4 h-4" />: <SquareMenu className="w-4 h-4" />}
      </Button>}
    </div>
  );
};

export default ExploreBtn;
