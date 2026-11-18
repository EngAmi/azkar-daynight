import { describe, expect, it } from "vitest";
import { getMorningAdhkar, getEveningAdhkar } from "@/data/adhkar";
import { getAdhkarAudioUrl } from "@/lib/adhkarAudioAssets";

describe("recorded adhkar audio assets", () => {
  it("serves every linked recording from the app's asset path", () => {
    const filenames = new Set(
      [...getMorningAdhkar(), ...getEveningAdhkar()]
        .map((dhikr) => dhikr.audio)
        .filter((filename): filename is string => Boolean(filename)),
    );

    expect(filenames.size).toBe(35);
    for (const filename of filenames) {
      expect(getAdhkarAudioUrl(filename)).toMatch(/^\/__l5e\/assets-v1\//);
    }
  });

  it("does not invent an app recording for an unknown file", () => {
    expect(getAdhkarAudioUrl("missing.mp3")).toBeUndefined();
  });
});