const kv = await Deno.openKv("/tmp/aurae_deno_kv");
const server = Deno.listen({ port: 8080 });

const allocate = async () => {
  await kv.set(["action"], "allocate");
};

const start = async () => {
  await kv.set(["action"], "start");
};

const stop = async () => {
  await kv.set(["action"], "stop");
};

const free = async () => {
  await kv.set(["action"], "free");
};

const cellName = "ae-sleeper-cell";

for await (const conn of server) {
  (async () => {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      const url = new URL(requestEvent.request.url);
      console.log(requestEvent.request.method, url.pathname);

      switch (url.pathname) {
        case "/allocate":
          allocate();
          requestEvent.respondWith(new Response("allocate dispatched"));
          break;
        case "/start":
          await start();
          requestEvent.respondWith(new Response("start dispatched"));
          break;
        case "/stop":
          await stop();
          requestEvent.respondWith(new Response("stop dispatched"));
          break;
        case "/free":
          await free();
          requestEvent.respondWith(new Response("free dispatched"));
          break;
        case "/list": {
          const lst = await kv.get([cellName]);
          requestEvent.respondWith(new Response(`${lst.value}`));
          break;
        }
        default:
          requestEvent.respondWith(
            new Response(null, { status: 404, statusText: "Not Found" })
          );
      }
    }
  })();
}
