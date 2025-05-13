// src/features/event/components/dist/EventOverview.js
"use strict";

exports.__esModule = true; // src/features/event/components/EventOverview.tsx

var React = require("react");

var react_1 = require("react");

var react_i18next_1 = require("react-i18next");

var material_1 = require("@mui/material");

var eventUtils_1 = require("@/utils/nostr/eventUtils");

var EventLocationText_1 = require("@/components/common/events/EventLocationText");

var EventTimeDisplay_1 = require("@/components/common/events/EventTimeDisplay");

var useNostrEvent_1 = require("@/hooks/useNostrEvent");

var EventLocationMapCard_1 = require("@/components/common/events/EventLocationMapCard");

var EventRsvpMenu_1 = require("@/components/common/events/EventRsvpMenu");

var EventAttendeesCard_1 = require("@/components/common/events/EventAttendeesCard");

function EventOverview(_a) {
  var eventId = _a.eventId;
  var t = react_i18next_1.useTranslation().t;

  var _b = useNostrEvent_1.useNostrEvent(),
      event = _b.event,
      loading = _b.loading,
      errorCode = _b.errorCode,
      fetchEvent = _b.fetchEvent;

  var expectedKinds = react_1.useMemo(function () {
    return [31922, 31923];
  }, []);
  react_1.useEffect(function () {
    if (eventId) {
      fetchEvent(eventId, expectedKinds);
    }
  }, [eventId, fetchEvent, expectedKinds]);
  var errorMessage = react_1.useMemo(function () {
    if (!errorCode) return null;

    switch (errorCode) {
      case "not_found":
        return t("error.event.notFound");

      case "invalid_kind":
        return t("error.event.invalidKind");

      default:
        return t("error.generic");
    }
  }, [errorCode, t]);
  if (loading) return React.createElement(material_1.Typography, null, t("common.loading"));
  if (errorCode) return React.createElement(material_1.Typography, {
    color: "error"
  }, errorCode);

  if (!event) {
    return React.createElement(material_1.Typography, {
      variant: "h4"
    }, t("error.event.invalidId"));
  }

  var metadata = eventUtils_1.getEventMetadata(event);
  console.log("event: ", event.id);
  metadata.hashtags = ["test", "event", "overview"];
  console.log("metadata: ", metadata);
  return React.createElement(material_1.Container, {
    maxWidth: "lg",
    sx: {
      mb: 4
    }
  }, React.createElement(material_1.Card, {
    sx: {
      width: "100%",
      mb: 4
    }
  }, metadata.image && React.createElement(material_1.CardMedia, {
    component: "img",
    alt: metadata.title || "",
    height: "300",
    image: metadata.image,
    sx: {
      objectFit: "cover"
    }
  }), React.createElement(material_1.CardContent, null, React.createElement(material_1.Grid, {
    container: true
  }, React.createElement(material_1.Grid, {
    size: 10
  }, React.createElement(material_1.Typography, {
    gutterBottom: true,
    variant: "h4",
    component: "div"
  }, metadata.title || t("error.event.noName", "Unnamed Event")), React.createElement(EventTimeDisplay_1["default"], {
    startTime: metadata.start,
    endTime: metadata.end
  }), React.createElement(EventLocationText_1["default"], {
    location: metadata.location
  }), React.createElement(material_1.Typography, {
    variant: "body1",
    paragraph: true
  }, metadata.summary)), React.createElement(material_1.Grid, {
    size: 2
  }, event && React.createElement(EventRsvpMenu_1["default"], {
    event: event
  }))), React.createElement(material_1.Divider, {
    sx: {
      my: 2
    }
  }), React.createElement(material_1.Box, {
    sx: {
      mt: 3
    }
  }, metadata.references.map(function (reference, index) {
    return React.createElement(material_1.Link, {
      href: reference,
      key: "link-" + index,
      variant: "body2",
      sx: {
        mr: 2
      }
    }, reference);
  })), React.createElement(material_1.Box, {
    sx: {
      mt: 3
    }
  }, metadata.hashtags.map(function (hashtag, index) {
    return React.createElement(material_1.Chip, {
      key: "hashtag-" + index,
      label: "#" + hashtag,
      size: "small",
      sx: {
        m: 0.5
      }
    });
  }), metadata.labels.map(function (label, index) {
    return React.createElement(material_1.Chip, {
      key: "label-" + index,
      label: "" + label,
      size: "small",
      sx: {
        m: 0.5
      }
    });
  })))), React.createElement(material_1.Grid, {
    container: true
  }, React.createElement(material_1.Grid, {
    size: {
      xs: 12,
      md: 7,
      lg: 8
    }
  }), React.createElement(material_1.Grid, {
    size: {
      xs: 12,
      md: 5,
      lg: 4
    }
  }, React.createElement(EventLocationMapCard_1["default"], {
    metadata: metadata
  }), React.createElement(EventAttendeesCard_1["default"], {
    participants: metadata.participants.map(function (p) {
      return {
        pubkey: p[0]
      };
    }),
    event: event
  }))));
}

exports["default"] = EventOverview;