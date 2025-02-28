"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: 'dyjhe7cg2',
    api_key: '343737699854672',
    api_secret: 'IYHjgMp8sCl0Qc9K_5HP4V3T03U' // Click 'View API Keys' above to copy your API secret
});
exports.default = cloudinary_1.v2;
