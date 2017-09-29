import {CookieJar, Cookie} from "request";
import * as rp from "request-promise";
import * as tough from "tough-cookie";
import * as cookieParser from "set-cookie-parser"; 
import * as unifiTypes from "./types";



export class UnifiController {

    private _cookieJar : CookieJar;
    private _isLoggedIn: boolean;
    private _controllerUrl: string;
    private _isSelfSigned: boolean;
    private _siteName: string;

    constructor(config: unifiTypes.ControllerConfig) {
        this._cookieJar = rp.jar();
        this._isLoggedIn = false;
        this._isSelfSigned = !!config.isSelfSigned;
        this._siteName = config.siteName || "default";

        const host = config.host || "localhost";
        const port = config.port || 8443;

        this._controllerUrl = `https://${host}:${port}`
    }

    async login(username: string, password: string): Promise<any[]> {
        if (this._isLoggedIn) {
            await this.logout();
        }

        const body = {
            "username": username,
            "password": password
        };

        return this.request("/api/login", body).then(response => {
            this._isLoggedIn = true;
            return response;
        });
    }

    async logout(): Promise<any[]> {
        if (!this._isLoggedIn) {
            return;
        }

        return this.request("/api/logout");
    }

    async authorizeClient(mac: string, ap: string, opts?: unifiTypes.AuthClientOpts): Promise<unifiTypes.ClientAuthResponse[]> {
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

    async reconnectClient(mac: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, {
            cmd: "kick-sta",
            mac: mac       
        });
    }

    async blockClient(mac: string): Promise<unifiTypes.ClientBlockedResponse[]> {
        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, {
            cmd: "block-sta",
            mac: mac       
        });
    }

    async backup() {
        return this.request(`/api/s/${this._siteName}/cmd/backup`, {
            cmd: "backup"  
        });
    }

    async createVouchers(quantity: number, minutes: number, opts?: unifiTypes.CreateVoucherOpts): Promise<any[]> {
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

    async getVouchers(timestamp?: number): Promise<any[]> {
        const body = {} as any;

        if (timestamp != null) {
            body.create_time = timestamp;    
        }

        return this.request(`/api/s/${this._siteName}/stat/voucher`, body);
    }

    async deleteVoucher(voucher: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/hotspot`, {
            cmd: "delete-voucher",
            _id: voucher
        });
    }

    async upgradeExternal(ap: string, firmwareUrl: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/devmgr/upgrade-external`, {
            mac: ap,
            url: firmwareUrl
        });
    }

    async listDevices(ap?: string): Promise<unifiTypes.Device[]> { 
        return this.request(`/api/s/${this._siteName}/stat/device/${ap || ""}`); 
    } 

    // ------------------------------------------------------------------------

    private request(uri:string, body?: any) {
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

                return (response.body && response.body.data) || [];

            }).finally(() => {
                // Restore the environment variable value
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = nodeTslRejectUnauthorized;
            });
    }
}