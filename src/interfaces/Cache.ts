

export default interface Cache { // TODO: use thois only for users
    get: (key: string) => Promise<{ error: boolean; data?: any }>;
    set: (email: string,data: any) => Promise<boolean>;
}