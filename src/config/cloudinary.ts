import { v2 as cloudinary } from 'cloudinary';
import { env } from ".";

cloudinary.config({
    cloud_name: 'dyjhe7cg2',
    api_key: '343737699854672',
    api_secret: 'IYHjgMp8sCl0Qc9K_5HP4V3T03U' // Click 'View API Keys' above to copy your API secret
});

export default cloudinary;