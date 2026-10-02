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
