export function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

/** Opens the file dialog and resolves with the chosen file's text, or null if cancelled. */
export function pickFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement("input"), { type: "file", accept });
    input.onchange = async () => resolve((await input.files?.[0]?.text()) ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}
