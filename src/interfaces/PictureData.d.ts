
export interface PictureData {
    id?: number,
    mimeType: string,
    picture: string,
    createdAt?: any,
    updatedAt?: any,
}

export interface AdminProfilePictureData extends PictureData {
    adminId?: number 
}