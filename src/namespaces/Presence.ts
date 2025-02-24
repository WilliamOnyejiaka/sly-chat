import { ISocket } from "../types";
import { UserType } from "../types/enums";
import Base from "./Base";

export default class Presence extends Base {


    public constructor() {
        super();
    }

    protected async onConnection(socket: ISocket) {
        console.log("User connected: ", socket.id);
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;
        console.log(`User id ${userId} , user type ${userType}`);
    }
}