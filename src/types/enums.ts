
export enum UserType {
    Admin = "admin",
    Vendor = "vendor",
    Customer = "customer",
};

export enum Events {
    APP_ERROR = "appError",

}
export enum Namespace {
    CHAT = '/chat',
    PRESENCE = '/presence',
    NOTIFICATION = '/notification'
}

export enum ServiceResultDataType {
    HTTP = 'http',
    SOCKET = 'socket'
}