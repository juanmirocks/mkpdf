// Copyright 2023 Dr. Juan Miguel Cejuela
// SPDX-License-Identifier: Apache-2.0

import { Reporter } from "@parcel/plugin";
import parcelTypes from "@parcel/types";
import * as mkpdf from "../workspaces/mkpdf/src/mkpdf";
import * as util from "../workspaces/mkpdf/src/util";

// ----------------------------------------------------------------------------

function getBundleByType(bundles: parcelTypes.PackagedBundle[], type: string): parcelTypes.PackagedBundle | undefined {
  return bundles.find((elem) => elem.type == type);
}

function getBundleFilePathByType(bundles: parcelTypes.PackagedBundle[], type: string): string | undefined {
  return getBundleByType(bundles, type)?.filePath;
}

let PUPPETEER_BROWSER_PROMISE = mkpdf.launchPuppeteerBrowser();

async function closeResources(logger: parcelTypes.PluginLogger): Promise<void> {
  return mkpdf.closePuppeteerBrowser(PUPPETEER_BROWSER_PROMISE).then(() => {
    logger.verbose({ message: "Liberating resources: DONE" });
  });
}

// ----------------------------------------------------------------------------

export default new Reporter({
  async report(opts) {
    if (opts.event.type === "buildSuccess") {
      const bundles: parcelTypes.PackagedBundle[] = opts.event.bundleGraph.getBundles();
      const htmlInput = getBundleFilePathByType(bundles, "html");

      if (htmlInput) {
        const htmlInputUrl = util.addUrlFileScheme(htmlInput);
        const outputPdfFilepath = util.changeExtension(htmlInput, ".pdf");

        opts.logger.info({ message: `\nBuilt HTML: ${htmlInput}\nPrinting PDF: ${outputPdfFilepath} ... \n` });

        //The browser might get disconnected if the computer sleeps
        if (!(await PUPPETEER_BROWSER_PROMISE).isConnected()) {
          await closeResources(opts.logger);

          opts.logger.verbose({ message: "Relaunching puppeteer resources" });
          PUPPETEER_BROWSER_PROMISE = mkpdf.launchPuppeteerBrowser();
        }

        await mkpdf.printAsPdfWithBrowser({
          browserPrm: PUPPETEER_BROWSER_PROMISE,
          goToUrl: htmlInputUrl,
          outputPdfFilepath: outputPdfFilepath,
        });
      }
      else {
        opts.logger.error({ message: "❌ No built HTML" });
      }
    }

    const isBuildingEnded =
      //In serve/watch mode, a `watchEnd` event is emitted at the end: https://parceljs.org/plugin-system/reporter/#watcher-events
      (opts.event.type === "watchEnd") ||
      //In build mode there is no final event, so we check for the following options to know if the building finished completely
      ((opts.event.type === "buildSuccess" || opts.event.type === "buildFailure") &&
        ((opts.options.serveOptions === false) || (opts.options.mode === "production")));

    if (isBuildingEnded) {
      opts.logger.verbose({ message: "Parcel building ended. Liberating resources... " });
      await closeResources(opts.logger);
    }
  },
});
