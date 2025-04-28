
export interface TransactionChat {
    id?: string
    productId: number,
    vendorId: number,
    customerId: number,
    storeId: number,
    lastMessageAt?: DateTime,
    createdAt?: DateTime,
};

export interface TransactionMessage {
    id?: string;
    senderId: number;
    senderType?: any; // Enum values TODO: change this
    text: string;
    timestamp?: Date;
    read?: boolean;
    recipientOnline: boolean;
    chatId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface UserDto {
    id?: string,
    userId: number,
    firstName: string,
    lastName: string,
    email: string,
    verified: boolean,
    active: boolean,
    phoneNumber: string,
    createdAt?: Date,
    updatedAt?: Date,
    profilePictureUrl?: string
}

export interface ProductCommentDto {
    id?: string,
    content: string,
    userId: number,
    productId: number,
    userType: string,
    parentId?: string | null,
    replies?: any[],
    createdAt?: Date,
    updatedAt?: Date,
}

export interface StoreDto {
    id?: string,
    name: string,
    vendorId: number,
    storeId: number,
    storeLogoUrl?: string,
    createdAt: Date,
    updatedAt: Date
};