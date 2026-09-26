import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { cn } from "@/lib/utils";
import { createContext, useContext } from "react";
import FileIcon from "../common/FileIcon";

const SourceContext = createContext(null);

function useSourceContext() {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error("Source.* must be used inside <Source>");
  return ctx;
}

export function Source({ fileType, children }) {
  return (
    <SourceContext.Provider value={{ fileType }}>
      <HoverCard openDelay={150} closeDelay={0}>
        {children}
      </HoverCard>
    </SourceContext.Provider>
  );
}

export function SourceTrigger({ label, className }) {
  const { fileType } = useSourceContext();

  return (
    <HoverCardTrigger
      render={
        <button
          type="button"
          aria-label={`Source file type ${fileType}`}
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted cursor-help",
            className,
          )}
        />
      }
    >
      <FileIcon type={fileType} size="sm" />
    </HoverCardTrigger>
  );
}

export function SourceContent({ title, description, className }) {
  const { fileType } = useSourceContext();

  return (
    <HoverCardContent className={cn("w-80 p-3 shadow-xs", className)}>
      <div className="flex flex-col gap-2">
        <div className="text-primary text-xs font-medium uppercase">
          {fileType}
        </div>
        <div className="line-clamp-2 text-sm font-medium">{title}</div>
        <div className="text-muted-foreground line-clamp-2 text-sm">
          {description}
        </div>
      </div>
    </HoverCardContent>
  );
}
