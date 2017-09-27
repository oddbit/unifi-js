"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rp = require("request-promise");
const tough = require("tough-cookie");
const cookieParser = require("set-cookie-parser");
class UnifiController {
    constructor(config) {
        this._cookieJar = rp.jar();
        this._isLoggedIn = false;
        this._isSelfSigned = !!config.isSelfSigned;
        this._siteName = config.siteName || "default";
        const host = config.host || "localhost";
        const port = config.port || 8443;
        this._controllerUrl = `https://${host}:${port}`;
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isLoggedIn) {
                yield this.logout;
            }
            return this.request("/api/login", {
                "username": username,
                "password": password
            });
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._isLoggedIn) {
                return;
            }
            return this.request("/api/logout");
        });
    }
    authenticateClient(mac, ap, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultOpts = {
                minutes: 60 * 24
            };
            // Over-write values from left to right
            const body = Object.assign(defaultOpts, opts, {
                cmd: "authorize-guest",
                mac: mac,
                ap_mac: ap
            });
            return this.request(`/api/s/${this._siteName}/cmd/stamgr`, body);
        });
    }
    request(uri, body) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    this._cookieJar.setCookie(new tough.Cookie(cookie), this._controllerUrl);
                });
            }).finally(() => {
                // Restore the environment variable value
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = nodeTslRejectUnauthorized;
            });
        });
    }
}
exports.UnifiController = UnifiController;
//# sourceMappingURL=index.js.map