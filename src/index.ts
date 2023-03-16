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
  (await PUPPETEER_BROWSER_PAGE_PROMISE).close();
  await mkpdf.closePuppeteerBrowser(PUPPETEER_BROWSER_PROMISE);
  logger.verbose({ message: "DONE" });
}

module.exports = new Reporter({
  async report({ event, logger }: { event: parcelTypes.ReporterEvent, logger: parcelTypes.PluginLogger }) {
    if (event.type === "buildSuccess") {
      const bundles: parcelTypes.PackagedBundle[] = event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");
      const cssInputOpt = getBundleFilePathByType(bundles, "css");

      logger.info({ message: `Built:\n* HTML: ${htmlInput}\n* CSS?: ${cssInputOpt}\n` });

      if (htmlInput) {
        await mkpdf.printAsPdfWithBrowserPage(PUPPETEER_BROWSER_PAGE_PROMISE, htmlInput, cssInputOpt);
      }
      else {
        logger.error({ message: "❌ No built html" });
      }
    }

    else if (event.type === "watchEnd") {
      await closeResources(logger);
    }
  }
});