import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="mx-auto flex w-full flex-col items-center justify-end p-6 md:flex-row md:items-start">
      <div>
        <div className="mb-2 flex justify-center gap-x-4">
          <Button
            className="h-min p-0 text-xs font-medium md:text-sm"
            size="sm"
            variant="link"
          >
            Privacy Policy
          </Button>

          <Button
            className="h-min p-0 text-xs font-medium md:text-sm"
            size="sm"
            variant="link"
          >
            Terms & Conditions
          </Button>
        </div>

        <p className="text-right text-xs text-muted-foreground">
          © {new Date().getFullYear()} ResearchMind - All rights reserved.
        </p>
      </div>
    </footer>
  );
};
