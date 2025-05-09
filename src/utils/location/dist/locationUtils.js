"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getLocationInfo = void 0;
// src/utils/locationUtils.ts
var geohash_1 = require("@/utils/location/geohash");
var osmTags_1 = require("@/utils/location/osmTags");
var address_formatter_1 = require("@fragaria/address-formatter");
function getLocationInfo(locationName, geohash) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, Promise, function () {
        var osmResult, response, results, decoded, response, osmTags, paymentMethods, coords, mapLinks, addressComponents, formattedName, formattedAddress, error_1;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 8, , 9]);
                    osmResult = null;
                    console.log("Fetching location info for:", locationName, geohash);
                    if (!locationName) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(locationName) + "&format=json&limit=1")];
                case 1:
                    response = _h.sent();
                    console.log("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(locationName) + "&format=json&limit=1");
                    console.log("Location search response:", response);
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    results = _h.sent();
                    osmResult = results[0];
                    _h.label = 3;
                case 3:
                    if (!(!osmResult && geohash)) return [3 /*break*/, 6];
                    decoded = geohash_1.decodeGeohash(geohash);
                    return [4 /*yield*/, fetch("https://nominatim.openstreetmap.org/reverse?lat=" + decoded.latitude + "&lon=" + decoded.longitude + "&format=json")];
                case 4:
                    response = _h.sent();
                    if (!response.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, response.json()];
                case 5:
                    osmResult = _h.sent();
                    _h.label = 6;
                case 6:
                    if (!osmResult)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, osmTags_1.fetchOsmTags(osmResult.osm_type, osmResult.osm_id)];
                case 7:
                    osmTags = _h.sent();
                    paymentMethods = {
                        acceptsBitcoin: osmTags["currency:XBT"] === "yes",
                        onChain: osmTags["payment:onchain"] === "yes",
                        lightning: osmTags["payment:lightning"] === "yes",
                        contactless: osmTags["payment:lightning_contactless"] === "yes"
                    };
                    coords = {
                        latitude: parseFloat(osmResult.lat),
                        longitude: parseFloat(osmResult.lon)
                    };
                    mapLinks = __assign({ osm: "https://openstreetmap.org/" + osmResult.osm_type + "/" + osmResult.osm_id, google: "https://www.google.com/maps/search/?api=1&query=" + coords.latitude + "," + coords.longitude + "," + osmResult.display_name, apple: "https://maps.apple.com/?q=" + osmResult.name + "&ll=" + coords.latitude + "," + coords.longitude }, (paymentMethods.acceptsBitcoin && {
                        btcmap: "https://btcmap.org/merchant/" + osmResult.osm_type + ":" + osmResult.osm_id
                    }));
                    addressComponents = {
                        houseNumber: osmTags["addr:housenumber"] || ((_a = osmResult.address) === null || _a === void 0 ? void 0 : _a.house_number),
                        road: osmTags["addr:street"] || ((_b = osmResult.address) === null || _b === void 0 ? void 0 : _b.road),
                        city: osmTags["addr:city"] || ((_c = osmResult.address) === null || _c === void 0 ? void 0 : _c.city),
                        postcode: osmTags["addr:postcode"] || ((_d = osmResult.address) === null || _d === void 0 ? void 0 : _d.postcode),
                        state: osmTags["addr:state"] || ((_e = osmResult.address) === null || _e === void 0 ? void 0 : _e.state),
                        country: osmTags["addr:country"] || ((_f = osmResult.address) === null || _f === void 0 ? void 0 : _f.country),
                        countryCode: (_g = osmResult.address) === null || _g === void 0 ? void 0 : _g.country_code
                    };
                    formattedName = osmTags.name;
                    formattedAddress = address_formatter_1["default"].format(addressComponents);
                    return [2 /*return*/, {
                            coords: coords,
                            osmInfo: {
                                displayName: osmResult.display_name,
                                id: osmResult.osm_id,
                                type: osmResult.type,
                                tags: osmResult.tags || {}
                            },
                            paymentMethods: paymentMethods,
                            mapLinks: mapLinks,
                            formattedName: formattedName,
                            formattedAddress: formattedAddress
                        }];
                case 8:
                    error_1 = _h.sent();
                    console.error("Location service error:", error_1);
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.getLocationInfo = getLocationInfo;
