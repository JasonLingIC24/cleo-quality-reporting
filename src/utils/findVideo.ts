import fs from "fs";
import path from "path";

export function findVideo(specFile: string): string | undefined {
  if (!specFile) {
    return undefined;
  }
  const VIDEO_DIRECTORY = "./artifacts";

  const specFilename = path.basename(specFile);

  const expectedVideo = path.join(VIDEO_DIRECTORY, `${specFilename}.mp4`);

  if (fs.existsSync(expectedVideo)) {
    return expectedVideo;
  }

  return undefined;
}
