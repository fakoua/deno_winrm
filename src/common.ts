export const DEFAULT_PORT = 5985;

export type CommandResponse = {
    success: boolean,
    message: string,
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
    port: 5985,
    protocol: 'http',
}

export type HttpResponse = {
    status: number,
    statusText: string,
    body: string,
}

export function constractHost(host: WinRMHost | string): string {
    const isStringHost = typeof host === "string";
    const protocol = isStringHost ? "http" : host.protocol;
    const hostname = isStringHost ? host : host.hostname;
    const port = isStringHost ? DEFAULT_PORT : host.port;
    return `${protocol}://${hostname}:${port}/wsman`;
}