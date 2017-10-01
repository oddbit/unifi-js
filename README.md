# @oddbit/unifi
 [![npm version](https://img.shields.io/npm/v/@oddbit/unifi.svg)](https://www.npmjs.com/package/@oddbit/unifi) ![npm](https://img.shields.io/npm/l/@oddbit/unifi.svg)

An easy to use and Typscript friendly API client for managing UBNT UniFi accesspoints.


The UniFi API is officially not very well documented, the project started out from [this shell script](https://dl.ubnt.com/unifi/5.4.16/unifi_sh_api) but I've found that the source code of the PHP project
[UniFi-API-browser](https://github.com/Art-of-WiFi/UniFi-API-browser) is the best API documentation
at the moment. Thanks guys!

## Actions
The following actions are supported.

- Authorization
    - Login
    - Logout
- Clients (STA/connected devices)
    - Reconnect client
    - List clients
    - Get client
    - Block client
    - Unblock client
    - Set or remove client alias
    - Set or remove client notes
- Hotspot guest access
    - Authorize guest
    - Unauthorize guest
    - List vouchers
    - Create vouchers
    - Delete vouchers
- System
    - Get UniFi controller system info
    - List sites
    - List access points with device info
    - List sessions

## How to use it

Below is a simple example of synchronous communication with the UniFI controller to authorize a guest (device) at the hotspot.

### Basic
The basics of how to create a controller reference and login / logout.

```typescript
import * as unifi from "@oddbit/unifi";

const controller = new unifi.UnifiController({
    host: "10.11.12.13",
    isSelfSigned: true,
    siteName: "default"
});

await controller.login("admin", "secretPassword");
await controller.logout();
```

### Authorizing a guest to connect through the hotspot
The first parameter is the MAC of the connecting device. This is captured by the hotspot and passed to your portal page in the page redirection.

```typescript
await controller.authorizeGuest("00:11:22:33:44:55", "66:77:88:99:aa:bb");
```

