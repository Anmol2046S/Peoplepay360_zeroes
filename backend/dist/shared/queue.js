"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrunQueue = exports.connection = void 0;
// Disable BullMQ/Redis for local dev to avoid connection crashes
exports.connection = null;
exports.payrunQueue = {
    add: async () => { console.log('Mock queue add'); }
};
