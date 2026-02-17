import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-white text-[#1E293B] border-[#E1ECF7]",
        destructive:
          "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] [&>svg]:text-[#EF4444]",
        warning:
          "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E] [&>svg]:text-[#F59E0B]",
        info:
          "bg-[#EFF6FF] border-[#93C5FD] text-[#1E40AF] [&>svg]:text-[#2563EB]",
        success:
          "bg-[#F0FDF4] border-[#86EFAC] text-[#14532D] [&>svg]:text-[#22C55E]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    icon?: React.ReactNode;
    onClose?: () => void;
  }
>(({ className, variant, icon, onClose, children, ...props }, ref) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon || getDefaultIcon()}
      <div className="flex items-start justify-between">
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
});

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));

AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
