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

    /**
     * Login to the UniFi controller
     *
     * @param username Admin username (provided user needs administrator rights)
     * @param password Password
     * @returns Always returns a Promise with an empty array
     */
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

    /**
     * Logout from the UniFi controller.
     *
     * @returns Always returns a Promise with an empty array
     */
    async logout(): Promise<any[]> {
        if (!this._isLoggedIn) {
            return Promise.resolve([]);
        }

        return this.request("/api/logout");
    }

    /**
     * Authorize a client device to connect through the hotspot.
     *
     * @param mac MAC address of the client device
     * @param ap The access point MAC to which the client device connected
     * @param [opts] Auth/connection options (see `AuthClientOpts`)
     */
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

    /**
     * Unauthorize a client device
     *
     * @param mac MAC address of the client device
     * @returns Always returns a Promise with an empty array
     */
    async unauthorizeClient(mac: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, {
            cmd: "unauthorize-guest",
            mac: mac
        });
    }

    /**
     * List authorized client devices.
     *
     * @param [timeframe] The window of time (in seconds) to limit results by (default is 30 days)
     * @param [from] Alternative start time from where to list devices (default is "now")
     * @returns A promise with an array of `Client` devices
     */
    async getClients(timeframe?: number, from?: number): Promise<unifiTypes.Client[]> {
        timeframe = timeframe || 60 * 60 * 24 * 30;
        from = from || Math.round(Date.now() / 1000);

        console.log(`timeframe = ${timeframe} from = ${from}`);
        return this.request(`/api/s/${this._siteName}/stat/authorization`, {
            start: timeframe,
            end: from
        });
    }

    /**
     * Reconnect a client device
     *
     * @param mac MAC address of the client device to reconnect
     * @throws HTTP 400 Exception if the MAC address is not known to the controller
     */
    async reconnectClient(mac: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, {
            cmd: "kick-sta",
            mac: mac
        });
    }

    /**
     * Block a client device
     *
     * @param mac MAC of client device to block
     */
    async blockClient(mac: string): Promise<unifiTypes.ClientBlockedResponse[]> {
        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, {
            cmd: "block-sta",
            mac: mac
        });
    }

    /**
     * Unblock a client device
     *
     * @param mac MAC of client device to block
     */
    async unblockClient(mac: string): Promise<unifiTypes.ClientBlockedResponse[]> {
        return this.request(`/api/s/${this._siteName}/cmd/stamgr`, {
            cmd: "unblock-sta",
            mac: mac
        });
    }

    /**
     * NOT TESTED !!!!
     */
    async backup() {
        return this.request(`/api/s/${this._siteName}/cmd/backup`, {
            cmd: "backup"
        });
    }

    /**
     * Create multi or single use voucher access tokens.
     *
     * @param quantity The number of vouchers to create
     * @param minutes How many minutes of uptime that will be included
     * @param [opts] Additional options
     * @returns A promise with a timestamp for when the vouchers were created
     */
    async createVouchers(quantity: number, minutes: number, opts?: unifiTypes.CreateVoucherOpts): Promise<unifiTypes.CreateVoucherResponse[]> {
        if (quantity < 1) {
            return Promise.resolve([]);
        }

        if (minutes < 1) {
            minutes = 1;
        }

        const defaultOpts = {
            quota: 1
        }

        // Overwrite values from left to right
        const body = Object.assign(defaultOpts, opts, {
            cmd: "create-voucher",
            expire: minutes,
            n: quantity
        });

        return this.request(`/api/s/${this._siteName}/cmd/hotspot`, body);
    }

    /**
     * Get all vouchers. The result set can be limited by a timestamp. The provided timestamp must match the
     * exact same timestamp on which the vouchers were created.
     *
     * @param timestamp The **exact** timestamp on which the desired vouchers were created on
     * @returns A promise with an array of `Voucher`
     */
    async getVouchers(timestamp?: number): Promise<unifiTypes.Voucher[]> {
        const body = {} as any;

        if (timestamp != null) {
            body.create_time = timestamp;
        }

        return this.request(`/api/s/${this._siteName}/stat/voucher`, body);
    }

    /**
     * Delete a voucher.
     *
     * @param voucherId The `_id` of the created `Voucher`
     * @returns Always returns a Promise with an empty array
     */
    async deleteVoucher(voucherId: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/hotspot`, {
            cmd: "delete-voucher",
            _id: voucherId
        });
    }

    /**
     * NOT TESTED !!!!
     */
    async upgradeExternal(ap: string, firmwareUrl: string): Promise<any[]> {
        return this.request(`/api/s/${this._siteName}/cmd/devmgr/upgrade-external`, {
            mac: ap,
            url: firmwareUrl
        });
    }

    /**
     * Get device info for one or all access points. Specifying an access point's MAC will limit
     * the result to only that AP.
     *
     * @param [ap] Access point MAC
     * @returns A promise with an array of comprehensive device info
     */
    async getDevices(ap?: string): Promise<unifiTypes.Device[]> {
        return this.request(`/api/s/${this._siteName}/stat/device/${ap || ""}`);
    }

    /**
     * Get controller system info
     *
     * @returns A promise with UniFi controller system information
     */
    async getSystemInfo(): Promise<unifiTypes.SystemInfo[]> {
        return this.request(`/api/s/${this._siteName}/stat/sysinfo`);
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