import * as mkpdf from "../src/mkpdf";
import * as tutil from "./tutil";
import fs from "fs";

test("Print a website, creates a non-empty PDF file", async () => {
  const testPdfFilepath = tutil.getTmpFilepath({ suffix: ".pdf" });

  try {
    const returnedTestPdfFilepath = await mkpdf.printAsPdf({
      goToUrl: "http://example.com",
      outputPdfFilepath: testPdfFilepath,
    });
    expect(returnedTestPdfFilepath).toEqual(testPdfFilepath);
    const fileStats = fs.statSync(testPdfFilepath);
    expect(fileStats.size).toBeGreaterThan(0);
    afterAll;
  } finally {
    fs.unlinkSync(testPdfFilepath);
  }
});
