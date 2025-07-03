"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const index_js_1 = require("../types/index.js");
const notFound = (req, res, next) => {
    const error = new index_js_1.AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map