import { Reporter } from "@parcel/plugin";
import parcelTypes from "@parcel/types";
import * as mkpdf from "./mkpdf";

function getBundleByType(bundles: parcelTypes.PackagedBundle[], type: string): parcelTypes.PackagedBundle | undefined {
  return bundles.find(elem => elem.type == type);
}

function getBundleFilePathByType(bundles: parcelTypes.PackagedBundle[], type: string): string | undefined {
  return getBundleByType(bundles, type)?.filePath;
}

const PUPPETEER_BROWSER_PROMISE = (async () => {
  return await mkpdf.launchPuppeteerBrowser();
})();

const PUPPETEER_BROWSER_PAGE_PROMISE = (async () => {
  return await PUPPETEER_BROWSER_PROMISE.then(browser => browser.newPage());
})();

async function closeResources(logger: parcelTypes.PluginLogger) {
  logger.verbose({ message: "Parcel watching ended. Liberating resources... " });
  // (await PUPPETEER_BROWSER_PAGE_PROMISE).close(); it suffices closing the browser
  await mkpdf.closePuppeteerBrowser(PUPPETEER_BROWSER_PROMISE);
  logger.verbose({ message: "DONE" });
}

module.exports = new Reporter({
  async report(opts) {
    if (opts.event.type === "buildSuccess") {
      const bundles: parcelTypes.PackagedBundle[] = opts.event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");
      const cssInputOpt = getBundleFilePathByType(bundles, "css");

      opts.logger.info({ message: `Built:\n* HTML: ${htmlInput}\n* CSS?: ${cssInputOpt}\n` });

      if (htmlInput) {
        await mkpdf.printAsPdfWithBrowserPage(PUPPETEER_BROWSER_PAGE_PROMISE, htmlInput, cssInputOpt);
      }
      else {
        opts.logger.error({ message: "❌ No built html" });
      }
    }

    const isBuildingEnded =
      //In serve/watch mode, a `watchEnd` event is emitted at the end: https://parceljs.org/plugin-system/reporter/#watcher-events
      (opts.event.type === "watchEnd") ||
      //In build mode there is no final event, so we check for the following options to know if the building finished completely
      ((opts.event.type === "buildSuccess" || opts.event.type === "buildFailure") && ((opts.options.serveOptions === false) || (opts.options.mode === "production")))

    if (isBuildingEnded) {
      await closeResources(opts.logger);
    }
  }
});