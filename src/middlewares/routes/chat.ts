import { uploads, validateBody, validateFileUpload } from "..";
import { ResourceType } from "../../types/enums";
import { bodyNumberIsValid, paramNumberIsValid, queryIsValidNumber } from "../validators";

const sendMedia = [
    validateFileUpload,
    validateBody([
        'recipientId',
        'productId'
    ]),
    bodyNumberIsValid('recipientId'),
    bodyNumberIsValid('productId')

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

export const pagination = [
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
];


export const messages = [
    paramNumberIsValid('productId'),
    paramNumberIsValid('participantId'),
    queryIsValidNumber('page'),
    queryIsValidNumber('limit'),
];

export const recentMessages = [
    paramNumberIsValid('productId'),
    paramNumberIsValid('participantId')
];

export const getChat = [
    ...recentMessages
]
