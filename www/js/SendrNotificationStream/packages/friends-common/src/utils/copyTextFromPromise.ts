/**
 * Copies text that is not yet available, such as a value still being fetched.
 *
 * Safari only permits a clipboard write that is issued synchronously within a given mouse click.
 * If a user action results in a handler being called that writes to the clipboard but is not
 * synchronous, the write will fail. This function works around that by using the ClipboardItem API if available, which allows for asynchronous writes.
 *
 * Before: User click -> async handler -> response takes 2-3 seconds -> navigator.clipboard.writeText() fails
 * After: User click -> pass promise to copyTextFromPromise() -> async handler -> pass promise to navigator.clipboard.write() via ClipboardItem
 * -> response takes 2-3 seconds -> navigator.clipboard.write() succeeds
 *
 *
 */
export async function copyTextFromPromise(textPromise: Promise<string>): Promise<void> {
  if (typeof ClipboardItem !== "undefined" && typeof navigator.clipboard.write === "function") {
    const blob = textPromise.then(text => new Blob([text], { type: "text/plain" }));
    const item = new ClipboardItem({ "text/plain": blob });
    await Promise.all([navigator.clipboard.write([item]), blob]);
    return;
  }
  await navigator.clipboard.writeText(await textPromise);
}
