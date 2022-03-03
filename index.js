const CDP = require("chrome-remote-interface");
const fs = require("fs");

async function example() {
  let client;
  try {
    // connect to endpoint
    client = await CDP();
    // extract domains
    const { Network, Page } = client;
    // setup handlers
    Network.requestWillBeSent((params) => {
      console.log(params.request.url);
    });
    // enable events then start!
    await Network.enable();
    await Page.enable();

    client.on("Page.screencastFrame", async (frame) => {
      await fs.writeFile(Date.now() + ".jpeg", frame.data, "base64");
      client.Page.screencastFrameAck({ sessionId: frame.sessionId });
    });

    // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-startScreencast
    client.Page.startScreencast();
    await Page.startScreencast();

    await Page.navigate({ url: "https://github.com" });
    await Page.loadEventFired();
  } catch (err) {
    console.error(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

example();
