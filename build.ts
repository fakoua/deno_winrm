import { parseArgs } from "https://deno.land/std@0.211.0/cli/parse_args.ts";

const flags = parseArgs(Deno.args, {
  boolean: ["prebuild"],
  default: { prebuild: false },
});

if (flags.prebuild) {
  try {
    await Deno.remove("./.coverage", { recursive: true });
  } catch {
    console.log(".coverage does not exist")
  }
} else {
  //Post Build
  await fix_coverage();
}

async function fix_coverage(): Promise<void> {
  let cov = await Deno.readTextFile("./lcov.info");
  cov = cov.replaceAll(
    "C:\\git\\deno\\deno_winrm\\src\\",
    "/github/workspace/src/",
  );
  cov = cov.replaceAll("\\", "/");
  await Deno.writeTextFile("./lcov.info", cov);
  console.info("Cov path fixed.");
}
