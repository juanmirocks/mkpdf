"use strict";

const puppeteer = require('puppeteer');
const fs = require('fs');

// ----------------------------------------------------------------------------

// Change `filePath`'s extension.
//
// IMPORTANT: it's assumed (but not tested) that `filePath` indeed has a file extension.
//
// `extensionWithDot` must include the dot, for example '.html'
function changeExtension(filePath, extensionWithDot) {
  return filePath.substr(0, filePath.lastIndexOf(".")) + extensionWithDot;
}

// Create a browser instance
async function launchPuppeteerBrowser() {
  return puppeteer.launch({
    headless: true
  });
}

// Close the browser instance
async function closePuppeteerBrowser(puppeteerBrowser) {
  return puppeteerBrowser.close();
}

// Code improved from:
// * https://www.bannerbear.com/blog/how-to-convert-html-into-pdf-with-node-js-and-puppeteer/
// * https://medium.com/@fmoessle/use-html-and-puppeteer-to-create-pdfs-in-node-js-566dbaf9d9ca
async function saveAsPdf(puppeteerBrowser, inputHtmlFilepath, inputCssFilepathOpt) {
  // console.group(JSON.stringify(puppeteerBrowser, null, 4) + " " + typeof(puppeteerBrowser));

  const outputPdfFilepath = changeExtension(inputHtmlFilepath, ".pdf");
  process.stderr.write(`Printing ${outputPdfFilepath} ... `);

  // Create a new page
  const page = await puppeteerBrowser.newPage();

  // Get HTML content from HTML file
  const html = fs.readFileSync(inputHtmlFilepath, 'utf-8');
  await page.setContent(html, {
    // See options: https://pptr.dev/api/puppeteer.page.setcontent
    // Ref: https://github.com/puppeteer/puppeteer/issues/422#issuecomment-402690359
    waitUntil: 'networkidle0'
  });

  // "Force" css style (without this, my css doesn't get applied)
  if (inputCssFilepathOpt) {
    await page.addStyleTag({ path: inputCssFilepathOpt });
    // Wait for all fonts to be ready
    await page.evaluateHandle('document.fonts.ready');
  }

  // Download the PDF; see all options: https://pptr.dev/api/puppeteer.pdfoptions
  await page.pdf({
    path: `${outputPdfFilepath}`,
    // margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    printBackground: true,
    format: 'A4',
  });

  await page.close();

  process.stderr.write(`DONE\n`);
};

// ----------------------------------------------------------------------------

module.exports = {
  saveAsPdf,
  launchPuppeteerBrowser,
  closePuppeteerBrowser
}

// ----------------------------------------------------------------------------

if (require.main === module) {
  if (process.argv.length === 2) {
    process.stderr.write('Input arguments must be: inputHtmlFilepath [inputCssFilepath]');
    process.exit(1);
  }

  const inputHtmlFilepath = process.argv[2];
  const inputCssFilepathOpt = process.argv[3];

  (async () => {
    const puppeteerBrowser = await launchPuppeteerBrowser();

    await saveAsPdf(puppeteerBrowser, inputHtmlFilepath, inputCssFilepathOpt);

    await closePuppeteerBrowser(puppeteerBrowser);
  })();
}
