# Experimental

## Hard coded example

The hard coded example modifies the cells.ts auraescript example to consume from a shared Deno.KV store for events.
The events are triggered by visiting the Deno webserver paths:

- /allocate
- /start
- /stop
- /free
- /list

Launch the two scripts.

    deno run --allow-net --unstable --allow-read --allow-write deno/webserver.ts

    auraescript auraescript/cells.ts

Access the paths at <http://localhost:8080> .. watch the console logs for updates.
