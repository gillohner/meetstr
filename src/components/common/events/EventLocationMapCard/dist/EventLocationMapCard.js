"use strict";
exports.__esModule = true;
// src/components/common/events/EventLocationMapCard/EventLocationMapCard.tsx
var material_1 = require("@mui/material");
var react_i18next_1 = require("react-i18next");
var useLocationInfo_1 = require("@/hooks/useLocationInfo"); // New custom hook
var material_2 = require("@mui/material");
var OpenInNew_1 = require("@mui/icons-material/OpenInNew");
var ContactlessOutlined_1 = require("@mui/icons-material/ContactlessOutlined");
var BoltOutlined_1 = require("@mui/icons-material/BoltOutlined");
var CurrencyBitcoinOutlined_1 = require("@mui/icons-material/CurrencyBitcoinOutlined");
var LinkOutlined_1 = require("@mui/icons-material/LinkOutlined");
var EventLocationMapCard = function (_a) {
    var metadata = _a.metadata;
    var t = react_i18next_1.useTranslation().t;
    var _b = useLocationInfo_1.useLocationInfo(metadata.location, metadata.geohash), locationData = _b.data, isLoading = _b.isLoading;
    var renderPaymentBadges = function () {
        if (!(locationData === null || locationData === void 0 ? void 0 : locationData.paymentMethods.acceptsBitcoin))
            return null;
        return (React.createElement(material_1.Box, { sx: { mt: 1, display: "flex", gap: 1 } },
            React.createElement(material_1.Tooltip, { title: t("payment.bitcoinAccepted") },
                React.createElement(material_1.Chip, { label: React.createElement(CurrencyBitcoinOutlined_1["default"], null), sx: {
                        backgroundColor: "#F7931A22",
                        color: "#F7931A",
                        "& .MuiChip-label": {
                            p: 0.5,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    } })),
            locationData.paymentMethods.onChain && (React.createElement(material_1.Tooltip, { title: t("payment.onChain") },
                React.createElement(material_1.Chip, { label: React.createElement(LinkOutlined_1["default"], null), sx: {
                        backgroundColor: "action.selected",
                        "& .MuiChip-label": {
                            p: 0.5,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    } }))),
            locationData.paymentMethods.lightning && (React.createElement(material_1.Tooltip, { title: t("payment.lightning") },
                React.createElement(material_1.Chip, { label: React.createElement(BoltOutlined_1["default"], null), sx: {
                        backgroundColor: "warning.light",
                        color: "warning.contrastText",
                        "& .MuiChip-label": {
                            p: 0.5,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    } }))),
            locationData.paymentMethods.contactless && (React.createElement(material_1.Tooltip, { title: t("payment.contactless") },
                React.createElement(material_1.Chip, { label: React.createElement(ContactlessOutlined_1["default"], null), sx: {
                        backgroundColor: "success.light",
                        color: "success.contrastText",
                        "& .MuiChip-label": {
                            p: 0.5,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }
                    } })))));
    };
    var renderMapFrame = function () {
        if (!locationData)
            return null;
        return (React.createElement("iframe", { title: "location-map", src: "https://www.openstreetmap.org/export/embed.html?bbox=" + (locationData.coords.longitude - 0.01) + "," + (locationData.coords.latitude - 0.01) + "," + (locationData.coords.longitude + 0.01) + "," + (locationData.coords.latitude + 0.01) + "&layer=mapnik&marker=" + locationData.coords.latitude + "," + locationData.coords.longitude, style: { border: "none", width: "100%", height: "300px" } }));
    };
    var renderMapLinks = function () { return (React.createElement(material_1.Stack, { direction: "column", spacing: 0, sx: { mt: 1, flexWrap: "wrap", gap: 1.5, fontSize: "0.8rem" } },
        (locationData === null || locationData === void 0 ? void 0 : locationData.mapLinks.osm) && (React.createElement(material_1.Link, { href: locationData.mapLinks.osm, target: "_blank", display: "flex", alignItems: "center" },
            t("service.openstreetmap"),
            " ",
            React.createElement(OpenInNew_1["default"], { fontSize: "inherit", sx: { ml: 0.5 } }))),
        (locationData === null || locationData === void 0 ? void 0 : locationData.mapLinks.btcmap) && (React.createElement(material_1.Link, { href: locationData.mapLinks.btcmap, target: "_blank", display: "flex", alignItems: "center" },
            t("service.btcmap"),
            " ",
            React.createElement(OpenInNew_1["default"], { fontSize: "inherit", sx: { ml: 0.5 } }))),
        (locationData === null || locationData === void 0 ? void 0 : locationData.mapLinks.google) && (React.createElement(material_1.Link, { href: locationData === null || locationData === void 0 ? void 0 : locationData.mapLinks.google, target: "_blank", display: "flex", alignItems: "center" },
            t("service.googlemaps"),
            " ",
            React.createElement(OpenInNew_1["default"], { fontSize: "inherit", sx: { ml: 0.5 } }))),
        (locationData === null || locationData === void 0 ? void 0 : locationData.mapLinks.apple) && (React.createElement(material_1.Link, { href: locationData === null || locationData === void 0 ? void 0 : locationData.mapLinks.apple, target: "_blank", display: "flex", alignItems: "center" },
            t("service.applemaps"),
            " ",
            React.createElement(OpenInNew_1["default"], { fontSize: "inherit", sx: { ml: 0.5 } }))))); };
    return (React.createElement(material_1.Card, null,
        React.createElement(material_1.CardContent, null,
            React.createElement(material_1.Typography, { variant: "h6", gutterBottom: true }, t("event.location")),
            isLoading && React.createElement(material_2.CircularProgress, { size: 24 }),
            !isLoading && locationData && (React.createElement(React.Fragment, null,
                renderMapFrame(),
                renderPaymentBadges(),
                renderMapLinks())),
            !isLoading && !locationData && (React.createElement(material_1.Typography, { variant: "body2", color: "text.secondary" }, t("event.noLocation"))))));
};
exports["default"] = EventLocationMapCard;
