"use strict";
exports.__esModule = true;
exports.decodeGeohash = void 0;
// src/utils/location/geohash.ts
var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
function decodeGeohash(geohash) {
    var isLon = true;
    var lat = [-90, 90];
    var lon = [-180, 180];
    geohash
        .toLowerCase()
        .split("")
        .forEach(function (char) {
        var code = BASE32_CODES.indexOf(char);
        if (code === -1)
            throw new Error("Invalid geohash character");
        for (var bits = 4; bits >= 0; bits--) {
            var bit = (code >> bits) & 1;
            if (isLon) {
                var mid = (lon[0] + lon[1]) / 2;
                if (bit === 1)
                    lon[0] = mid;
                else
                    lon[1] = mid;
            }
            else {
                var mid = (lat[0] + lat[1]) / 2;
                if (bit === 1)
                    lat[0] = mid;
                else
                    lat[1] = mid;
            }
            isLon = !isLon;
        }
    });
    return {
        latitude: (lat[0] + lat[1]) / 2,
        longitude: (lon[0] + lon[1]) / 2,
        error: {
            latitude: lat[1] - lat[0],
            longitude: lon[1] - lon[0]
        }
    };
}
exports.decodeGeohash = decodeGeohash;
