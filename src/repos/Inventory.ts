import prisma from ".";
import Repo from "./bases/Repo";


export default class Inventory extends Repo {

    public constructor(){
        super('inventory');
    }
}