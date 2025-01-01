import prisma from ".";
import Repo from "./bases/Repo";

export default class Brand extends Repo {

    public constructor() {
        super('brand');
    }

}