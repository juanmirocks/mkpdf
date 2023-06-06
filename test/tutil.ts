import crypto from "crypto";
import os from "os";
import path from "path";

export function getTmpFilepath(arg: {prefix?: string, suffix?: string}): string {
  return `${os.tmpdir()}${path.sep}${arg.prefix ?? "mkpdf-"}${crypto.randomUUID()}${arg.suffix ?? ""}`;
}