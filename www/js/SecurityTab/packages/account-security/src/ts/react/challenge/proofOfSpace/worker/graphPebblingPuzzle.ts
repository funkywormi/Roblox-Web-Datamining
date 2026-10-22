import environmentUrls from "@rbx/environment-urls";

const WORKER_COMPONENT = "ChallengeWebWorkers";
const WORKER_VERSION = 2;
const URL_NOT_FOUND = "URL_NOT_FOUND";
const websiteUrl = environmentUrls.websiteUrl ?? URL_NOT_FOUND;

const workerUrl = `${websiteUrl}/worker-resources/script/?component=${WORKER_COMPONENT}&v=${WORKER_VERSION}`;
export default (): Worker => new Worker(workerUrl);
