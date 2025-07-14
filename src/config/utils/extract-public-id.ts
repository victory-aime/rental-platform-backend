export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split('/');
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex === -1 || versionIndex === parts.length - 1) return null;

    const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
    const lastDot = publicIdWithExt.lastIndexOf('.');
    return lastDot === -1
      ? decodeURIComponent(publicIdWithExt)
      : decodeURIComponent(publicIdWithExt.slice(0, lastDot));
  } catch (e) {
    return null;
  }
}
