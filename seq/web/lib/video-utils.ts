/** MediaStream бүрэн унтраах (камер/mic LED гасна). */
export function releaseMediaStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((t) => t.stop());
}

/** Video element-ээс stream салгах. */
export function detachMediaStream(video: HTMLVideoElement | null | undefined): void {
  if (video) video.srcObject = null;
}

/** WebRTC video-д stream холбох — play() AbortError-ийг зайлсхийх */
export function attachMediaStream(
  video: HTMLVideoElement,
  stream: MediaStream | null
): void {
  if (stream && video.srcObject === stream) return;
  video.srcObject = stream;
  if (!stream) return;
  const p = video.play();
  if (p) {
    void p.catch((err: Error) => {
      if (err.name !== "AbortError") console.warn("[video] play:", err.message);
    });
  }
}

type VideoFit = "cover" | "contain";

/** Canvas дээр video-г aspect ratio хадгалж зурна (cover = crop, contain = бүтэн кадр). */
export function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  displayW: number,
  displayH: number,
  mirror: boolean,
  fit: VideoFit = "cover"
): void {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw <= 0 || vh <= 0 || displayW <= 0 || displayH <= 0) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, displayW, displayH);

  const scale =
    fit === "cover"
      ? Math.max(displayW / vw, displayH / vh)
      : Math.min(displayW / vw, displayH / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const ox = (displayW - dw) / 2;
  const oy = (displayH - dh) / 2;

  ctx.save();
  if (mirror) {
    ctx.translate(displayW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, vw, vh, ox, oy, dw, dh);
  ctx.restore();
}
