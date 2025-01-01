import { Category } from "../../repos";
import adminAuthorization from "../adminAuthorize";
import validateBody from "./validateBody";
import { bodyBooleanIsValid, bodyNumberIsValid, itemNameExists } from "./validators";

const categoryNameExists = itemNameExists<Category>(new Category(), "name");
const adminAuth = adminAuthorization(['manage_all']);

export const createCategory = [
    adminAuth,
    validateBody([
        "name",
        "priority",
        "active"
    ]),
    bodyBooleanIsValid('active'),
    bodyNumberIsValid('priority'),
    categoryNameExists
];