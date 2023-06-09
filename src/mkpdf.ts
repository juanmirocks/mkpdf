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
export async function launchPuppeteerBrowser(extraLaunchOptions: puppeteer.PuppeteerLaunchOptions = {}): Promise<puppeteer.Browser> {
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
  /** resource's URL to print, e.g. a website or an HTML file prefixed with the `file://` URL scheme */
  readonly goToUrl: string
  /** file path to print/save the PDF to */
  readonly outputPdfFilepath: string
  /** Optional, use this to load an arbitrary CSS file. */
  readonly cssFilepathOpt?: string
  /** Optional, JSON object with extra Puppeteer's `Page.pdf()` [PDFOptions](https://pptr.dev/api/puppeteer.pdfoptions). */
  readonly extraPdfOptions?: puppeteer.PDFOptions

  /**
   * Decide the parameter `waitUntil` for Puppeteer's [Page.goto()](https://pptr.dev/api/puppeteer.page.goto).
   *
   * HINT: If your PDF doesn't load all external resources correctly, you might set this function to always return `networkidle0`.
   * See issue: https://github.com/puppeteer/puppeteer/issues/422#issuecomment-402690359
   *
   * @param isSameUrl true if the requested URL is already loaded in the underlying browser page; false otherwise.
   * @returns `waitUntil` valid string event for Puppeteer.
   */
  readonly waitUntil?: (isSameUrl: boolean) => puppeteer.PuppeteerLifeCycleEvent | puppeteer.PuppeteerLifeCycleEvent[];
}

function default_waitUntil(isSameUrl: boolean): puppeteer.PuppeteerLifeCycleEvent | puppeteer.PuppeteerLifeCycleEvent[] {
  return (isSameUrl) ? "networkidle2" : "networkidle0";
}

//-----------------------------------------------------------------------------

export async function printAsPdf(input: PrintMainInput): Promise<string> {
  const browserPrm = launchPuppeteerBrowser();

  return printAsPdfWithBrowser({ ...input, browserPrm: browserPrm }).finally(async () => {
    closePuppeteerBrowser(browserPrm);
  });
}


export async function printAsPdfWithBrowser(
  input: PrintMainInput & {
    /** puppeteer's already launched browser to benefit from its cache.
     * We ASSUME, but DO NOT TEST, the browser has already an opened page, which is reused.
     */
    browserPrm: Promise<puppeteer.Browser>
  }): Promise<string> {
  return input.browserPrm.then(async browser => {

    //We reuse the first page
    const pagePrm: Promise<puppeteer.Page> = browser.pages().then(pages => pages[0]);

    return printAsPdfWithBrowserPage({ ...input, pagePrm: pagePrm });
  });
}


/**
 * Generate PDF given an HTML file or website URL.
 *
 * Use this method to reuse an already created browser page to benefit from its cache.
 * This is useful when you are iteratively printing your HTML (as in watch mode) and your HTML fetches some external resources.
 * In that case, the page implicitly caches those resources. Thus, the PDF generation is faster.
 *
 * @returns the eventual path of the saved PDF.
 */
export async function printAsPdfWithBrowserPage(
  input: PrintMainInput & {
    /** puppeteer's already created page to benefit from its cache. */
    pagePrm: Promise<puppeteer.Page>
  }): Promise<string> {
  const startTimeInMs = performance.now();

  const page = await input.pagePrm;

  const isSameUrl = (page.url() === input.goToUrl);
  const waitUntil = (input.waitUntil || default_waitUntil)(isSameUrl);

  if (isSameUrl) {
    await page.reload({
      waitUntil: waitUntil
    });
  }
  else {
    await page.goto(input.goToUrl, {
      waitUntil: waitUntil
    });
  }

  if (input.cssFilepathOpt) {
    // "Force" CSS style
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
}
