"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Type, Eye, Contrast, ZoomIn, ZoomOut, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AccessibilityToolbar() {
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedTextSize = localStorage.getItem("a11y-text-size");
    const savedContrast = localStorage.getItem("a11y-contrast") === "true";
    const savedDyslexic = localStorage.getItem("a11y-dyslexic") === "true";

    if (savedTextSize) applyFontSize(Number(savedTextSize));
    if (savedContrast) applyHighContrast(true);
    if (savedDyslexic) applyDyslexicFont(true);
  }, []);

  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}%`;
    localStorage.setItem("a11y-text-size", size.toString());
  };

  const applyHighContrast = (enable: boolean) => {
    setHighContrast(enable);
    if (enable) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem("a11y-contrast", enable.toString());
  };

  const applyDyslexicFont = (enable: boolean) => {
    setDyslexicFont(enable);
    if (enable) {
      document.documentElement.classList.add("font-dyslexic");
    } else {
      document.documentElement.classList.remove("font-dyslexic");
    }
    localStorage.setItem("a11y-dyslexic", enable.toString());
  };

  const resetAll = () => {
    applyFontSize(100);
    applyHighContrast(false);
    applyDyslexicFont(false);
  };

  if (!mounted) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 left-6 h-12 w-12 rounded-full shadow-card z-50 bg-brand-surface border-brand-border text-brand-primary hover:bg-brand-bg hover:text-brand-secondary transition-all"
          aria-label="Accessibility settings"
        >
          <Eye className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-5 rounded-card shadow-dropdown border-brand-border"
        sideOffset={16}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-semibold text-lg text-brand-text flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand-primary" />
            Accessibility Tools
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-xs text-brand-muted hover:text-brand-text h-8 px-2"
          >
            Reset
          </Button>
        </div>

        <div className="space-y-6">
          {/* Text Size */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-brand-text flex items-center gap-2">
                <Type className="h-4 w-4 text-brand-primary" /> Text Size
              </Label>
              <span className="text-xs font-mono bg-brand-bg px-2 py-1 rounded text-brand-primary">
                {fontSize}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => applyFontSize(Math.max(80, fontSize - 10))}
                disabled={fontSize <= 80}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[fontSize]}
                min={80}
                max={150}
                step={5}
                onValueChange={(val) => applyFontSize(val[0])}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => applyFontSize(Math.min(150, fontSize + 10))}
                disabled={fontSize >= 150}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-brand-text flex items-center gap-2">
                <Contrast className="h-4 w-4 text-brand-primary" /> High Contrast
              </Label>
              <p className="text-xs text-brand-muted">
                Enhance colors for better visibility
              </p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={applyHighContrast}
              className="data-[state=checked]:bg-brand-primary"
            />
          </div>

          {/* Dyslexia Friendly */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-brand-text flex items-center gap-2">
                <Type className="h-4 w-4 text-brand-primary" /> Dyslexia Font
              </Label>
              <p className="text-xs text-brand-muted">
                Easier to read typography
              </p>
            </div>
            <Switch
              checked={dyslexicFont}
              onCheckedChange={applyDyslexicFont}
              className="data-[state=checked]:bg-brand-primary"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
