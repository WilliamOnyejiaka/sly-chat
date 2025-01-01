
export default function validations(key: string){

    return {
        'phoneNumber': "Invalid phone number format",
        '400Email': "Email already exists"
    }[key]
}