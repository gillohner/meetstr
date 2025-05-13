// src/components/common/events/dist/EventPreviewCard.js
"use strict";
exports.__esModule = true;
// src/components/common/events/EventPreviewCard.tsx
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var navigation_1 = require("next/navigation");
var nostr_tools_1 = require("nostr-tools");
var material_1 = require("@mui/material");
var eventUtils_1 = require("@/utils/nostr/eventUtils");
var EventLocationText_1 = require("@/components/common/events/EventLocationText");
var EventTimeDisplay_1 = require("@/components/common/events/EventTimeDisplay");
var EventPreviewCard = function (_a) {
    var event = _a.event, _b = _a.sx, sx = _b === void 0 ? {} : _b;
    var t = react_i18next_1.useTranslation().t;
    var router = navigation_1.useRouter();
    var metadata = eventUtils_1.getEventMetadata(event);
    var name = metadata.title || t("error.event.noName");
    var handleClick = function () {
        var _a;
        try {
            var dTag = ((_a = event.tags.find(function (t) { return t[0] === "d"; })) === null || _a === void 0 ? void 0 : _a[1]) || "";
            var naddr = nostr_tools_1.nip19.naddrEncode({
                kind: event.kind,
                pubkey: event.pubkey,
                identifier: dTag
            });
            router.push("/event/" + naddr);
        }
        catch (error) {
            console.error("Error navigating to event:", error);
        }
    };
    return (react_1["default"].createElement(material_1.Card, { sx: {
            display: "flex",
            flexDirection: {
                xs: "column",
                sm: "row"
            },
            height: "100%",
            minHeight: 300
        } },
        react_1["default"].createElement(material_1.CardActionArea, { onClick: handleClick, sx: {
                display: "flex",
                flexDirection: {
                    xs: "column",
                    sm: "row"
                },
                height: "100%",
                alignItems: "stretch"
            } },
            metadata.image && (react_1["default"].createElement(material_1.CardMedia, { component: "img", image: metadata.image, alt: name, sx: {
                    // Image takes full width on mobile, fixed width on desktop
                    height: {
                        xs: 200,
                        sm: "100%"
                    },
                    width: {
                        xs: "100%",
                        sm: 220
                    },
                    objectFit: "cover",
                    borderRadius: {
                        xs: "4px 4px 0 0",
                        sm: "4px 0 0 4px"
                    }
                } })),
            react_1["default"].createElement(material_1.CardContent, { sx: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "auto",
                    minWidth: 0,
                    padding: 2
                } },
                react_1["default"].createElement(material_1.Typography, { gutterBottom: true, variant: "h6", component: "div", sx: {
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    } }, name),
                react_1["default"].createElement(EventTimeDisplay_1["default"], { startTime: metadata.start, endTime: metadata.end, typographyProps: {
                        variant: "body2",
                        fontSize: 14
                    } }),
                react_1["default"].createElement(EventLocationText_1["default"], { location: metadata.location, geohash: metadata.geohash, typographyProps: {
                        variant: "body2",
                        fontSize: 14
                    } })))));
};
exports["default"] = EventPreviewCard;
