import prisma from ".";
import { PictureData } from "../interfaces/PictureData";
import { StoreDetailsDto } from "../types/dtos";
import Repo from "./bases/Repo";

export default class StoreDetails extends Repo {

    public constructor() {
        super('storeDetails');
    }

    public async insertWithRelations(
        storeDetailsDto: StoreDetailsDto,
        storeLogo: any,
        firstStoreBanner: any,
        secondStoreBanner: any
    ) {
        try {
            const data: any = {
                ...storeDetailsDto as any
            };

            storeLogo && (data['storeLogo'] = { create: storeLogo });
            secondStoreBanner && (data['secondStoreBanner'] = { create: secondStoreBanner });
            firstStoreBanner && (data['firstStoreBanner'] = { create: firstStoreBanner });

            const newStore = await prisma.storeDetails.create({
                data: data
            });

            return {
                error: false,
                data: newStore,
                type: 201,
                message: null
            };
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getStoreWithVendorId(vendorId: number) {
        return await super.getItem({ vendorId: vendorId }, {
            include: {
                storeLogo: {
                    select: {
                        imageUrl: true
                    }
                },
                firstStoreBanner: {
                    select: {
                        imageUrl: true
                    }
                },
                secondStoreBanner: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    public async sd(vendorId: number, filter?: any) {
        return await super.getAll({
            where: { vendorId: vendorId },
            include: {
                storeLogo: {
                    select: {
                        imageUrl: true
                    }
                },
                firstStoreBanner: {
                    select: {
                        imageUrl: true
                    }
                },
                secondStoreBanner: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    public async getStoreAndRelationsWithVendorId(vendorId: number) {
        try {
            const store = await prisma.storeDetails.findUnique({
                where: { vendorId: vendorId },
                include: {
                    storeLogo: {
                        select: {
                            mimeType: true
                        }
                    },
                    firstStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    },
                    secondStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    }
                }
            });
            return super.repoResponse(false, 200, null, store);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public override async delete(vendorId: number) {
        return await super.delete({ vendorId: vendorId });
    }

    public async getAllStoresAndRelations() {
        try {
            const items = await prisma.storeDetails.findMany({
                include: {
                    storeLogo: {
                        select: {
                            mimeType: true
                        }
                    },
                    firstStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    },
                    secondStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    }
                }
            });
            return super.repoResponse(false, 200, null, items);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async paginateStore(skip: number, take: number) {
        try {
            const items = await prisma.storeDetails.findMany({
                skip,
                take,
                include: {
                    storeLogo: {
                        select: {
                            mimeType: true
                        }
                    },
                    firstStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    },
                    secondStoreBanner: {
                        select: {
                            mimeType: true
                        }
                    }
                }
            });
            const totalItems = await prisma.storeDetails.count();

            return super.repoResponse(false, 200, null, {
                items: items,
                totalItems: totalItems
            });

        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async insertBanners(storeId: number, firstBanner?: any, secondBanner?: any) {
        try {
            const banners = await prisma.storeDetails.update({
                where: { id: storeId },
                data: {
                    firstStoreBanner: {
                        create: firstBanner
                    },
                    secondStoreBanner: {
                        create: secondBanner
                    }
                },
                include: {
                    firstStoreBanner: true,
                    secondStoreBanner: true
                }
            });

            return super.repoResponse(false, 201, null, banners);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getStore(storeId: number) {
        try {
            const banners = await prisma.storeDetails.findUnique({
                where: { id: storeId },
                include: {
                    storeLogo: true,
                    firstStoreBanner: true,
                    secondStoreBanner: true
                }
            });

            return super.repoResponse(false, 201, null, banners);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}