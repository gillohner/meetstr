// src/components/common/events/EventCommentsCard.tsx
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useProfile } from "nostr-hooks";
import { nip19 } from "nostr-tools";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import type { NDKFilter, NDKEvent } from "@nostr-dev-kit/ndk";

interface Comment {
  id: string;
  content: string;
  pubkey: string;
  created_at: number;
  parentId?: string;
  replies: Comment[];
}

interface EventCommentsCardProps {
  event: NDKEvent;
}

const EventCommentsCard = ({ event }: EventCommentsCardProps) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const signer = ndk?.signer;

  // Calculate event coordinates for addressable events
  const eventCoordinates = useMemo(() => {
    if (!event) return null;
    const dTag = event.tags.find((t: string[]) => t[0] === "d");
    return dTag ? `${event.kind}:${event.pubkey}:${dTag[1]}` : null;
  }, [event]);

  // Fetch comments for this event
  const fetchComments = useCallback(() => {
    if (!ndk || !event?.id || !eventCoordinates) return;

    const filters: NDKFilter[] = [
      {
        // @ts-ignore
        kinds: [1111], // NIP-22 comment kind
        "#A": [eventCoordinates], // Comments on this addressable event
      },
      {
        // @ts-ignore
        kinds: [1111],
        "#E": [event.id], // Comments on this specific event ID
      },
    ];

    const sub = ndk.subscribe(filters, { closeOnEose: false });
    setLoading(true);
    const fetchedComments = new Map<string, Comment>();

    sub.on("event", (commentEvent: NDKEvent) => {
      const comment: Comment = {
        id: commentEvent.id,
        content: commentEvent.content,
        pubkey: commentEvent.pubkey,
        created_at: commentEvent.created_at!,
        parentId: getParentId(commentEvent),
        replies: [],
      };

      fetchedComments.set(comment.id, comment);
    });

    sub.on("eose", () => {
      // Build comment tree
      const commentTree = buildCommentTree(
        Array.from(fetchedComments.values())
      );
      setComments(commentTree);
      setLoading(false);
      sub.stop();
    });
  }, [ndk, event?.id, eventCoordinates]);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchComments]);

  // Extract parent comment ID from comment event tags
  const getParentId = (commentEvent: NDKEvent): string | undefined => {
    // Look for lowercase 'e' tag (parent comment)
    const parentTag = commentEvent.tags.find((t: string[]) => t[0] === "e");
    return parentTag?.[1];
  };

  // Build hierarchical comment tree
  const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentsMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    flatComments.forEach((comment) => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    flatComments.forEach((comment) => {
      const commentNode = commentsMap.get(comment.id)!;

      if (comment.parentId && commentsMap.has(comment.parentId)) {
        // This is a reply to another comment
        const parent = commentsMap.get(comment.parentId)!;
        parent.replies.push(commentNode);
      } else {
        // This is a top-level comment
        rootComments.push(commentNode);
      }
    });

    // Sort by creation time (newest first)
    return rootComments.sort((a, b) => b.created_at - a.created_at);
  };

  // Post a new comment
  const handlePostComment = useCallback(async () => {
    if (!ndk || !signer || !event || !newComment.trim()) return;

    setPosting(true);
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;

      const commentEvent = new NDKEvent(ndk, {
        kind: 1111, // NIP-22 comment kind
        content: newComment.trim(),
        tags: [
          // Root scope tags (uppercase)
          eventCoordinates
            ? ["A", eventCoordinates]
            : ["E", event.id, "", event.pubkey],
          ["K", event.kind.toString()],
          ["P", event.pubkey],

          // Parent scope tags (lowercase) - same as root for top-level comments
          eventCoordinates
            ? ["a", eventCoordinates]
            : ["e", event.id, "", event.pubkey],
          ["k", event.kind.toString()],
          ["p", event.pubkey],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await commentEvent.sign(signer);
      await commentEvent.publish();

      setNewComment("");
      fetchComments(); // fetch comments after posting
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setPosting(false);
    }
  }, [ndk, signer, event, newComment, eventCoordinates, fetchComments]);

  // Post a reply to a comment
  const handlePostReply = useCallback(
    async (parentCommentId: string) => {
      if (!ndk || !signer || !event || !replyText.trim()) return;

      setPosting(true);
      try {
        const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;

        const replyEvent = new NDKEvent(ndk, {
          kind: 1111,
          content: replyText.trim(),
          tags: [
            // Root scope tags (uppercase) - still point to original event
            eventCoordinates
              ? ["A", eventCoordinates]
              : ["E", event.id, "", event.pubkey],
            ["K", event.kind.toString()],
            ["P", event.pubkey],

            // Parent scope tags (lowercase) - point to the comment being replied to
            ["e", parentCommentId],
            ["k", "1111"], // Parent is a comment
            [
              "p",
              comments.find((c) => findCommentById(c, parentCommentId))
                ?.pubkey || "",
            ],
          ],
          created_at: Math.floor(Date.now() / 1000),
        });

        await replyEvent.sign(signer);
        await replyEvent.publish();

        setReplyText("");
        setReplyTo(null);
        fetchComments(); // fetch comments after posting reply
      } catch (error) {
        console.error("Failed to post reply:", error);
      } finally {
        setPosting(false);
      }
    },
    [ndk, signer, event, replyText, eventCoordinates, comments, fetchComments]
  );

  // Helper function to find comment by ID in tree
  const findCommentById = (comment: Comment, id: string): Comment | null => {
    if (comment.id === id) return comment;
    for (const reply of comment.replies) {
      const found = findCommentById(reply, id);
      if (found) return found;
    }
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t("event.comments.title")}{" "}
          {!loading && `(${getTotalCommentCount(comments)})`}
        </Typography>

        {/* New Comment Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t("event.comments.placeholder", "Add a comment...")}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title={signer ? "" : t("event.comments.signerRequired")}>
              <span>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || posting || !signer}
                >
                  {posting ? t("common.posting") : t("event.comments.post")}
                </Button>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ clear: "both" }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Comments List */}
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            {t("common.loading")}...
          </Typography>
        ) : comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t(
              "event.comments.empty",
              "No comments yet. Be the first to comment!"
            )}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onReply={(commentId) => setReplyTo(commentId)}
                replyTo={replyTo}
                replyText={replyText}
                setReplyText={setReplyText}
                onPostReply={handlePostReply}
                posting={posting}
                depth={0}
                signer={signer} // pass signer down
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to count total comments including replies
const getTotalCommentCount = (comments: Comment[]): number => {
  return comments.reduce((total, comment) => {
    return total + 1 + getTotalCommentCount(comment.replies);
  }, 0);
};

