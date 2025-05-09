"use strict";
exports.__esModule = true;
exports.useLocationInfo = void 0;
// src/hooks/useLocationInfo.ts
var react_query_1 = require("@tanstack/react-query");
var loader_1 = require("@/utils/location/loader");
function useLocationInfo(locationName, geohash) {
    return react_query_1.useQuery({
        queryKey: ["location", locationName, geohash],
        queryFn: function () {
            return loader_1.locationLoader.load({
                locationName: locationName || "",
                geohash: geohash || ""
            });
        },
        enabled: Boolean(locationName || geohash),
        staleTime: 1000 * 60 * 60
    });
}
exports.useLocationInfo = useLocationInfo;
