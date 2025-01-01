import { Password } from "../../utils";
import { emailValidator } from "../../validators";
import BaseEntity from "./Entity";

export default class UserEntity extends BaseEntity {

    public constructor(
        protected id: number,
        protected firstName: string,
        protected password: string,
        protected lastName: string,
        protected email: string
    ) {
        super(['password']);
    }

    public getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public validateEmail() {
        return emailValidator(this.email);
    }

    public comparePassword(plainPassword: string, storedSalt: string) {
        return Password.compare(plainPassword, this.password, storedSalt);
    }
}