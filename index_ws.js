const WebSocket = require("ws");
const fs = require("fs");
const fetch = require("node-fetch");

(async function () {
  const response = await fetch("http://localhost:9222/json/list").then(
    (res) => {
      return res.json();
    }
  );
  let count = 1;
  const connection = new WebSocket(
    response[0].webSocketDebuggerUrl // https://chromedevtools.github.io/devtools-protocol/
  );

  connection.onopen = () => {
    connection.send(
      JSON.stringify({ id: count++, method: "Page.enable", params: {} })
    );
    connection.send(
      JSON.stringify({
        id: count++,
        method: "Page.startScreencast",
        params: {},
      })
    );

    connection.send(
      JSON.stringify({
        id: count++,
        method: "Page.navigate",
        params: { url: "https://github.com" },
      })
    );
    connection.on("message", async (message) => {
      const obj = JSON.parse(message);

      if (obj.method === "Page.screencastFrame") {
        await fs.writeFile(Date.now() + ".jpeg", obj.params.data, "base64");

        connection.send(
          JSON.stringify({
            id: count++,
            method: "Page.screencastFrameAck",
            params: { sessionId: obj.params.sessionId },
          })
        );
      }
    });
  };

  connection.onerror = (error) => {
    console.log(`WebSocket error: ${JSON.stringify(error)}`);
  };
})();
