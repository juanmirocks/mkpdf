// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import * as mkpdf from "./mkpdf";
import * as util from "./util";

// ----------------------------------------------------------------------------

function hasProtocol(x: string): URL | undefined {
  try {
    return new URL(x);
  } catch (e) {
    //ignore
  }
}

// ----------------------------------------------------------------------------

// Early-version simple CLI
//
// Allows printing as PDF either input HTML file or website URL

if (process.argv.length === 2) {
  process.stderr.write("Input arguments must be: URL_OR_FILEPATH [OUTPUT_PDF_FILEPATH]");
  process.exit(1);
}

const inputUrlOrFilepath = process.argv[2];
let goToUrl = inputUrlOrFilepath;
let outputPdfFilepath: string = process.argv[3];

if (hasProtocol(inputUrlOrFilepath)) {
  outputPdfFilepath = outputPdfFilepath || "output.pdf";
}
else {
  goToUrl = util.addUrlFileScheme(inputUrlOrFilepath);
  outputPdfFilepath = outputPdfFilepath || util.changeExtension(inputUrlOrFilepath, ".pdf");
}

const browserPrm = mkpdf.launchPuppeteerBrowser({ headless: true });

mkpdf.printAsPdfWithBrowser({
  browserPrm: browserPrm,
  goToUrl: goToUrl,
  outputPdfFilepath: outputPdfFilepath,
})
  .finally(() => mkpdf.closePuppeteerBrowser(browserPrm));
