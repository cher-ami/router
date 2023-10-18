/**
 * Ugly render patch middleware
 * @param render
 */
export const htmlReplacement = (render: string): string =>
  render
    .replace("<html", `<!DOCTYPE html><html`)
    .replaceAll('<script nomodule=""', "<script nomodule")
    .replaceAll('crossorigin="anonymous"', "crossorigin")
