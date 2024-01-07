let cov = await Deno.readTextFile("./lcov.info");
cov = cov.replaceAll("C:\\git\\deno\\deno_winrm\\src\\", "/github/workspace/src/");
cov = cov.replaceAll("\\", "/");
await Deno.writeTextFile("./lcov.info", cov);
console.info("Cov path fixed.");