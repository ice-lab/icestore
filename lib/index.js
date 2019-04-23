"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
var Fiy = /** @class */ (function () {
    function Fiy() {
        this.stroes = {};
    }
    Fiy.prototype.registerStore = function (namespace, config) {
        if (this.stroes[namespace]) {
            throw new Error("Namespace have been used: " + namespace + ".");
        }
        this.stroes[namespace] = new store_1.default(config);
        return this.stroes[namespace];
    };
    Fiy.prototype.getModel = function (namespace) {
        var store = this.stroes[namespace];
        if (!store) {
            throw new Error("Not found namespace: " + namespace + ".");
        }
        return store;
    };
    Fiy.prototype.useStroe = function (namespace) {
        return this.getModel(namespace).useStroe();
    };
    return Fiy;
}());
exports.default = Fiy;
//# sourceMappingURL=index.js.map