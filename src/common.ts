export const DEFAULT_PORT = 5985;

// deno-lint-ignore no-explicit-any
export type anyany = any // NOSONAR

export type CommandResponse = {
    success: boolean,
    message: string,
    error?: {
        reason?: string,
        message?: string
    }
}

export type ShellResponse = {
    stdout: string,
    stderr: string,
    exitCode: number,
    error?: {
        reason?: string,
        message?: string
    }
}

export type BasicAuthentication = {
    username: string,
    password: string,
}

export type WinRMHost = {
    hostname: string,
    port: number,
    protocol: string,
}

export type HttpResponse = {
    status: number,
    statusText: string,
    body: string,
}

export function constructHost(host: WinRMHost | string): string {
    const isStringHost = typeof host === "string";
    const protocol = isStringHost ? "http" : host.protocol;
    const hostname = isStringHost ? host : host.hostname;
    const port = isStringHost ? DEFAULT_PORT : host.port;
    return `${protocol}://${hostname}:${port}/wsman`;
}