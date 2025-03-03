
export interface TransactionChat {
    id?: string
    productId: string,
    vendorId: number,
    customerId: number,
    customerProfilePic?: string,
    productPrice: string,
    productName: string,
    storeName: string,
    customerName: string,
    storeLogoUrl?: string,
    productImageUrl: string,
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
    userType?: string,
    createdAt?: Date,
    updatedAt?: DateTime,
    profilePictureUrl: string
}
