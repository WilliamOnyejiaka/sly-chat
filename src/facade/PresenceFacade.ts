import { OnlineCustomer, OnlineVendor, OnlineAdmin } from "../cache";
import BaseFacade from "./bases/BaseFacade";
import { ServiceResultDataType, UserType } from "../types/enums";
import { Chat } from "../services";
import { ChatPagination, ServiceData } from "../types";

export default class PresenceFacade extends BaseFacade {

    private readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private readonly onlineVendor: OnlineVendor = new OnlineVendor();
    private readonly onlineAdmin: OnlineAdmin = new OnlineAdmin();
    private readonly chatService = new Chat();

    public constructor() {
        super();
    }

    public async setOnlineUser(userId: number, socketId: string, user: UserType) {
        const setMethods = {
            [UserType.Admin]: this.onlineAdmin.set.bind(this.onlineAdmin),
            [UserType.Customer]: this.onlineCustomer.set.bind(this.onlineCustomer),
            [UserType.Vendor]: this.onlineVendor.set.bind(this.onlineVendor)
        };

        const setMethod = setMethods[user];
        if (setMethod) {
            const successful = await setMethod(String(userId), {
                socketId: socketId
            });
            return !successful ? this.service.socketResponseData(500, true, "Something went wrong") : this.service.socketResponseData(200, false);
        }
        return this.service.socketResponseData(500, true, "Invalid user type");
    }

    public async deleteOnlineUser(userId: string, userType: UserType) {
        const deleteMethods = {
            [UserType.Admin]: this.onlineAdmin.delete.bind(this.onlineAdmin),
            [UserType.Customer]: this.onlineCustomer.delete.bind(this.onlineCustomer),
            [UserType.Vendor]: this.onlineVendor.delete.bind(this.onlineVendor)
        };

        const deleteMethod = deleteMethods[userType];

        if (deleteMethod) {
            const unsuccessful = await deleteMethod(userId);
            return !unsuccessful ? this.service.socketResponseData(500, true, "Something went wrong") : this.service.socketResponseData(200, false);
        }
        return this.service.socketResponseData(500, true, "Invalid user type");
    }

    public async getUserTransactionChatRooms(userId: number, userType: UserType): Promise<ServiceData> {
        if (userType == UserType.Admin) return this.service.socketResponseData(200, false, null, []);
        const pagination: ChatPagination = {
            page: 1,
            limit: 10,
            message: {
                page: 1,
                limit: 10
            }
        };

        const serviceResult = await this.chatService.getUserChatsWithMessages(userId, userType, pagination, ServiceResultDataType.SOCKET) as ServiceData; // TODO: handle this
        if (serviceResult.error) return serviceResult;
        return serviceResult
    }
}

