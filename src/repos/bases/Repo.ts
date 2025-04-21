import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "..";
import { http } from "../../constants";
import Repository from "../../interfaces/Repository";
import { logger } from "../../config";

// Define a generic type for the repository response
interface RepoResponse<T> {
    error: boolean;
    message: string | null;
    type: number;
    data: T;
}

export default class Repo<T = any> implements Repository {

    protected tblName: keyof PrismaClient;
    protected prisma = prisma;

    public constructor(tblName: keyof PrismaClient) {
        this.tblName = tblName;
    }

    public async insert<T = any>(data: T): Promise<RepoResponse<T | any>> {
        try {
            const newItem = await (prisma[this.tblName] as any).create({ data: data });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertMany(data: any[]) {
        try {
            const newItems = await (prisma[this.tblName] as any).createMany({ data: data, skipDuplicates: true });
            return this.repoResponse(false, 201, null, newItems);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async checkIfTblHasData() {
        const result = await this.countTblRecords();
        return result.error ? result : this.repoResponse(false, 200, null, result.data > 0);
    }

    public async getItemWithId(id: number | string) {
        return await this.getItem({ id: id });
    }

    public async getItemWithName(name: string) {
        return await this.getItem({ name: name });
    }

    protected async getItemWithRelation(where: any, include: any) {
        try {
            const item = await (prisma[this.tblName] as any).findUnique({
                where: where,
                include: include
            });
            return this.repoResponse(false, 200, null, item);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    protected async getItem(where: any, others: any = {}) {
        try {
            const item = await (prisma[this.tblName] as any).findFirst({
                where: where,
                ...others
            });
            return this.repoResponse(false, 200, null, item);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async clearTable() {
        try {
            const result = await (prisma[this.tblName] as any).deleteMany({});
            return this.repoResponse(false, 200, null, { recordCount: result.count });
        } catch (error: any) {
            return this.handleDatabaseError(error);
        }
    }

    public async delete(where: any) {
        try {
            const deletedData = await (prisma[this.tblName] as any).delete({
                where: where,
            });
            return this.repoResponse(false, 200, null, deletedData);
        } catch (error: any) {
            return this.handleDatabaseError(error);
        }
    }

    public async deleteWithId(id: number | string) {
        return await this.delete({ id: id });
    }

    protected async update(where: any, data: any) {
        try {
            const updatedItem = await (prisma[this.tblName] as any).update({
                where: where,
                data: data
            });

            return this.repoResponse(false, 200, null, updatedItem);
        } catch (error: any) {
            return this.handleDatabaseError(error);
        }
    }

    public async countTblRecords(countFilter: any = {}) {
        try {
            const count = await (prisma[this.tblName] as any).count(countFilter);
            return this.repoResponse(false, 200, null, count);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async paginate(skip: number, take: number, filter: any = {}, countFilter: any = {}): Promise<RepoResponse<{ items: T[], totalItems: any } | {}>> {
        try {
            const items = await (prisma[this.tblName] as any).findMany({
                skip,   // Skips the first 'skip' records
                take,   // Fetches 'take' records
                ...filter
            });
            const totalItems = await (prisma[this.tblName] as any).count(countFilter);
            return this.repoResponse(false, 200, null, {
                items: items,
                totalItems: totalItems
            });
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getAll(where: any) {
        try {
            const items = await (prisma[this.tblName] as any).findMany({
                where: where
            });
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getAllWithFilter(filter: any = {}) {
        try {
            const items = await (prisma[this.tblName] as any).findMany(filter);
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    // Standardized response
    protected repoResponse<TData>(
        error: boolean,
        type: number,
        message: string | null,
        data: TData
    ): RepoResponse<TData> {
        return { error, message, type, data: data };
    }

    protected handleDatabaseError(error: any) {
        console.log(error);

        if (error.code === "P2002") {
            // Unique constraint violation
            logger.error(`Unique constraint violation error for the ${this.tblName.toString()} table`);
            return this.repoResponse(true, 400, "A record with this data already exists.", {});
        } else if (error.code === "P2025") {
            logger.error(`Item was not found for the ${this.tblName.toString()} table`);
            return this.repoResponse(true, 400, "Item was not found.", {});
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle known Prisma errors
            switch (error.code) {
                case "P2003":
                    // Foreign key constraint violation
                    logger.error(`Foreign key constraint violation error for the ${this.tblName.toString()} table`);
                    return this.repoResponse(true, 400, `Invalid foreign key reference. Please check related fields.`, {});
                case "P2001":
                    // Record not found
                    logger.error(`Record not found for the ${this.tblName.toString()} table`);
                    return this.repoResponse(true, 400, "The requested record could not be found.", {});
                case "P2000":
                    // Value too long for a column
                    logger.error(`Value too long for a column for the ${this.tblName.toString()} table`);
                    return this.repoResponse(true, 400, "A value provided is too long for one of the fields.", {});
                default:
                    logger.error(`An unexpected database error occurred for the ${this.tblName.toString()} table`, error.message);
                    return this.repoResponse(true, 500, "An unexpected database error occurred.", {});
            }
        } else if (error instanceof Prisma.PrismaClientValidationError) {
            logger.error(`Validation error in the ${this.tblName.toString()} table`);
            return this.repoResponse(true, 400, 'Invalid data provided. Please check that all fields are correctly formatted.', {});
        }

        // Fallback for unexpected errors
        logger.error(error);
        return this.repoResponse(true, 400, http("500")!, {});
    }
}