
export interface AdminDto {
    id?: number,
    firstName: string,
    lastName: string,
    password?: string,
    email: string,
    phoneNumber?: string,
    roleId: number
    createdAt?: any,
    updatedAt?: any,
    role?: any[],
    createdBy: number,
    directPermissions?: any[],
    active?: boolean
}

export interface RoleDto {
    id?: number
    name: string,
    description: string,
    level: number
}

export interface PermissionDto {
    id?: number
    name: string,
    description: string
}

export interface AdminPermissionDto {
    id?: number
    adminId: number,
    roleId: number
}



export interface StoreDetailsDto {
    id?: number,
    name: string,
    address: string,
    city: string,
    description: string,
    tagLine: string,
    createdAt?: any,
    updatedAt?: any,
    vendorId?: number
}


export default interface VendorDto {
    id?: number,
    firstName: string,
    lastName: string,
    password?: string,
    email: string,
    active?: boolean,
    isOauth?: boolean,
    oAuthDetails?: string,
    phoneNumber: string,
    createdAt?: any,
    updatedAt?: any
}

export interface CategoryDto {
    id?: number
    name: string,
    priority: number,
    active: boolean,
    adminId: number
}

export interface CustomerAddressDto {
    id?: number,
    street: string,
    city: string,
    zip: string
}

export interface CustomerDto {
    id?: number,
    firstName: string,
    lastName: string,
    email: string,
    password?: string,
    phoneNumber: string,
    address?: CustomerAddressDto
}

export interface TransactionChat {
    id?: string
    productId: string,
    vendorId: number,
    customerId: number,
    customerProfilePic: string,
    productPrice: string,
    productName: string,
    storeName: string,
    customerName: string,
    storeLogoUrl: string,
    productImageUrl: string,
};


// export interface Message {
//     id?: string,
//     senderId: number,
//     senderType: any,
//     text: string,
//     timestamp?: DateTime,
//     read?: boolean,
//     recipientOnline: boolean,
//     chatId: string,
//     createdAt?: DateTime,
//     updatedAt?: DateTime
// }

export interface TransactionMessage {
    id?: string;
    senderId: number;
    senderType: any; // Enum values TODO: change this
    text: string;
    timestamp?: Date;
    read?: boolean;
    recipientOnline: boolean;
    chatId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};
