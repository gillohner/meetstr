"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getEventMetadata = void 0;
exports.getEventMetadata = function (event) {
    var getTagValue = function (tagName) { var _a; return (_a = event.tags.find(function (t) { return t[0] === tagName; })) === null || _a === void 0 ? void 0 : _a[1]; };
    // Fetch all values for repeatable tags
    var getTagValues = function (tagName) {
        return event.tags.filter(function (t) { return t[0] === tagName; }).map(function (t) { return t.slice(1); });
    };
    console.log("title: ", getTagValue("title"));
    console.log("name: ", getTagValue("name"));
    console.log("summary: ", getTagValue("summary"));
    console.log("description: ", getTagValue("description"));
    return {
        title: getTagValue("title") ? getTagValue("title") : getTagValue("name"),
        start: getTagValue("start"),
        end: getTagValue("end"),
        start_tzid: getTagValue("start_tzid"),
        end_tzid: getTagValue("end_tzid"),
        summary: getTagValue("summary") ? getTagValue("summary") : getTagValue("description"),
        image: getTagValue("image"),
        // Repeatable tags:
        location: getTagValue("location"),
        geohash: getTagValue("g"),
        participants: getTagValues("p"),
        labels: __spreadArrays(getTagValues("l").flat(), getTagValues("L").flat()),
        hashtags: getTagValues("t").flat(),
        references: getTagValues("r").flat(),
        // Optionally include deprecated fields, UUID, etc.
        uuid: getTagValue("d")
    };
};
