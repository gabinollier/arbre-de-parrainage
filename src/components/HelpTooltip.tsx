"use client";

import { CircleQuestionMark } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type HelpTooltipProps = {
  children: ReactNode;
};

const TOOLTIP_MARGIN = 8;

export default function HelpTooltip({ children }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Prefer showing below the icon, flip above if it would overflow vertically.
    let top = triggerRect.bottom + TOOLTIP_MARGIN;
    if (top + tooltipRect.height > viewportHeight - TOOLTIP_MARGIN) {
      top = triggerRect.top - tooltipRect.height - TOOLTIP_MARGIN;
    }
    top = Math.max(
      TOOLTIP_MARGIN,
      Math.min(top, viewportHeight - tooltipRect.height - TOOLTIP_MARGIN),
    );

    // Align the tooltip's left edge with the trigger's left edge, clamped so
    // the tooltip always stays on screen.
    const left = Math.max(
      TOOLTIP_MARGIN,
      Math.min(
        triggerRect.left,
        viewportWidth - tooltipRect.width - TOOLTIP_MARGIN,
      ),
    );

    setPosition({ top, left });
  }, []);

  const show = useCallback(() => {
    setIsVisible(true);
    computePosition();
  }, [computePosition]);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    computePosition();
    window.addEventListener("resize", computePosition);
    window.addEventListener("scroll", computePosition, true);
    return () => {
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("scroll", computePosition, true);
    };
  }, [isVisible, computePosition]);

  return (
    <button
      type="button"
      ref={triggerRef}
      aria-describedby={isVisible ? tooltipId : undefined}
      className="relative inline-flex ml-2 align-sub"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <CircleQuestionMark className="w-4 h-4 text-gray-400 hover:text-gray-700 transition-colors duration-200" />
      <div
        id={tooltipId}
        ref={tooltipRef}
        aria-hidden={!isVisible}
        className={`z-50 pointer-events-none fixed whitespace-normal rounded-lg bg-gray-700 px-3 py-1 text-left text-xs text-white shadow-lg max-w-[min(90vw,600px)] transition-opacity duration-150 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
      >
        {children}
      </div>
    </button>
  );
}
