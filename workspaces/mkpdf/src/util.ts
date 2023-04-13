// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0


/**
 * Change `filePath`'s extension.
 *
 * IMPORTANT: it's assumed (but not tested) that `filePath` indeed has a file extension.
 *
 * @param filePath simple, relative, or full path
 * @param extensionWithDot extension to replace with; it must include the dot, for example '.html'
 */
export function changeExtension(filePath: string, extensionWithDot: string): string {
  return filePath.substring(0, filePath.lastIndexOf(".")) + extensionWithDot;
}


/**
 * WARNING: using this function makes your code depend on Node.js.
 *
 * For Deno, see: https://stackoverflow.com/a/76004806/341320
 *
 * @returns path to current working directory.
 */
function cwd(): string {
  return process.cwd();
}


/**
 * Add `file://` URL scheme to the given `filepath`.
 *
 * @param filepath either an absolute or relative path.
 *  ASSUMPTION (BUT NOT TESTED): `filepath` does not already include any URL scheme.
 *
 * @returns file path prefixed with `file://` URL scheme.
 */
export function addUrlFileScheme(filepath: string): string {
  if (filepath.startsWith("/")) {
    return `file://${filepath}`;
  }
  else {
    return `file://${cwd()}/${filepath}`;
  }
}