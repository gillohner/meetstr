"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.useNostrEvent = void 0;
// src/hooks/useNostrEvent.ts
var react_1 = require("react");
var nostr_hooks_1 = require("nostr-hooks");
var nostrUtils_1 = require("@/utils/nostr/nostrUtils");
exports.useNostrEvent = function () {
    var ndk = nostr_hooks_1.useNdk().ndk;
    var _a = react_1.useState(null), event = _a[0], setEvent = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(null), errorCode = _c[0], setErrorCode = _c[1];
    var fetchEvent = react_1.useCallback(function (identifier, expectedKinds) {
        if (expectedKinds === void 0) { expectedKinds = []; }
        return __awaiter(void 0, void 0, void 0, function () {
            var controller, fetchedEvent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ndk || !identifier) {
                            setErrorCode(null);
                            setEvent(null);
                            return [2 /*return*/];
                        }
                        setLoading(true);
                        controller = new AbortController();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, nostrUtils_1.fetchEventById(ndk, identifier, controller.signal)];
                    case 2:
                        fetchedEvent = _a.sent();
                        if (!fetchedEvent) {
                            setErrorCode("not_found");
                            setEvent(null);
                            return [2 /*return*/];
                        }
                        if (expectedKinds.length > 0 && !expectedKinds.includes(fetchedEvent.kind)) {
                            setErrorCode("invalid_kind");
                            setEvent(null);
                            return [2 /*return*/];
                        }
                        setEvent(fetchedEvent);
                        setErrorCode(null);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        // More specific error handling
                        if (error_1 instanceof TypeError) {
                            console.error("Network error:", error_1);
                            setErrorCode("network_error");
                        }
                        else {
                            console.error("Event fetch error:", error_1);
                            setErrorCode("network_error");
                        }
                        setEvent(null);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: 
                    // Return cleanup function
                    return [2 /*return*/, function () { return controller.abort(); }];
                }
            });
        });
    }, [ndk]);
    return {
        event: event,
        loading: loading,
        errorCode: errorCode,
        fetchEvent: fetchEvent
    };
};
