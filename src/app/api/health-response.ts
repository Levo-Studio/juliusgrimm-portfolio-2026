const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0"
};

export const createHealthResponse = (): Response =>
  new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      site: "Julius Grimm"
    }),
    { headers }
  );
