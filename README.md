# deno_winrm
deno_winrm is a Deno typescript client for the Windows Remote Management (WinRM) service. It allows you to invoke commands on target Windows machines using Deno.

## Examples:

```ts
import * as winrm from "https://deno.land/x/deno_winrm/mod.ts";

const context = new winrm.WinRMContext({
  username: "my_user",
  password: "my_password",
}, "machine_name_or_ip");

const result = await context.runCommand("ipconfig /all");

if (result.success) {
  console.log(result.message);
} else {
  console.log(result.error?.message);
}

```