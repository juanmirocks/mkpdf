// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import { Reporter } from "@parcel/plugin";
import parcelTypes from "@parcel/types";
import * as mkpdf from "../workspaces/mkpdf/src/mkpdf";

// ----------------------------------------------------------------------------

function getBundleByType(bundles: parcelTypes.PackagedBundle[], type: string): parcelTypes.PackagedBundle | undefined {
  return bundles.find(elem => elem.type == type);
}

function getBundleFilePathByType(bundles: parcelTypes.PackagedBundle[], type: string): string | undefined {
  return getBundleByType(bundles, type)?.filePath;
}

let PUPPETEER_BROWSER_PROMISE = mkpdf.launchPuppeteerBrowser();

let PUPPETEER_BROWSER_PAGE_PROMISE = mkpdf.launchPuppeteerPage(PUPPETEER_BROWSER_PROMISE);

async function closeResources(logger: parcelTypes.PluginLogger): Promise<void> {
  // (await PUPPETEER_BROWSER_PAGE_PROMISE).close(); it suffices closing the browser
  return mkpdf.closePuppeteerBrowser(PUPPETEER_BROWSER_PROMISE).then(_ => {
    logger.verbose({ message: "Liberating resources: DONE" });
  });
}

// ----------------------------------------------------------------------------

export default new Reporter({
  async report(opts) {
    if (opts.event.type === "buildSuccess") {
      const bundles: parcelTypes.PackagedBundle[] = opts.event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");

      opts.logger.info({ message: `Built HTML: ${htmlInput}\n` });

      if (htmlInput) {
        //The browser might get disconnected if the computer sleeps
        if (!(await PUPPETEER_BROWSER_PROMISE).isConnected()) {
          await closeResources(opts.logger);

          opts.logger.verbose({ message: `Relaunching puppeteer resources` });
          PUPPETEER_BROWSER_PROMISE = mkpdf.launchPuppeteerBrowser();
          PUPPETEER_BROWSER_PAGE_PROMISE = mkpdf.launchPuppeteerPage(PUPPETEER_BROWSER_PROMISE);
        }

        await mkpdf.printAsPdfWithBrowserPage(PUPPETEER_BROWSER_PAGE_PROMISE, htmlInput);
      }
      else {
        opts.logger.error({ message: "❌ No built HTML" });
      }
    }

    const isBuildingEnded =
      //In serve/watch mode, a `watchEnd` event is emitted at the end: https://parceljs.org/plugin-system/reporter/#watcher-events
      (opts.event.type === "watchEnd") ||
      //In build mode there is no final event, so we check for the following options to know if the building finished completely
      ((opts.event.type === "buildSuccess" || opts.event.type === "buildFailure") && ((opts.options.serveOptions === false) || (opts.options.mode === "production")));

    if (isBuildingEnded) {
      opts.logger.verbose({ message: "Parcel building ended. Liberating resources... " });
      await closeResources(opts.logger);
    }
  }
});