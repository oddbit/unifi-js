export interface UnifiControllerConfig {
    host: string;
    port?: number;
    isSelfSigned?: boolean;
    siteName?: string;
}
export interface UnifiAuthClientOpts {
    minutes?: number;
    up?: number;
    down?: number;
    bytes?: number;
}
export declare class UnifiController {
    private _cookieJar;
    private _isLoggedIn;
    private _controllerUrl;
    private _isSelfSigned;
    private _siteName;
    constructor(config: UnifiControllerConfig);
    login(username: string, password: string): Promise<void>;
    logout(): Promise<void>;
    authenticateClient(mac: string, ap: string, opts?: UnifiAuthClientOpts): Promise<void>;
    private request(uri, body?);
}
