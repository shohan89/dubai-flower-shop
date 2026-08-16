import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Drawer({
  trigger,
  title,
  description,
  side = "right",
  open,
  onOpenChange,
  children,
}: {
  trigger?: React.ReactElement;
  title: string;
  description?: string;
  side?: "left" | "right";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger render={trigger} /> : null}
      <SheetContent side={side} className="w-full overflow-y-auto p-6 sm:max-w-md">
        <SheetHeader className="p-0">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
