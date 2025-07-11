export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split('/');
    const fileWithExt = parts.at(-1); // e.g. toyota-123abc.jpg
    const folderParts = parts.slice(parts.indexOf('upload') + 1, -1); // everything after /upload/ except filename
    const fileName = fileWithExt?.split('.')[0]; // remove .jpg
    const publicId = [...folderParts, fileName].join('/');
    return publicId || null;
  } catch {
    return null;
  }
}
