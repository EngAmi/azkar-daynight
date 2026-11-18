interface AudioAssetPointer {
  url: string;
}

const audioPointers = import.meta.glob<AudioAssetPointer>(
  "@/assets/audio/adhkar-*.mp3.asset.json",
  { eager: true, import: "default" },
);

const audioUrlByFilename = new Map(
  Object.entries(audioPointers).map(([path, pointer]) => {
    const filename = path
      .slice(path.lastIndexOf("/") + 1)
      .replace(/^adhkar-/, "")
      .replace(/\.asset\.json$/, "");
    return [filename, pointer.url] as const;
  }),
);

export function getAdhkarAudioUrl(filename: string): string | undefined {
  return audioUrlByFilename.get(filename);
}