// Individual comment component with threading support
interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  replyTo: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  onPostReply: (parentId: string) => void;
  posting: boolean;
  depth: number;
  signer?: any; // add signer prop
}

const CommentThread = ({
  comment,
  onReply,
  replyTo,
  replyText,
  setReplyText,
  onPostReply,
  posting,
  depth,
  signer,
}: CommentThreadProps) => {
  const { t } = useTranslation();
  const { profile } = useProfile({ pubkey: comment.pubkey });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const npub = useMemo(
    () => nip19.npubEncode(comment.pubkey),
    [comment.pubkey]
  );
  const isReplying = replyTo === comment.id;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Box sx={{ ml: depth * 3 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <Avatar
          src={profile?.image}
          sx={{ width: 32, height: 32, cursor: "pointer" }}
          onClick={() => window.open(`https://njump.me/${npub}`, "_blank")}
        >
          {profile?.displayName?.[0]?.toUpperCase() || npub.slice(0, 2)}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {profile?.displayName || npub.slice(0, 8) + "..."}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.created_at * 1000).toLocaleString()}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
            {comment.content}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title={signer ? "" : t("event.comments.signerRequired")}>
              <span>
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => onReply(comment.id)}
                  disabled={isReplying || !signer}
                  color={!signer ? "inherit" : "primary"}
                  sx={!signer ? { color: "text.disabled" } : {}}
                >
                  {t("event.comments.reply")}
                </Button>
              </span>
            </Tooltip>
            {comment.replies.length > 0 && (
              <Chip
                label={`${comment.replies.length} ${comment.replies.length === 1 ? t("event.comments.reply") : t("event.comments.replies")}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {/* Reply Input */}
          {isReplying && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder={t(
                  "event.comments.replyPlaceholder",
                  "Write a reply..."
                )}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => onReply("")}
                  disabled={posting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onPostReply(comment.id)}
                  disabled={!replyText.trim() || posting}
                >
                  {posting ? t("common.posting") : t("event.comments.post")}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              replyTo={replyTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onPostReply={onPostReply}
              posting={posting}
              depth={depth + 1}
              signer={signer}
            />
          ))}
        </Box>
      )}

      {/* Comment Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(`https://njump.me/${npub}`);
            handleMenuClose();
          }}
        >
          {t("event.comments.copyProfile")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(`https://njump.me/${npub}`, "_blank");
            handleMenuClose();
          }}
        >
          {t("event.comments.viewProfile")}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EventCommentsCard;
