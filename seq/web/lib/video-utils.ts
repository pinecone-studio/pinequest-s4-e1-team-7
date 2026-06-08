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

/** Canvas дээр video-г aspect ratio хадгалж cover горимд зурна */
export function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  displayW: number,
  displayH: number,
  mirror: boolean
): void {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw <= 0 || vh <= 0 || displayW <= 0 || displayH <= 0) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, displayW, displayH);

  const scale = Math.max(displayW / vw, displayH / vh);
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
