# @oddbit/unifi &dash; [![npm version](https://img.shields.io/npm/v/@oddbit/unifi.svg)](https://www.npmjs.com/package/@oddbit/unifi) ![npm](https://img.shields.io/npm/l/@oddbit/unifi.svg)

An easy to use and Typscript friendly API client for managing UBNT UniFi accesspoints.


The UniFi API is officially not very well documented, the project started out from [this shell script](https://dl.ubnt.com/unifi/5.4.16/unifi_sh_api) but I've found that the source code of the PHP project
[UniFi-API-browser](https://github.com/Art-of-WiFi/UniFi-API-browser) is the best API documentation
at the moment. Thanks guys!

## Actions
The following actions are supported.

- Login
- Logout
- Authorize client
- Unauthorize client
- Reconnect client
- List clients
- Block client
- Unblock client
- Backup
- Create vouchers
- List vouchers
- Delete vouchers
- Upgrade firmware
- List access points with device info
- Get UniFi controller system info

## How to use it

Below is a simple example of synchronous communication with the UniFI controller to authorize a guest (device) at the hotspot.

```typescript
import * as unifi from "@oddbit/unifi";

const controller = new unifi.UnifiController({
    host: "10.11.12.13",
    isSelfSigned: true,
    siteName: "default"
});

await controller.login("admin", "secretPassword");

// Client MAC and the MAC of access point to which the client device connected
await controller.authorizeClient("00:11:22:33:44:55", "66:77:88:99:aa:bb");

await controller.logout();
```

