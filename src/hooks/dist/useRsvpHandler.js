"use strict";
// src/hooks/useRsvpHandler.ts
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
exports.useRsvpHandler = void 0;
var react_1 = require("react");
var nostr_hooks_1 = require("nostr-hooks");
var ndk_1 = require("@nostr-dev-kit/ndk");
var uuid_1 = require("uuid");
var SnackbarContext_1 = require("@/context/SnackbarContext");
var react_i18next_1 = require("react-i18next");
function useRsvpHandler(event) {
    var _this = this;
    var ndk = nostr_hooks_1.useNdk().ndk;
    var activeUser = nostr_hooks_1.useActiveUser().activeUser;
    var showSnackbar = SnackbarContext_1.useSnackbar().showSnackbar;
    var t = react_i18next_1.useTranslation().t;
    var _a = react_1.useState(null), currentRsvp = _a[0], setCurrentRsvp = _a[1];
    var _b = react_1.useState(null), rsvpStatus = _b[0], setRsvpStatus = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    // Get event coordinates for addressing
    var getEventCoordinates = react_1.useCallback(function () {
        var _a;
        if (!event)
            return null;
        var dTag = (_a = event.tags) === null || _a === void 0 ? void 0 : _a.find(function (t) { return t[0] === "d"; });
        var dValue = dTag ? dTag[1] : "";
        return event.kind + ":" + event.pubkey + ":" + dValue;
    }, [event]);
    // Fetch current user's RSVP
    react_1.useEffect(function () {
        if (!ndk || !(event === null || event === void 0 ? void 0 : event.id) || !activeUser)
            return;
        setLoading(true);
        var filters = [
            {
                kinds: [31925],
                "#e": [event.id],
                authors: [activeUser.pubkey]
            },
        ];
        var eventCoordinates = getEventCoordinates();
        if (eventCoordinates) {
            filters.push({
                kinds: [31925],
                "#a": [eventCoordinates],
                authors: [activeUser.pubkey]
            });
        }
        var sub = ndk.subscribe(filters, { closeOnEose: true });
        sub.on("event", function (rsvpEvent) {
            var _a;
            setCurrentRsvp(rsvpEvent);
            var statusTag = (_a = rsvpEvent.tags) === null || _a === void 0 ? void 0 : _a.find(function (t) { return t[0] === "status"; });
            if (statusTag && statusTag[1]) {
                setRsvpStatus(statusTag[1]);
            }
        });
        sub.on("eose", function () {
            setLoading(false);
        });
        return function () {
            sub.stop();
        };
    }, [ndk, event === null || event === void 0 ? void 0 : event.id, activeUser, getEventCoordinates]);
    // Create new RSVP
    var createRsvp = react_1.useCallback(function (status) { return __awaiter(_this, void 0, void 0, function () {
        var rsvpEvent, eTag, aTag, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ndk || !(event === null || event === void 0 ? void 0 : event.id) || !activeUser)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setLoading(true);
                    if (!currentRsvp) return [3 /*break*/, 3];
                    return [4 /*yield*/, deleteRsvp()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    rsvpEvent = new ndk_1.NDKEvent(ndk);
                    rsvpEvent.content = status || "";
                    rsvpEvent.kind = 31925;
                    eTag = event.id;
                    aTag = getEventCoordinates() || "";
                    rsvpEvent.tags = [
                        ["e", eTag],
                        ["a", aTag],
                        ["d", uuid_1.v4()],
                        ["status", status || ""],
                        ["p", event.pubkey],
                    ];
                    return [4 /*yield*/, rsvpEvent.publish()];
                case 4:
                    _a.sent();
                    setCurrentRsvp(rsvpEvent);
                    setRsvpStatus(status);
                    showSnackbar(t("event.rsvp.success"), "success");
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error creating RSVP:", error_1);
                    showSnackbar(t("event.rsvp.error"), "error");
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [ndk, event, activeUser, currentRsvp, getEventCoordinates, showSnackbar, t]);
    // Delete RSVP using NIP-09
    var deleteRsvp = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var deletionEvent, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ndk || !currentRsvp || !activeUser)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    deletionEvent = new ndk_1.NDKEvent(ndk);
                    deletionEvent.kind = 5; // Event deletion request
                    deletionEvent.content = "RSVP withdrawn";
                    deletionEvent.tags = [["e", currentRsvp.id]];
                    // Add "k" tag for kind as recommended in NIP-09
                    deletionEvent.tags.push(["k", "31925"]);
                    return [4 /*yield*/, deletionEvent.publish()];
                case 2:
                    _a.sent();
                    setCurrentRsvp(null);
                    setRsvpStatus(null);
                    showSnackbar(t("event.rsvp.deleted"), "info");
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error deleting RSVP:", error_2);
                    showSnackbar(t("event.rsvp.deleteError"), "error");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [ndk, currentRsvp, activeUser, showSnackbar, t]);
    // Update RSVP (delete + create)
    var updateRsvp = react_1.useCallback(function (status) {
        createRsvp(status);
    }, [createRsvp]);
    return {
        rsvpStatus: rsvpStatus,
        currentRsvp: currentRsvp,
        loading: loading,
        createRsvp: createRsvp,
        deleteRsvp: deleteRsvp,
        updateRsvp: updateRsvp
    };
}
exports.useRsvpHandler = useRsvpHandler;
