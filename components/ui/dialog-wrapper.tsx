"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./dialog";
import { cn } from "../../lib/utils";
import { ComponentProps } from "react";

interface DialogWrapperProps extends ComponentProps<typeof DialogContent> {
  title: string;
  description?: string;
}

export function DialogWrapper({
  title,
  description,
  className,
  children,
  ...props
}: DialogWrapperProps) {
  return (
    <DialogContent className={cn(className)} {...props}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  );
}
