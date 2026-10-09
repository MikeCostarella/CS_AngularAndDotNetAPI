// The student's course folder (e.g. C:\Users\Mike\ng-dotnet), remembered in
// this browser so "VS Code" step labels can open the right lab folder.
//
// Stored in localStorage: it survives closing the browser, stays on this
// computer, and is per browser and per site address. Every access is wrapped,
// because storage can be blocked (private windows, strict privacy settings).

import { useEffect, useState } from "react";

const KEY = "ng-dotnet.courseFolder";
const EVENT = "ng-dotnet:course-folder";

export function readCourseFolder(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveCourseFolder(path: string | null): boolean {
  try {
    if (path) window.localStorage.setItem(KEY, path);
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

/**
 * Turns whatever the student pasted into a clean absolute path, or null.
 * Accepts the bare path, a quoted path, or the whole PowerShell prompt
 * ("PS C:\Users\Mike\ng-dotnet>").
 */
export function normalizeFolder(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/^PS\s+/i, "").replace(/>\s*$/, "").trim();
  s = s.replace(/^["']|["']$/g, "").trim();
  s = s.replace(/[\\/]+$/, "");
  if (/^[A-Za-z]:[\\/]/.test(s)) return s.replace(/\//g, "\\"); // Windows
  if (s.startsWith("/")) return s; // macOS / Linux
  return null;
}

/** Joins a child folder onto the course folder using that path's separator. */
export function joinFolder(base: string, child?: string): string {
  if (!child) return base;
  const sep = base.includes("\\") ? "\\" : "/";
  return `${base}${sep}${child}`;
}

/** vscode://file/C:/Users/Mike/ng-dotnet/lab01 — opens the folder in VS Code. */
export function vscodeUrl(path: string): string {
  const forward = path.replace(/\\/g, "/");
  const withLead = forward.startsWith("/") ? forward : `/${forward}`;
  return `vscode://file${encodeURI(withLead)}`;
}

/**
 * Folder a lab works in. Lab 1 explores HTTP in its own lab01 folder; from
 * Lab 2 on, every lab grows the same full-stack app, ShelfShare.
 */
export function labFolderName(moduleNumber: number): string {
  return moduleNumber === 1 ? "lab01" : "ShelfShare";
}

/** The saved course folder, kept in sync across components and browser tabs. */
export function useCourseFolder(): string | null {
  const [folder, setFolder] = useState<string | null>(() => readCourseFolder());
  useEffect(() => {
    const sync = () => setFolder(readCourseFolder());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return folder;
}
