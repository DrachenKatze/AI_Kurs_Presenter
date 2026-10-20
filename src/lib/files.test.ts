import { pickFile, PRESET_KEY } from "./files";

// Minimal IndexedDB holding a save folder: every request succeeds on the next tick with `result`.
function fakeDb(saveFolder: object) {
  const request = (result: unknown) => {
    const req: { result: unknown; onsuccess?: () => void } = { result };
    setTimeout(() => req.onsuccess?.());
    return req;
  };
  const db = { transaction: () => ({ objectStore: () => ({ get: () => request(saveFolder) }) }) };
  vi.stubGlobal("indexedDB", { open: () => request(db) });
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

test("Load starts in the save folder's preset subfolder of its kind", async () => {
  const sub = { name: "Table" };
  const folder = {
    name: "Save",
    requestPermission: async () => "granted",
    getDirectoryHandle: vi.fn(async () => sub),
  };
  fakeDb(folder);
  localStorage.setItem(PRESET_KEY, "1");
  const picker = vi.fn(async () => [{ getFile: async () => ({ text: async () => "# md" }) }]);
  vi.stubGlobal("showOpenFilePicker", picker);

  expect(await pickFile(".md,text/markdown", "Table")).toBe("# md");
  expect(folder.getDirectoryHandle).toHaveBeenCalledWith("Table", { create: true });
  expect(picker).toHaveBeenCalledWith({ startIn: sub, types: [{ accept: { "text/markdown": [".md"] } }] });

  picker.mockRejectedValueOnce(new DOMException("", "AbortError"));
  expect(await pickFile(".md,text/markdown", "Table")).toBeNull();
});
