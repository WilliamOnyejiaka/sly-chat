import { UserType } from "./../types/enums";

export default function userIds(userId: number, recipientId: number, userType: UserType) {
    const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
    return { customerId, vendorId };
}
