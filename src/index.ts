import {CookieJar, Cookie} from "request";
import * as rp from "request-promise";
import * as tough from "tough-cookie";
import * as cookieParser from "set-cookie-parser"; 

export interface NetworkRestrictionOpts {
    up?: number,
    down?: number,
    bytes?: number
}

export interface ControllerConfig {
    host: string,
    port?: number,
    isSelfSigned?: boolean,
    siteName?: string
}

export interface AuthClientOpts extends NetworkRestrictionOpts {
    minutes?: number
}

export interface VoucherOpts extends NetworkRestrictionOpts {
    note?: string
}

export class UnifiController {

    private _cookieJar : CookieJar;
    private _isLoggedIn: boolean;
    private _controllerUrl: string;
    private _isSelfSigned: boolean;
    private _siteName: string;

    constructor(config: ControllerConfig) {
        this._cookieJar = rp.jar();
        this._isLoggedIn = false;
        this._isSelfSigned = !!config.isSelfSigned;
        this._siteName = config.siteName || "default";

        const host = config.host || "localhost";
        const port = config.port || 8443;

        this._controllerUrl = `https://${host}:${port}`
    }

    async login(username: string, password: string) {
        if (this._isLoggedIn) {
            await this.logout();
        }

        return this.request("/api/login", {
            "username": username,
            "password": password
        });
    }

    async logout() {
        if (!this._isLoggedIn) {
            return;
        }

        return this.request("/api/logout");
    }

    async authenticateClient(mac: string, ap: string, opts?: AuthClientOpts) {
        const defaultOpts = {
            minutes: 60 * 24
        }

        // Overwrite values from left to right
        const body = Object.assign(defaultOpts, opts, {
            cmd: "authorize-guest",
            mac: mac,
            ap_mac: ap            
        });

        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, body);
    }

    async createVouchers(quantity: number, minutes: number, opts?: VoucherOpts) {
        if (quantity < 1) {
            return;
        }

        if (minutes < 1) {
            minutes = 1;
        }

        // Overwrite values from left to right
        const body = Object.assign(opts, {
            cmd: "create-voucher",
            expire: minutes,
            n: quantity
        });

        return this.request(`/api/s/${this._siteName}/stat/voucher`, body);
    }

    // ------------------------------------------------------------------------

    private async request(uri:string, body?: any) {
        const opts = {
            method: "POST",
            uri: this._controllerUrl + uri,
            resolveWithFullResponse: true,
            jar: this._cookieJar,
            json: true,
            body: body
        };

        const nodeTslRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED; 
        if (this._isSelfSigned) {
            // Ignore self signed certificate warnings
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        return rp(opts)
            .then((response) => {
                cookieParser.parse(response).forEach(cookie => {
                    this._cookieJar.setCookie(new tough.Cookie(cookie) as any, this._controllerUrl);            
                });

            }).finally(() => {
                // Restore the environment variable value
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = nodeTslRejectUnauthorized;
            });
    }
}