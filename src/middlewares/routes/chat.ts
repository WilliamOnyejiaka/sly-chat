import { uploads, validateBody, validateFileUpload } from "..";
import { ResourceType } from "../../types/enums";
import { bodyNumberIsValid } from "../validators";

const sendMedia = [
    validateFileUpload,
    validateBody([
        'recipientId',
        'productId'
    ]),
    bodyNumberIsValid('recipientId')
];

export const sendImage = [
    uploads(ResourceType.IMAGE).any(),
    ...sendMedia
];

export const sendPdf = [
    uploads(ResourceType.PDF).any(),
    ...sendMedia
];

export const sendVideo = [
    uploads(ResourceType.VIDEO).any(),
    ...sendMedia
];