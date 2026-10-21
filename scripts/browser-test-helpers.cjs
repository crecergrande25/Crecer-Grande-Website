// Production data is never written by local or CI browser checks.
async function readOnlyContext(browser, options = {}) {
  const context = await browser.newContext(options);
  await context.route('**/*', route => {
    const method = route.request().method();
    return ['GET', 'HEAD', 'OPTIONS'].includes(method) ? route.fallback() : route.abort('blockedbyclient');
  });
  return context;
}
module.exports = { readOnlyContext };
