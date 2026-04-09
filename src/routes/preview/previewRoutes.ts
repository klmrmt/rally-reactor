import { Router, Request, Response } from "express";
import { getRallyByRallyHexId } from "../../models/RallyModel";
import { getParticipantCount } from "../../models/ParticipantModel";
import { config } from "../../config/config";
import { trackEvent } from "../../utils/analytics";

const router = Router();

router.get("/:hexId", async (req: Request, res: Response) => {
  const { hexId } = req.params;
  const ua = req.headers["user-agent"] || "";

  const isCrawler =
    /facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|iMessageRichLink|WhatsApp|TelegramBot|Googlebot|bingbot|Discordbot/i.test(
      ua
    );

  if (!isCrawler) {
    trackEvent("session.preview_viewed", { hexId, isCrawler: false });
    res.redirect(`${config.clientUrl}/${hexId}`);
    return;
  }

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      res.status(404).send("Not found");
      return;
    }

    const participantCount = await getParticipantCount(rally.id);
    const date = new Date(rally.scheduledTime).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const time = new Date(rally.scheduledTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const title = `${rally.groupName} — Rally`;
    const cta = rally.callToAction || "Vote on what to do";
    const joinedText = participantCount > 0
      ? `${participantCount} ${participantCount === 1 ? "person" : "people"} joined`
      : "Be the first to join";
    const description = `${cta} | ${date} at ${time} | ${joinedText}`;
    const locationText = rally.location ? ` in ${rally.location}` : "";
    const fullDescription = `${description}${locationText}`;
    const url = `${config.clientUrl}/${hexId}`;

    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${fullDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Rally" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${fullDescription}" />
  <meta name="description" content="${fullDescription}" />
</head>
<body>
  <p>Redirecting...</p>
  <script>window.location.href="${url}";</script>
</body>
</html>`);
  } catch {
    res.redirect(`${config.clientUrl}/${hexId}`);
  }
});

export default router;
