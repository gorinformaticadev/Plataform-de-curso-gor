"use client";

import { DialogContent } from "./dialog";
import { cn } from "@/lib/utils";

interface AccessibleDialogContentProps extends React.ComponentProps<typeof DialogContent> {
  descriptionId: string;
  descriptionText: string;
}

export function AccessibleDialogContent({
  descriptionId,
  descriptionText,
  children,
  className,
  ...props
}: AccessibleDialogContentProps) {
  return (
    <DialogContent 
      aria-describedby={descriptionId} 
      className={cn(className)}
      {...props}
    >
      <p id={descriptionId} className="sr-only">{descriptionText}</p>
      {children}
    </DialogContent>
  );
}
