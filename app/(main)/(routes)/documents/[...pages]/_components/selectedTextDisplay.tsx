import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CornerDownLeft, X } from "lucide-react";

interface SelectedTextDisplayProps {
  text: string;
  onClear: () => void;
}

export function SelectedTextDisplay({
  text,
  onClear,
}: SelectedTextDisplayProps) {
  if (!text) return null;

  return (
    <Card className="mb-2">
      <CardContent className="p-2 pr-8 relative text-sm flex">
        <CornerDownLeft className="absolute left-0 w-6 h-6 m-2" />
        <p className="ml-6 line-clamp-2">{text}</p>
        <Button
          onClick={onClear}
          type="reset"
          variant={"destructive"}
          className="absolute right-0 rounded-full"
        >
          <X size={14} />
        </Button>
      </CardContent>
    </Card>
  );
}
