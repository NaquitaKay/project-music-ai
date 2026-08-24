"use client";

import { Dialog, VisuallyHidden } from "radix-ui";
import type * as React from "react";

import { cn } from "~/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content> & { title: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      />
      <Dialog.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex flex-col gap-6 border-b border-border bg-background p-6 shadow-lg",
          className,
        )}
        {...props}
      >
        <VisuallyHidden.Root asChild>
          <Dialog.Title>{title}</Dialog.Title>
        </VisuallyHidden.Root>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTrigger };
