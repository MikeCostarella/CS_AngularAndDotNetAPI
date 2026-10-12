import { useId, useState, type FormEvent } from "react";
import {
  COURSE_FOLDER_NAME,
  normalizeFolder,
  saveCourseFolder,
  useCourseFolder,
} from "../lib/courseFolder";
import CopyCode from "./CopyCode";

// "Your course folder" panel at the top of each scripted lab. Once a path is
// saved, the VS Code labels in the steps become links that open the lab folder.
//
// Why there is no Browse button: a web page is never told the full path of a
// folder you pick (browsers hide it on purpose), and the VS Code links need the
// full path. So PowerShell copies the path to the clipboard, and one click
// pastes it here.

const COPY_COMMAND = `(Resolve-Path $HOME\\${COURSE_FOLDER_NAME}).Path | Set-Clipboard`;

export default function CourseFolderBox({ isLab1 }: { isLab1: boolean }) {
  const saved = useCourseFolder();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errId = useId();
  const example = `C:\\Users\\you\\${COURSE_FOLDER_NAME}`;

  const startEdit = () => {
    setValue(saved ?? "");
    setError(null);
    setEditing(true);
  };

  /** Validates and saves a path; returns true when it was saved. */
  const commit = (raw: string): boolean => {
    const clean = normalizeFolder(raw);
    if (!clean) {
      setError(`That doesn't look like a full path. It should start with a drive letter, like ${example}.`);
      return false;
    }
    if (!saveCourseFolder(clean)) {
      setError("This browser is blocking saved site data (a private window, perhaps), so the path can't be remembered here.");
      return false;
    }
    setEditing(false);
    setError(null);
    return true;
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    commit(value);
  };

  const onPaste = async () => {
    let text = "";
    try {
      text = await navigator.clipboard.readText();
    } catch {
      setError("This browser didn't let the page read the clipboard. Click in the box, press Ctrl+V, then Save.");
      return;
    }
    setValue(text.trim());
    if (!text.trim()) {
      setError("The clipboard is empty. Run the PowerShell command below first, then try again.");
      return;
    }
    commit(text);
  };

  if (saved && !editing) {
    return (
      <div className="course-folder is-set" id="course-folder">
        <span className="cf-label">Your course folder</span>
        <code className="cf-path">{saved}</code>
        <span className="cf-actions">
          <button type="button" className="cf-link" onClick={startEdit}>Change</button>
          <button type="button" className="cf-link" onClick={() => saveCourseFolder(null)}>Forget</button>
        </span>
        <p className="cf-hint">
          <b>VS Code</b> labels in the steps below open this lab's folder. In VS Code, press{" "}
          <kbd>Ctrl</kbd>+<kbd>`</kbd> to get PowerShell already in that folder.
        </p>
      </div>
    );
  }

  return (
    <form className="course-folder" id="course-folder" onSubmit={onSave}>
      <label className="cf-label" htmlFor={inputId}>Your course folder</label>
      <p className="cf-hint">
        {isLab1
          ? "Step 1 of the first task below creates your course folder and copies its full path to the clipboard. Then click Paste from clipboard, and the VS Code labels in every lab become links that open the right folder."
          : "Copy your course folder's path with the PowerShell command below, then click Paste from clipboard. The VS Code labels in this lab become links that open its folder."}
      </p>
      <div className="cf-row">
        <button type="button" className="cf-save" onClick={onPaste}>Paste from clipboard</button>
        <input
          id={inputId}
          type="text"
          spellCheck={false}
          autoComplete="off"
          placeholder={example}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Course folder path"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
        />
        <button type="submit" className="cf-link">Save</button>
        {saved && (
          <button type="button" className="cf-link" onClick={() => setEditing(false)}>Cancel</button>
        )}
      </div>
      {error && <p className="cf-error" id={errId} role="alert">{error}</p>}
      <p className="cf-hint">To copy the path again at any time, run this in PowerShell:</p>
      <CopyCode text={COPY_COMMAND} />
      <p className="cf-note">
        Remembered in this browser only — it never leaves your computer. (There is no Browse button
        because browsers never tell a web page the full path of a folder you pick.)
      </p>
    </form>
  );
}
