[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fakoua_deno_winrm&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fakoua_deno_winrm)
# deno_winrm
deno_winrm is a Deno typescript client for the Windows Remote Management (WinRM) service. It allows you to invoke commands on target Windows machines using Deno.

## Examples:

### Without a context
Executing a command without a context, executes each command in a separate shell, the run command will get a shell, run the command then close the shell.

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

### With context
Executing commands with context will run all the commands between openShell/closeShell within the same shell, the user should manually opens and close the shell.
Using context is faster and can be used with environment variables.

```ts
import * as winrm from "https://deno.land/x/deno_winrm/mod.ts";
const context = new winrm.WinRMContext({username: "user", password: "P@as$"}, "host")
await context.openShell() // <- open a shell
let res = await context.runCommand("dir")
res = await context.runCommand("date /t")
console.log(res.message)
await context.closeShell() // <- close the shell
```
