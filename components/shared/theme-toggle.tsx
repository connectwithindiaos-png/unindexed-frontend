"use client";

import { Button } from "@/components/ui/button";
import { FiTerminal } from "react-icons/fi";

export function ThemeToggle() {
  return (
    <Button variant="ghost" size="icon" className="text-emerald-700/50 cursor-default" disabled>
      <FiTerminal className="h-4 w-4" />
      <span className="sr-only">Dark mode only</span>
    </Button>
  );
}
