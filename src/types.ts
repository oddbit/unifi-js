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

export interface CreateVoucherOpts extends NetworkRestrictionOpts {
    note?: string,
    quota: number
}

export interface CreateVoucherResponse {
    create_time: number
}

export interface SystemInfo {
    autobackup: boolean,
    build: string,
    data_retention_days: number,
    debug_device: string,
    debug_mgmt: string,
    debug_sdn: string,
    debug_system: string,
    google_maps_api_key: string,
    hostname: string,
    image_maps_use_google_engine: boolean,
    inform_port: number,
    ip_addrs: string[],
    live_chat: string,
    name: string,
    override_inform_host: boolean,
    timezone: string,
    unifi_go_enabled: boolean,
    update_available: boolean,
    update_downloaded: boolean,
    version: string
  }


export interface Voucher {
    _id: string,
    admin_name: string,
    code: string,
    create_time: number,
    duration: number,
    for_hotspot: boolean,
    note: string,
    qos_overwrite: boolean,
    quota: number,
    site_id: string,
    status: string,
    status_expires: number,
    used: number
  }

export interface ClientBlockedResponse  {
    blocked: boolean,
    mac: string,
    site_id: string
}

export interface ClientAuthResponse {
    authorized_by: string,
    end: number,
    mac: string,
    site_id: string,
    start: number
}

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