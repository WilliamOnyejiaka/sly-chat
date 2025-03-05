
const getRoom = (productId: string, customerId: number, vendorId: number) => `chat_${productId}_${vendorId}_${customerId}`;
export default getRoom;