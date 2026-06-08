const releasers = new Set<() => void>();

export function registerCameraReleaser(fn: () => void): () => void {
  releasers.add(fn);
  return () => releasers.delete(fn);
}

export function releaseAllCameras(): void {
  releasers.forEach((fn) => fn());
}
