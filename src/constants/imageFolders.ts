
export default function imageFolders(key: string) {
    const basePath = "ecommerce-cdn";
    const profilePicture = `${basePath}/profile-picture`;
    const store = `${basePath}/store`;
    const category = `${basePath}/category`

    return {
        'vendorProfilePic': profilePicture + "/vendor",
        'adminProfilePic': profilePicture + "/admin",
        'customerProfilePic': profilePicture + "/customer",
        'storeLogo': store + "/store-logo",
        'firstStoreBanner': store + "/banner/first-store-banner",
        'secondStoreBanner': store + "/banner/second-store-banner",
        'category': category + "/category",
        'subCategory': category + "/subcategory",
        'subSubCategory': category + "/subsubcategory"
    }[key];
}