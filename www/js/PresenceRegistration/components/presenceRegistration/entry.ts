import init from "./src/userHeartbeats";

init().catch((e: unknown) => {
  console.error(e);
});
