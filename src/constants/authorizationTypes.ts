
export default function authorizationTypes(key: number) {

    return {
        0: "SUPER_ADMIN",
        1: "ADMIN",
        2: "MANAGER",
        3: "CONTENT_ADMIN",
        4: "MODERATOR",
        5: "SUPPORT_ADMIN",
        6: "FINANCE_ADMIN",
        7: "HR_ADMIN",
        8: "IT_ADMIN",
        9: "COMPLIANCE_ADMIN",
        10: "VENDOR",
        11: "USER",
    }[key]
}