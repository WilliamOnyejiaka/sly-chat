
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

