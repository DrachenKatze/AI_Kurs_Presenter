export function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

// The default save folder (Settings) is a FileSystemDirectoryHandle. Only IndexedDB can store it.
// The File System Access API exists only in Chromium browsers; elsewhere saves fall back to a download.
type Folder = FileSystemDirectoryHandle & {
  requestPermission(o: { mode: "readwrite" }): Promise<PermissionState>;
};

function settingsDb<T>(mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("presenter", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("settings");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const req = op(open.result.transaction("settings", mode).objectStore("settings"));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}

export const canPickFolder = () => typeof window !== "undefined" && "showDirectoryPicker" in window;

export const getSaveFolder = () =>
  settingsDb<Folder | undefined>("readonly", (s) => s.get("saveFolder")).catch(() => undefined);

/** Opens the folder picker and stores the choice; resolves with the folder name, or null if cancelled. */
export async function chooseSaveFolder(): Promise<string | null> {
  try {
    const dir = await (window as unknown as { showDirectoryPicker(o: object): Promise<Folder> }).showDirectoryPicker({
      mode: "readwrite",
    });
    await settingsDb("readwrite", (s) => s.put(dir, "saveFolder"));
    return dir.name;
  } catch {
    return null;
  }
}

export const clearSaveFolder = () => settingsDb("readwrite", (s) => s.delete("saveFolder"));

// "Use preset folders" (Settings): each kind of file goes to its own subfolder of the save folder.
export const KINDS = ["Project", "Table", "Templates"] as const;
export type Kind = (typeof KINDS)[number];
export const PRESET_KEY = "presenter:presetFolders";
export const usesPresetFolders = () => {
  try {
    return localStorage.getItem(PRESET_KEY) === "1";
  } catch {
    return false;
  }
};

/** The folder files of this kind are written to (created if missing), or null when they are downloaded instead. */
async function targetFolder(kind: Kind): Promise<FileSystemDirectoryHandle | null> {
  const dir = await getSaveFolder();
  if (!dir || (await dir.requestPermission({ mode: "readwrite" })) !== "granted") return null;
  return usesPresetFolders() ? dir.getDirectoryHandle(kind, { create: true }) : dir;
}

export const createPresetFolders = () => Promise.all(KINDS.map(targetFolder));

/** Whether saving `name` would overwrite a file; always false when files are downloaded. */
export async function fileExists(name: string, kind: Kind) {
  const dir = await targetFolder(kind);
  return dir ? dir.getFileHandle(name).then(() => true, () => false) : false;
}

/** Writes into the save folder (or its preset subfolder) if one is set and allowed, otherwise downloads. */
export async function saveFile(name: string, content: string, type: string, kind: Kind) {
  const dir = await targetFolder(kind);
  if (dir) {
    // An existing file with the same name is overwritten; callers that care ask first (fileExists).
    const w = await (await dir.getFileHandle(name, { create: true })).createWritable();
    await w.write(content);
    await w.close();
    return `Saved to ${dir.name}/${name}`;
  }
  downloadFile(name, content, type);
  return "Saved";
}

type OpenPicker = (o: object) => Promise<FileSystemFileHandle[]>;

/**
 * Opens the file dialog and resolves with the chosen file's text, or null if cancelled.
 * With a save folder set, the dialog starts there (in the kind's preset subfolder if those are on);
 * that needs showOpenFilePicker (Chromium), other browsers get the plain dialog.
 */
export async function pickFile(accept: string, kind?: Kind): Promise<string | null> {
  const picker = typeof window !== "undefined" && (window as unknown as { showOpenFilePicker?: OpenPicker }).showOpenFilePicker;
  const startIn = kind && picker ? await targetFolder(kind).catch(() => null) : null;
  if (picker && startIn) {
    const parts = accept.split(",");
    const mime = parts.find((p) => p.includes("/")) ?? "text/plain";
    try {
      const [handle] = await picker({ startIn, types: [{ accept: { [mime]: parts.filter((p) => p.startsWith(".")) } }] });
      return (await handle.getFile()).text();
    } catch {
      return null; // cancelled
    }
  }
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement("input"), { type: "file", accept });
    input.onchange = async () => resolve((await input.files?.[0]?.text()) ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** Opens the file dialog for an image; resolves with a data URL and the file size, or null if cancelled. */
export function pickImage(): Promise<{ src: string; size: number } | null> {
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement("input"), {
      type: "file",
      accept: "image/png,image/jpeg,image/svg+xml",
    });
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({ src: String(reader.result), size: file.size });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
