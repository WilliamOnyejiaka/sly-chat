import { Twilio } from "twilio";
import { env, logger, twilioClient } from "../config";
import BaseService from "./bases/BaseService";

export default class TwilioService extends BaseService {

    private readonly client: Twilio;
    private readonly twilioPhoneNumber: string;

    public constructor(client?: Twilio, twilioPhoneNumber?: string) {
        super();
        this.client = client ?? twilioClient;
        this.twilioPhoneNumber = env('twilioPhoneNumber')! ?? twilioPhoneNumber;
    }

    public async sendSMSMain(to: string, message: string) {
        try {
            const result = await this.client.messages.create({
                body: message,
                from: this.twilioPhoneNumber,
                to,
            });
            return super.responseData(200, false, "Message was sent", {
                sid: result.sid
            });
        } catch (error) {
            logger.error(`Error sending SMS: ${error}`);
            return super.responseData(500, true, "Failed to send SMS")
        }
    }

    public async verify(to: string) {
        try {
            const verification = await this.client.verify.v2
                .services("VAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                .verifications.create({
                    channel: "sms",
                    to: to,
                });
            console.log(verification);

            return verification;
        } catch (error) {
            logger.error(`Error verifying number: ${error}`);
            return false;
        }

    }

    public async sendSMS(to: string, message: string) {
        try {
            if (await this.verify(to)) {
                const result = await this.client.messages.create({
                    body: message,
                    from: this.twilioPhoneNumber,
                    to,
                });
                return super.responseData(200, false, "Message was sent", {
                    sid: result.sid
                });
            }
            return super.responseData(500, true, "Failed to send SMS")
        } catch (error) {
            logger.error(`Error sending SMS: ${error}`);
            return super.responseData(500, true, "Failed to send SMS")
        }
    }
}