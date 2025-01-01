
export default function urls(key: string) {

    return {
        "baseImageUrl": "/api/v1/image",
        "vendorPic": "/vendor/profile-pic/:id",
        "storeLogo": "/store/store-logo/:id",
        // "storeLogo1": "/image/store/store-logo/:" TODO: with vendor id
        "firstBanner": "/store/first-banner/:id",
        "secondBanner": "/store/second-banner/:id",
        "adminPic": "/admin/profile-pic/:id",
        "customerPic": "/customer/profile-pic/:id"
    }[key]
}