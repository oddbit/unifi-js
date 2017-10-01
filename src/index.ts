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

    // ------------------------------------------------------------------------
    //
    // AUTH
    //

    /**
     * Login to the UniFi controller
     *
     * @param username Admin username (provided user needs administrator rights)
     * @param password Password
     */
    async login(username: string, password: string) {
        if (this._isLoggedIn) {
            await this.logout();
        }

        const body = {
            "username": username,
            "password": password
        };

        await this.post("/api/login", body);
        this._isLoggedIn = true;
    }

    /**
     * Logout from the UniFi controller.
     */
    async logout() {
        if (!this._isLoggedIn) {
            return;
        }

        await this.post("/api/logout");
        this._isLoggedIn = false;
    }

    // ------------------------------------------------------------------------
    //
    // CLIENTS / STA / DEVICES
    //


    /**
     * Reconnect a client device
     *
     * @param mac MAC address of the client device to reconnect
     */
    async reconnectClient(mac: string): Promise<void> {
        const body = {
            cmd: "kick-sta",
            mac: mac
        };

        await this.post(`/api/s/${this._siteName}/cmd/stamgr`, body);
    }

    /**
     * Block a client device
     *
     * @param mac MAC of client device to block
     */
    async blockClient(mac: string): Promise<unifiTypes.ClientBlockedResponse> {
        const body = {
            cmd: "block-sta",
            mac: mac
        };
        const response = await this.post(`/api/s/${this._siteName}/cmd/stamgr`, body);
        return response[0];
    }

    /**
     * Unblock a client device
     *
     * @param mac MAC of client device to block
     */
    async unblockClient(mac: string): Promise<unifiTypes.ClientBlockedResponse> {
        const body = {
            cmd: "unblock-sta",
            mac: mac
        };

        const response = await this.post(`/api/s/${this._siteName}/cmd/stamgr`, body);
        return response[0];
    }

    /**
     * Create an alias for a client.
     *
     * @param id Id of the client
     * @param alias Alias name
     */
    async setClientAlias(id: string, alias: string): Promise<any> {
        const body = {
            name: alias
        };

        const response = await this.post(`/api/s/${this._siteName}/upd/user/${id}`, body);
        return response[0];
    }

    /**
     * Remove a client alias.
     *
     * @param id Id of the client
     */
    async removeClientAlias(id: string): Promise<unifiTypes.ClientBase> {
        const body = {
            name: null
        };

        const response = await this.post(`/api/s/${this._siteName}/upd/user/${id}`, body);
        return response[0];
    }

    /**
     * Set a client note.
     *
     * @param id Id of the client
     * @param note Note
     */
    async setClientNote(id: string, note: string): Promise<unifiTypes.ClientBase> {
        const body = {
            note: note,
            noted: true
        };

        const response = await this.post(`/api/s/${this._siteName}/upd/user/${id}`, body);
        return response[0];
    }

    /**
     * Remove a client note.
     *
     * @param id Id of the client
     * @param note Note
     */
    async removeClientNote(id: string) {
        const body = {
            note: null,
            noted: false
        };

        const response = await this.post(`/api/s/${this._siteName}/upd/user/${id}`, body);
        return response[0];
    }

    /**
     * List connected clients
     */
    async listClients(): Promise<unifiTypes.Client[]> {
        return this.post(`/api/s/${this._siteName}/stat/sta`);
    }

    /**
     * Get a single client's info
     *
     * @param mac MAC address of the client
     */
    async getClient(mac: string): Promise<unifiTypes.Client> {
        const result = await this.post(`/api/s/${this._siteName}/stat/sta/${mac}`);
        return result[0];
    }


    // ------------------------------------------------------------------------
    //
    // HOTSPOT / GUESTS / VOUCHERS
    //

    /**
     * Authorize a client device to connect through the hotspot.
     *
     * @param mac MAC address of the client device
     * @param ap The access point MAC to which the client device connected
     * @param [opts] Auth/connection options (see `AuthClientOpts`)
     * @returns Authorized client data
     */
    async authorizeGuest(mac: string, ap: string, opts?: unifiTypes.AuthClientOpts): Promise<unifiTypes.ClientAuthResponse> {
        const defaultOpts = {
            minutes: 60 * 24
        }

        // Overwrite values from left to right
        const body = Object.assign(defaultOpts, opts, {
            cmd: "authorize-guest",
            mac: mac,
            ap_mac: ap
        });

        const response = await this.post(`/api/s/${this._siteName}/cmd/stamgr`, body);
        return response[0];
    }

    /**
     * Unauthorize a client device
     *
     * @param mac MAC address of the client device
     */
    async unauthorizeGuest(mac: string) {
        const body = {
            cmd: "unauthorize-guest",
            mac: mac
        };

        await this.post(`/api/s/${this._siteName}/cmd/stamgr`, body);
    }

    /**
     * Create multi or single use voucher access tokens.
     *
     * @param quantity The number of vouchers to create
     * @param minutes How many minutes of uptime that will be included
     * @param [opts] Additional options
     */
    async createVouchers(quantity: number, minutes: number, opts?: unifiTypes.CreateVoucherOpts): Promise<number> {
        if (quantity < 1) {
            throw Error("Quatity must be greater than zero");
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

        const response = await this.post(`/api/s/${this._siteName}/cmd/hotspot`, body);
        return response[0] && response[0].create_time;
    }

    /**
     * Get all vouchers. The result set can be limited by a timestamp. The provided timestamp must match the
     * exact same timestamp on which the vouchers were created.
     *
     * @param timestamp The **exact** timestamp on which the desired vouchers were created on
     */
    async listVouchers(timestamp?: number): Promise<unifiTypes.Voucher[]> {
        const body = {} as unifiTypes.VoucherCreate;

        if (timestamp != null) {
            body.create_time = timestamp;
        }

        return this.post(`/api/s/${this._siteName}/stat/voucher`, body);
    }

    /**
     * Delete a voucher.
     *
     * @param voucherId The `_id` of the created `Voucher`
     */
    async deleteVoucher(voucherId: string) {
        const body = {
            cmd: "delete-voucher",
            _id: voucherId
        };

        await this.post(`/api/s/${this._siteName}/cmd/hotspot`, body);
    }

    // ------------------------------------------------------------------------
    //
    // SYSTEM / INFORMATION
    //

    /**
     * List known sessions during a certain period of time. Default is to show the last month's sessions.
     *
     * @param [timeframe] The window of time (in seconds) to limit results by (default is 30 days)
     * @param [from] Alternative start time from where to list devices (default is "now")
     */
    async listSessions(timeframe?: number, from?: number): Promise<unifiTypes.Session[]> {
        timeframe = timeframe || 60 * 60 * 24 * 30;
        from = from || Math.round(Date.now() / 1000);

        const body = {
            start: timeframe,
            end: from
        };

        return this.post(`/api/s/${this._siteName}/stat/authorization`, body);
    }

    /**
     * List sites that are configured on the controller
     */
    async listSites(): Promise<unifiTypes.Site[]> {
        return this.get(`/api/self/sites`);
    }

    /**
     * Get the name of the site that is targeted in API calls.
     */
    getSite(): string {
        return this._siteName;
    }

    /**
     * Change the active site to target in API calls. This can be useful if site information was not known before
     * retreiving site information in a call to `listSites()`.
     *
     * @param siteName Name of the site
     */
    setSite(siteName: string) {
        this._siteName = siteName || "default";
    }

    /**
     * Get device info for one or all access points. Specifying an access point's MAC will limit
     * the result to only that AP.
     *
     * @param [ap] Access point MAC
     */
    async listDevices(ap?: string): Promise<unifiTypes.Device[]> {
        return this.post(`/api/s/${this._siteName}/stat/device/${ap || ""}`);
    }

    /**
     * Get controller system info
     */
    async getSystemInfo(): Promise<unifiTypes.SystemInfo> {
        const response = await this.post(`/api/s/${this._siteName}/stat/sysinfo`);
        return response[0];
    }

    // ------------------------------------------------------------------------

    private get(uri: string) {
        return this.request("GET", uri);
    }

    private post(uri: string, body?: any) {
        return this.request("POST", uri, body);
    }

    /**
     * Make a request to the UniFi controller API.
     * Successful requests always return an array, regardless of the context and amount of data.
     * So requests that expect a single value response comes in an array with 1 element and requests
     * that does not have a response are returned as an empty array.
     *
     * @param uri The API endpoint
     * @param body JSON body
     */
    private request(method: string, uri:string, body?: any) {
        const opts = {
            method: method,
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