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

export interface VoucherCreate {
    create_time: number
}

export interface ClientBase {
    _id: string,
    first_seen: number,
    hostname: string,
    is_guest: boolean,
    is_wired: boolean,
    last_seen: number,
    mac: string,
    name?: string,
    noted: boolean,
    note?: string,
    oui: string,
    site_id: string
}


export interface Client extends ClientBase {
    _is_guest_by_uap: boolean,
    _last_seen_by_uap: number,
    _uptime_by_uap: number,
    ap_mac: string,
    assoc_time: number,
    bssid: string,
    ccq: number,
    channel: number,
    essid: string,
    idletime: number,
    ip: string,
    latest_assoc_time: number,
    noise: number,
    powersave_enabled: boolean,
    qos_policy_applied: boolean,
    radio: string,
    radio_proto: string,
    rssi: number,
    rx_bytes: number,
    rx_packets: number,
    rx_rate: number,
    signal: number,
    tx_bytes: number,
    tx_packets: number,
    tx_power: number,
    tx_rate: number,
    uptime: number,
    user_id: string
}

export interface Session {
    _id: string,
    ap_mac: string,
    authorized_by: string,
    bytes: number,
    channel: number,
    duration: number,
    end: number,
    hostname: string,
    ip: string,
    is_returning: boolean,
    mac: string,
    name: string,
    radio: string,
    roam_count: number,
    rx_bytes: number,
    site_id: string,
    start: number,
    tx_bytes: number,
    user_agent: string,
    user_id: string,
    voucher_code: string,
    voucher_id: string
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
    _id: string,
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

export interface Device {
    _id: string,
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