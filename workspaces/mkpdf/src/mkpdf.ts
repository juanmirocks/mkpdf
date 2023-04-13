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

export interface PrintMainInput {
  readonly goToUrl: string,
  readonly outputPdfFilepath: string,
  readonly cssFilepathOpt?: string,
  readonly extraPdfOptions?: any
}

//-----------------------------------------------------------------------------

export async function printAsPdf(input: PrintMainInput): Promise<string> {
  const browserPrm = launchPuppeteerBrowser();

  return printAsPdfWithBrowser({ ...input, browserPrm: browserPrm }).finally(async () => {
    closePuppeteerBrowser(browserPrm);
  });
};


export async function printAsPdfWithBrowser(input: PrintMainInput & { browserPrm: Promise<puppeteer.Browser> }): Promise<string> {
  return input.browserPrm.then(async browser => {

    //We reuse the first page, which we assume (but do not test) to always exist
    const pagePrm: Promise<puppeteer.Page> = browser.pages().then(pages => pages[0]);

    return printAsPdfWithBrowserPage({ ...input, pagePrm: pagePrm });
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
 * @param cssFilepathOpt Optional, use this to load an arbitrary CSS file.
 * @param extraPdfOptions Optional, JSON object with extra Puppeteer's `Page.pdf()` [PDFOptions](https://pptr.dev/api/puppeteer.pdfoptions).
 * @returns the eventual path of the saved PDF.
 */
export async function printAsPdfWithBrowserPage(input: PrintMainInput & { pagePrm: Promise<puppeteer.Page> }): Promise<string> {
  const startTimeInMs = performance.now();

  const page = await input.pagePrm;

  const isSameResource = (page.url() === input.goToUrl);
  const waitUntil = (isSameResource) ? "load" : "networkidle0";

  await page.goto(input.goToUrl, {
    // See options: https://pptr.dev/api/puppeteer.page.goto
    // Ref: https://github.com/puppeteer/puppeteer/issues/422#issuecomment-402690359
    waitUntil: waitUntil
  });

  // "Force" CSS style
  if (input.cssFilepathOpt) {
    await page.addStyleTag({ path: input.cssFilepathOpt });
    // Wait for all fonts to be ready
    await page.evaluateHandle("document.fonts.ready");
  }

  // Download the PDF; see all options: https://pptr.dev/api/puppeteer.pdfoptions
  await page.pdf({
    path: input.outputPdfFilepath,
    printBackground: true,
    format: "A4",
    //Prioritize size format if defined in @page CSS rule
    preferCSSPageSize: true,
    //
    ...input.extraPdfOptions
  });

  process.stderr.write(`Finished printing in ${calcElapsedTimeInMilliseconds(startTimeInMs)}ms; file: ${input.outputPdfFilepath}\n`);

  return input.outputPdfFilepath;
};

