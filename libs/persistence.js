"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistence = void 0;
exports.persistence = {
    setItem(key, value) {
        return Promise.resolve(window.localStorage.setItem(key, value));
    },
    getItem(key) {
        return Promise.resolve(window.localStorage.getItem(key));
    },
    removeItem(key) {
        return Promise.resolve(window.localStorage.removeItem(key));
    },
    clear() {
        return Promise.resolve(window.localStorage.clear());
    }
};
