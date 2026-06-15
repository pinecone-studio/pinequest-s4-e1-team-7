const AUDIO_SUFFIX = "::audio";

export function encodeCallRoom(roomId: string, audioOnly?: boolean): string {
  return audioOnly ? `${roomId}${AUDIO_SUFFIX}` : roomId;
}

export function parseCallRoom(raw: string | null | undefined): {
  roomId: string;
  audioOnly: boolean;
} {
  const body = raw?.trim() ?? "";
  if (!body) return { roomId: "", audioOnly: false };
  if (body.endsWith(AUDIO_SUFFIX)) {
    return {
      roomId: body.slice(0, -AUDIO_SUFFIX.length),
      audioOnly: true,
    };
  }
  return { roomId: body, audioOnly: false };
}

export function buildCallPath(opts: {
  roomId: string;
  as: "host" | "guest";
  returnTo: string;
  audioOnly?: boolean;
  peer?: string;
}): string {
  const parsed = parseCallRoom(opts.roomId);
  const roomId = parsed.roomId || opts.roomId;
  const audioOnly = opts.audioOnly ?? parsed.audioOnly;
  const params = new URLSearchParams({
    as: opts.as,
    returnTo: opts.returnTo,
  });
  if (audioOnly) params.set("mode", "audio");
  if (opts.peer) params.set("peer", opts.peer);
  return `/call/${encodeURIComponent(roomId)}?${params.toString()}`;
}
