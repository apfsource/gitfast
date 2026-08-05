export async function fetchFileMetadata(rawUrl: string): Promise<{ size: number; sha384: string } | null> {
  try {
    // raw.githubusercontent.com has CORS enabled (Access-Control-Allow-Origin: *)
    const res = await fetch(rawUrl);
    if (!res.ok) return null;
    
    const blob = await res.blob();
    const size = blob.size;
    
    // Calculate SHA-384 for Subresource Integrity (SRI)
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-384', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Fast base64 encode for byte arrays
    const base64Hash = btoa(hashArray.map(b => String.fromCharCode(b)).join(''));
    
    return { size, sha384: `sha384-${base64Hash}` };
  } catch (error) {
    console.error('Failed to fetch file metadata:', error);
    return null;
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
