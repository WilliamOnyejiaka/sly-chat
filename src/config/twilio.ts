import { Twilio } from 'twilio';
import env from './env';

const accountSid = env('twilioAccountSID');
const authToken = env('twilioAuthToken');

const twilioClient = new Twilio(accountSid, authToken);

export default twilioClient;