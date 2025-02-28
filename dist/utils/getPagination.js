"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPagination;
function getPagination(page, pageSize, totalRecords) {
    const totalPages = Math.ceil(totalRecords / pageSize);
    return {
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalPages,
        totalRecords,
    };
}
