import Repo from "./bases/Repo";

export default class Store extends Repo {

    public constructor() {
        super('store');
    }

    public async updateStoreLogo(storeId: number, storeLogoUrl: string) {
        return this.update({ storeId }, { storeLogoUrl });
        // try {
        //     const updatedItem = await this.prisma.store.update({
        //         where: { vendorId: vendorId },
        //         data: { storeLogoUrl: storeLogoUrl }
        //     });

        //     return this.repoResponse(false, 200, null, updatedItem);
        // } catch (error: any) {
        //     return this.handleDatabaseError(error);
        // }
    }
}