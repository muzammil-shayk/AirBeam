import React, { useState } from "react";
import { Share, EllipsisVertical, SquarePlus, X } from "lucide-react";
import { HOME_SCREEN } from "../content.js";

const DISMISS_KEY = "airbeam.homeScreenHint.dismissed";

// Which wording to show, or null when the hint does not apply.
// Only touch phones that are not already running the installed app.
const detectPlatform = () => {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true;
  const touchPhone =
    window.matchMedia("(pointer: coarse)").matches &&
    navigator.maxTouchPoints > 0 &&
    Math.min(window.screen.width, window.screen.height) < 700;
  if (standalone || !touchPhone) return null;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "generic";
};

const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

const ICONS = {
  ios: <Share className="hint__icon" aria-hidden="true" />,
  android: <EllipsisVertical className="hint__icon" aria-hidden="true" />,
  generic: <SquarePlus className="hint__icon" aria-hidden="true" />,
};

const HomeScreenHint = () => {
  const [platform] = useState(detectPlatform);
  const [hidden, setHidden] = useState(wasDismissed);

  if (!platform || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode: the hint simply returns next visit.
    }
  };

  return (
    <aside className="hint" aria-label={HOME_SCREEN.title}>
      {ICONS[platform]}
      <p className="hint__text">
        <span className="hint__title">{HOME_SCREEN.title}.</span>{" "}
        {HOME_SCREEN[platform]}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="icon-btn"
        aria-label={HOME_SCREEN.dismiss}
        title={HOME_SCREEN.dismiss}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
};

export default HomeScreenHint;
