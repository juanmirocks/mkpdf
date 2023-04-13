// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import * as mkpdf from "./mkpdf";

// ----------------------------------------------------------------------------

// Early simple version

if (process.argv.length === 2) {
  process.stderr.write('Input arguments must be: inputHtmlFilepath [inputCssFilepath]');
  process.exit(1);
}

const inputHtmlFilepath = process.argv[2];
const inputCssFilepathOpt = process.argv[3];

const browserPrm = mkpdf.launchPuppeteerBrowser({ headless: true });
const pagePrm = mkpdf.launchPuppeteerPage(browserPrm);

mkpdf.printAsPdfWithBrowserPage(pagePrm, inputHtmlFilepath, inputCssFilepathOpt)
  .finally(() => mkpdf.closePuppeteerBrowser(browserPrm));
