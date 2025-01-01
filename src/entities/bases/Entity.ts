
export default class BaseEntity {
    
    protected excludedFields: string[];

    public constructor(excludedFields: string[]) {
        this.excludedFields = excludedFields;
    }

    public toPlainObject(): Record<string, any> {
        return { ...this };
    }

    public toSecureObject(): Record<string, any> {
        const plainObject = this.toPlainObject();
        // Exclude fields listed in `excludedFields`
        this.excludedFields.forEach((field) => {
            delete (plainObject as any)[field];
        });

        return plainObject;
    }
}
