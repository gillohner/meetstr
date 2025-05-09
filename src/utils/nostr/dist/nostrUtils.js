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
exports.fetchCalendarEvents = exports.fetchEventById = void 0;
var nostr_tools_1 = require("nostr-tools");
/**
 * Fetches a Nostr event using various identifier types
 *
 * @param ndk - The initialized NDK instance
 * @param identifier - Can be an event ID, naddr, or other identifier
 * @returns Promise that resolves to the event or null if not found
 */
exports.fetchEventById = function (ndk, identifier) { return __awaiter(void 0, void 0, Promise, function () {
    var filter, decoded, data, decoded, event, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!ndk) {
                    throw new Error("NDK instance not provided");
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                filter = void 0;
                // Handle different identifier types
                if (identifier.startsWith("naddr")) {
                    // If it's an naddr, decode it to get the components
                    try {
                        decoded = nostr_tools_1.nip19.decode(identifier);
                        if (decoded.type === "naddr") {
                            data = decoded.data;
                            filter = {
                                kinds: [data.kind],
                                authors: [data.pubkey],
                                "#d": [data.identifier]
                            };
                        }
                        else {
                            throw new Error("Invalid naddr format");
                        }
                    }
                    catch (error) {
                        console.error("Error decoding naddr:", error);
                        return [2 /*return*/, null];
                    }
                }
                else if (identifier.startsWith("note")) {
                    // If it's a note ID
                    try {
                        decoded = nostr_tools_1.nip19.decode(identifier);
                        if (decoded.type === "note") {
                            filter = { ids: [decoded.data] };
                        }
                        else {
                            throw new Error("Invalid note format");
                        }
                    }
                    catch (error) {
                        console.error("Error decoding note:", error);
                        return [2 /*return*/, null];
                    }
                }
                else {
                    // Assume it's a raw event ID
                    filter = { ids: [identifier] };
                }
                return [4 /*yield*/, ndk.fetchEvent(filter)];
            case 2:
                event = _a.sent();
                return [2 /*return*/, event];
            case 3:
                error_1 = _a.sent();
                console.error("Error fetching event:", error_1);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Fetches and categorizes calendar events from a main calendar event
 *
 * @param ndk - Initialized NDK instance
 * @param calendarEvent - The main calendar event (kind 31924)
 * @returns Object containing sorted upcoming and past events
 */
exports.fetchCalendarEvents = function (ndk, calendarEvent) { return __awaiter(void 0, void 0, Promise, function () {
    var now, upcoming, past, eventRefs, fetchPromises, results, sortAsc, sortDesc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                now = Math.floor(Date.now() / 1000);
                upcoming = [];
                past = [];
                if (!calendarEvent || calendarEvent.kind !== 31924) {
                    return [2 /*return*/, { upcoming: upcoming, past: past }];
                }
                eventRefs = calendarEvent.tags.filter(function (tag) { return tag[0] === "a"; });
                fetchPromises = eventRefs.map(function (tag) { return __awaiter(void 0, void 0, void 0, function () {
                    var parts, kindStr, pubkey, dTag, kind, event, startTime, error_2;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                parts = tag[1].split(":");
                                if (parts.length < 3)
                                    return [2 /*return*/, null];
                                kindStr = parts[0], pubkey = parts[1], dTag = parts[2];
                                kind = parseInt(kindStr);
                                if (kind !== 31922 && kind !== 31923)
                                    return [2 /*return*/, null];
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, ndk.fetchEvent({
                                        kinds: [kind],
                                        authors: [pubkey],
                                        "#d": [dTag]
                                    })];
                            case 2:
                                event = _b.sent();
                                if (!event)
                                    return [2 /*return*/, null];
                                startTime = parseInt(((_a = event.tags.find(function (t) { return t[0] === "start"; })) === null || _a === void 0 ? void 0 : _a[1]) || "0");
                                return [2 /*return*/, { event: event, startTime: startTime }];
                            case 3:
                                error_2 = _b.sent();
                                console.error("Error fetching calendar event:", error_2);
                                return [2 /*return*/, null];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(fetchPromises)];
            case 1:
                results = _a.sent();
                results.forEach(function (result) {
                    if (!result)
                        return;
                    if (result.startTime > now) {
                        upcoming.push(result.event);
                    }
                    else {
                        past.push(result.event);
                    }
                });
                sortAsc = function (a, b) { return (getStartTime(a) || 0) - (getStartTime(b) || 0); };
                sortDesc = function (a, b) { return (getStartTime(b) || 0) - (getStartTime(a) || 0); };
                return [2 /*return*/, {
                        upcoming: upcoming.sort(sortAsc),
                        past: past.sort(sortDesc)
                    }];
        }
    });
}); };
// Helper function to extract start time from event tags
var getStartTime = function (event) {
    var startTag = event.tags.find(function (t) { return t[0] === "start"; });
    return startTag ? parseInt(startTag[1]) : undefined;
};
