// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import puppeteer from "puppeteer";

// ----------------------------------------------------------------------------

function calcElapsedTimeInMilliseconds(startTimeInMs: number): number {
  return Math.round(((performance.now() - startTimeInMs) + Number.EPSILON));
}

// ----------------------------------------------------------------------------

/**
 * Create a browser instance.
 *
 * @param extraLaunchOptions Optional, JSON object with extra [PuppeteerLaunchOptions](https://pptr.dev/api/puppeteer.puppeteerlaunchoptions).
 */
export async function launchPuppeteerBrowser(extraLaunchOptions: any = {}): Promise<puppeteer.Browser> {
  return puppeteer.launch({
    headless: true,
    ...extraLaunchOptions
  });
}

/**
 * Close the browser instance.
 */
export async function closePuppeteerBrowser(browserPrm: Promise<puppeteer.Browser>): Promise<void> {
  return browserPrm.then(x => x.close());
}

//-----------------------------------------------------------------------------

export async function printAsPdf(inputHtmlFilepath: string, inputCssFilepathOpt?: string): Promise<string> {
  const browserPrm = launchPuppeteerBrowser();

  return printAsPdfWithBrowser(browserPrm, inputHtmlFilepath, inputCssFilepathOpt).finally(async () => {
    closePuppeteerBrowser(browserPrm);
  });
};


export async function printAsPdfWithBrowser(browserPrm: Promise<puppeteer.Browser>, inputHtmlFilepath: string, inputCssFilepathOpt?: string): Promise<string> {
  return browserPrm.then(async browser => {

    //We reuse the first page, which we assume (but do not test) to always exist
    const pagePrm: Promise<puppeteer.Page> = browser.pages().then(pages => pages[0]);

    return printAsPdfWithBrowserPage(pagePrm, inputHtmlFilepath, inputCssFilepathOpt);
  });
};


/**
 * Generate (print) PDF out of an input HTML file.
 *
 * Use this method to reuse an already created browser page to benefit from its cache.
 * This is useful when you are iteratively printing your HTML (as in watch mode) and your HTML fetches some external resources.
 * In that case, the page implicitly caches those resources. Accordingly, the PDF generation is faster.
 *
 * @param pagePrm a puppeteer's already created page to benefit from its cache.
 * @param inputHtmlFilepath HTML file full path.
 * @param inputCssFilepathOpt Optional, use this to load an arbitrary CSS file.
 * @param extraPdfOptions Optional, JSON object with extra Puppeteer's `Page.pdf()` [PDFOptions](https://pptr.dev/api/puppeteer.pdfoptions).
 * @returns the eventual path of the saved PDF.
 */
export async function printAsPdfWithBrowserPage(pagePrm: Promise<puppeteer.Page>, inputHtmlFilepath: string, inputCssFilepathOpt?: string, extraPdfOptions: any = {}): Promise<string> {
  const startTimeInMs = performance.now();

  const outputPdfFilepath = changeExtension(inputHtmlFilepath, ".pdf");
  process.stderr.write(`Printing PDF into: ${outputPdfFilepath} ... \n`);

  const page = await pagePrm;

  const goToUrl = addUrlFileScheme(inputHtmlFilepath);
  const isSameResource = (page.url() === goToUrl);
  const waitUntil = (isSameResource) ? "load" : "networkidle0";

  await page.goto(goToUrl, {
    // See options: https://pptr.dev/api/puppeteer.page.goto
    // Ref: https://github.com/puppeteer/puppeteer/issues/422#issuecomment-402690359
    waitUntil: waitUntil
  });

  // "Force" CSS style
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
    preferCSSPageSize: true,
    //
    ...extraPdfOptions
  });

  process.stderr.write(`Finished printing in ${calcElapsedTimeInMilliseconds(startTimeInMs)}ms; file: ${outputPdfFilepath}\n`);

  return outputPdfFilepath;
};

