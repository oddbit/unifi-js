# @oddbit/unifi 
An easy to use and Typscript friendly API client for managing UBNT UniFi accesspoints.

The UniFi API is not very well documented, the main source of reference is [this shell script](https://dl.ubnt.com/unifi/5.4.16/unifi_sh_api), so
please give feedback if anything is amiss.

## Actions
The following actions are supported.

- Login 
- Logout
- Authorize client
- Reconnect client
- Block client
- Backup
- Create vouchers
- Get vouchers
- Delete vouchers
- Upgrade firmware

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

