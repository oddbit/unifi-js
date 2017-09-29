export interface Uplink {
    full_duplex: boolean,
    ip: string,
    mac: string,
    max_speed: number,
    name: string,
    num_port: number,
    speed: number,
    type: string,
    up: boolean
}

export interface RadioNg {
    channel: string,
    name: string,
    radio: string
}

export interface Device                   {
    _id: string,
    _uptime: number,
    adopted: boolean,
    cfgversion: string,
    connect_request_ip: string,
    connect_request_port: string,
    device_id: string,
    guest_token: string,
    inform_authkey: string,
    inform_ip: string,
    inform_url: string,
    ip: string,
    isolated: boolean,
    last_seen: number,
    mac: string,
    model: string,
    name: string,
    num_sta: number,
    radio_na:null,
    radio_ng: RadioNg,
    radio_table: RadioNg[],
    site_id: string,
    type: string,
    upgradable: boolean,
    upgrade_to_firmware: string,
    uplink: Uplink,
    uplink_table: Uplink[],
    uptime: number,
    version: string
 }