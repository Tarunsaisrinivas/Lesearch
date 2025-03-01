import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "info";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md p-4",
          variant === "destructive" && "bg-red-500 text-white",
          variant === "success" && "bg-green-500 text-white",
          variant === "info" && "bg-blue-500 text-white",
          variant === "default" && "bg-gray-100 text-gray-800",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Alert.displayName = "Alert";

export interface AlertTitleProps {
  children: React.ReactNode;
}

const AlertTitle: React.FC<AlertTitleProps> = ({ children }) => (
  <div className="font-semibold text-lg">{children}</div>
);

export interface AlertDescriptionProps {
  children: React.ReactNode;
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children }) => (
  <div className="mt-2 text-sm">{children}</div>
);

export { Alert, AlertTitle, AlertDescription };
