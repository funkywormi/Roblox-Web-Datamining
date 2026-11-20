// What the www /device-probe page (apps/www/app/device-probe) and the client that frames it must
// agree on: where the page is served, and the type of the message it posts the scores in. The
// page isn't served in production.
export const DEVICE_PROBE_PATH = "/device-probe";

export const RESULT_MESSAGE_TYPE = "rbx-device-probe:result";
