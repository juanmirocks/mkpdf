import puppeteer from "puppeteer";

describe("A just-launched browser", () => {
  const browserPrm = puppeteer.launch();

  afterAll(async () => {
    (await browserPrm).close();
  });

  test("already has a page (with url = `about:blank`)", async () => {
    const pages = await (await browserPrm).pages();
    expect(pages.length).toEqual(1);
    expect(pages[0].url()).toEqual("about:blank");
  });
});
