import * as aurae from "../../../aurae/auraescript/gen/aurae.ts";
import * as cells from "../../../aurae/auraescript/gen/cells.ts";

const client = await aurae.createClient();
const cellService = new cells.CellServiceClient(client);
const cellName = "ae-sleeper-cell";

const kv = await Deno.openKv("/tmp/aurae_deno_kv");

while (true) {
  const res = await kv.get<string>(["action"]);
  console.log(res);
  await kv.delete(["action"]);

  switch (res.value) {
    case "allocate": {
      console.log("allocate");
      const allocate = await cellService.allocate(<
        cells.CellServiceAllocateRequest
      >{
        cell: cells.Cell.fromPartial({
          name: cellName,
          cpu: cells.CpuController.fromPartial({
            weight: 2, // Percentage of CPUs
            max: 400 * 10 ** 3, // 0.4 seconds in microseconds
          }),
        }),
      });
      console.log("Allocated:", allocate);
      break;
    }
    case "start": {
      console.log("start");
      const started = await cellService.start(<cells.CellServiceStartRequest>{
        cellName,
        executable: cells.Executable.fromPartial({
          command: "/usr/bin/sleep 42",
          description: "Sleep for 42 seconds",
          name: "sleep-42",
        }),
      });
      console.log("Started:", started);
      break;
    }
    case "stop": {
      // [ Stop ]
      const stopped = await cellService.stop(<cells.CellServiceStopRequest>{
        cellName,
        executableName: "sleep-42",
      });
      console.log("Stopped:", stopped);
      break;
    }
    case "free": {
      const freed = await cellService.free(<cells.CellServiceFreeRequest>{
        cellName,
      });
      console.log("Freed:", freed);
    }
  }

  console.log("sleeping main loop for 2 seconds ...");
  const lst = await cellService.list(<cells.CellServiceListRequest>{});
  await kv.set([cellName], JSON.stringify(lst));
  console.log(lst);

  await new Promise((r) => setTimeout(r, 2000));
}
