import * as tutil from "./tutil";

test("getTmpFilepath simple case", () => {
  const testFile = tutil.getTmpFilepath({ suffix: ".pdf" });
  expect(testFile.endsWith(".pdf")).toBe(true);
});
