// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import puppeteer from "puppeteer";
import fs from "fs";

// ----------------------------------------------------------------------------

/**
 * Change `filePath`'s extension.
 *
 * IMPORTANT: it's assumed (but not tested) that `filePath` indeed has a file extension.
 *
 * @param filePath simple, relative, or full path
 * @param extensionWithDot extension to replace with; it must include the dot, for example '.html'
 */
function changeExtension(filePath: string, extensionWithDot: string): string {
  return filePath.substring(0, filePath.lastIndexOf(".")) + extensionWithDot;
}

function calcElapsedTimeInMilliseconds(startTimeInMs: number): number {
  return Math.round(((performance.now() - startTimeInMs) + Number.EPSILON));
}

/** Create a browser instance */
export async function launchPuppeteerBrowser(): Promise<puppeteer.Browser> {
  return puppeteer.launch({
    headless: true
  });
}

/** Close the browser instance */
export async function closePuppeteerBrowser(browserPromise: Promise<puppeteer.Browser>): Promise<void> {
  return browserPromise.then(x => x.close());
}

export async function printAsPdf(inputHtmlFilepath: string, inputCssFilepathOpt: string | undefined): Promise<string> {
  const browserPromise = launchPuppeteerBrowser();

  return printAsPdfWithBrowser(browserPromise, inputHtmlFilepath, inputCssFilepathOpt).finally(async () => {
    closePuppeteerBrowser(browserPromise);
  });
};

export async function printAsPdfWithBrowser(browserPromise: Promise<puppeteer.Browser>, inputHtmlFilepath: string, inputCssFilepathOpt: string | undefined): Promise<string> {
  return browserPromise.then(async browser => {
    const pagePromise: Promise<puppeteer.Page> = browser.newPage();

    return printAsPdfWithBrowserPage(pagePromise, inputHtmlFilepath, inputCssFilepathOpt).finally(async () => {
      return pagePromise.then(page => page.close())
    });
  });
};

/**
 * Generate (print) PDF out of an input HTML file.
 *
 * Use this method to reuse an already created browser page to benefit from its cache.
 * This is useful when you are iteratively printing your HTML (as in watch mode) and your HTML fetches some external resources.
 * In that case, the page implicitly caches those resources. Accordingly, the PDF generation is faster.
 *
 * @param pagePromise a puppeteer's already created page to benefit from its cache.
 * @param inputHtmlFilepath HTML file full path
 * @param inputCssFilepathOpt Optional, CSS file full path. Use this if, despite the HTML linking your CSS, the style doesn't get properly applied.
 * @returns the eventual path of the saved PDF.
 */
export async function printAsPdfWithBrowserPage(pagePromise: Promise<puppeteer.Page>, inputHtmlFilepath: string, inputCssFilepathOpt: string | undefined): Promise<string> {
  const startTimeInMs = performance.now();

  const outputPdfFilepath = changeExtension(inputHtmlFilepath, ".pdf");
  process.stderr.write(`Printing PDF into: ${outputPdfFilepath} ... \n`);

  const page = await pagePromise;

  // Get HTML content from HTML file and set the browser page's with it
  const html = fs.readFileSync(inputHtmlFilepath, "utf-8");
  await page.setContent(html, {
    // See options: https://pptr.dev/api/puppeteer.page.setcontent
    // Ref: https://github.com/puppeteer/puppeteer/issues/422#issuecomment-402690359
    waitUntil: "networkidle0"
  });

  // "Force" css style (without this, my css didn't get applied)
  if (inputCssFilepathOpt) {
    await page.addStyleTag({ path: inputCssFilepathOpt });
    // Wait for all fonts to be ready
    await page.evaluateHandle("document.fonts.ready");
  }

  // Download the PDF; see all options: https://pptr.dev/api/puppeteer.pdfoptions
  await page.pdf({
    path: outputPdfFilepath,
    printBackground: true,
    format: "A4",
    //Prioritize size format if defined in @page CSS rule
    preferCSSPageSize: true
  });

  process.stderr.write(`Finished printing in ${calcElapsedTimeInMilliseconds(startTimeInMs)}ms; file: ${outputPdfFilepath}\n`);

  return outputPdfFilepath;
};

