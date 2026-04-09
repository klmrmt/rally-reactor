import { Router, Request, Response } from "express";
import { generateToken } from "../../auth/jwt/jwt";
import { generateParticipantToken } from "../../auth/participantToken";
import { createUser, getUserIdByPhoneHash } from "../../models/UserModel";
import { createRally, getRallyByRallyHexId, updateRallyStatus } from "../../models/RallyModel";
import { createParticipant } from "../../models/ParticipantModel";
import { createConstraintVote } from "../../models/ConstraintVoteModel";
import { createRecommendationsBatch, getRecommendationsByRallyId } from "../../models/RecommendationModel";
import { createFinalVote, getVoteTallyByRallyId } from "../../models/FinalVoteModel";
import { RequestResponse } from "../../utils/apiResponse";
import { hashPhoneNumber, encryptPhoneNumber } from "../../utils/security";

const router = Router();

const TEST_PHONE = "+15550001111";
const TEST_DISPLAY_NAME = "E2E Tester";

const TEST_USERS = [
  { phone: "+15550001111", name: "E2E Tester" },
  { phone: "+15550002222", name: "Alice" },
  { phone: "+15550003333", name: "Bob" },
  { phone: "+15550004444", name: "Charlie" },
];

const FAKE_RECOMMENDATIONS = [
  {
    name: "The Rusty Tap",
    category: "Bar",
    whyItFits: "Great craft beer selection in a chill atmosphere — perfect for the group's relaxed vibe and moderate budget.",
    distanceLabel: "0.4 mi",
    priceLevel: "$$",
    rating: 4.5,
    imageUrl: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Rusty+Tap",
    mapsUrl: "https://maps.google.com/?q=The+Rusty+Tap",
    latitude: 37.7749,
    longitude: -122.4194,
    source: "test_seed",
  },
  {
    name: "Sakura Ramen House",
    category: "Restaurant",
    whyItFits: "Highly rated ramen spot with a cozy interior. Hits the food vibe with wallet-friendly prices.",
    distanceLabel: "1.2 mi",
    priceLevel: "$",
    rating: 4.7,
    imageUrl: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Sakura+Ramen",
    mapsUrl: "https://maps.google.com/?q=Sakura+Ramen+House",
    latitude: 37.7751,
    longitude: -122.4180,
    source: "test_seed",
  },
  {
    name: "Sunset Lanes",
    category: "Entertainment",
    whyItFits: "Bowling, arcade games, and cheap pitchers. The active crowd will love the competitive energy.",
    distanceLabel: "2.8 mi",
    priceLevel: "$$",
    rating: 4.2,
    imageUrl: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Sunset+Lanes",
    mapsUrl: "https://maps.google.com/?q=Sunset+Lanes",
    latitude: 37.7600,
    longitude: -122.4300,
    source: "test_seed",
  },
  {
    name: "Golden Gate Overlook",
    category: "Outdoors",
    whyItFits: "Free outdoor hangout with stunning bridge views. Bring snacks and enjoy the vibe.",
    distanceLabel: "4.1 mi",
    priceLevel: "$",
    rating: 4.8,
    imageUrl: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=GG+Overlook",
    mapsUrl: "https://maps.google.com/?q=Golden+Gate+Overlook",
    latitude: 37.8024,
    longitude: -122.4756,
    source: "test_seed",
  },
];

const VOTE_PRESETS: Array<{
  budget: "$" | "$$" | "$$$";
  vibes: Array<"chill" | "active" | "drinks" | "food" | "outdoors">;
  distance: "walk" | "short_drive" | "anywhere";
}> = [
  { budget: "$$", vibes: ["drinks", "chill"], distance: "walk" },
  { budget: "$", vibes: ["food", "chill"], distance: "short_drive" },
  { budget: "$$", vibes: ["active", "drinks"], distance: "walk" },
  { budget: "$$$", vibes: ["food", "outdoors"], distance: "anywhere" },
];

async function getOrCreateTestUser(phone: string, displayName: string) {
  const phoneHash = hashPhoneNumber(phone);
  let existing = await getUserIdByPhoneHash(phoneHash);

  if (!existing) {
    const encrypted = encryptPhoneNumber(phone);
    existing = await createUser(phoneHash, encrypted, undefined, undefined, displayName);
  }

  return { userId: existing.user_id, displayName };
}

// ─── Seed a single test user (existing endpoint) ───
router.post("/seed-user", async (_req: Request, res: Response) => {
  try {
    const phoneHash = hashPhoneNumber(TEST_PHONE);
    let existing = await getUserIdByPhoneHash(phoneHash);

    if (!existing) {
      const encrypted = encryptPhoneNumber(TEST_PHONE);
      existing = await createUser(
        phoneHash,
        encrypted,
        undefined,
        undefined,
        TEST_DISPLAY_NAME
      );
    }

    const userId = existing.user_id;
    const token = generateToken(userId);

    RequestResponse(res, 200, true, "Test user seeded", {
      token,
      user: { userId, displayName: TEST_DISPLAY_NAME },
    });
  } catch (err) {
    console.error("[TEST SEED ERROR]", err);
    RequestResponse(res, 500, false, "Failed to seed test user");
  }
});

// ─── Seed multiple test users ───
router.post("/seed-users", async (_req: Request, res: Response) => {
  try {
    const users = await Promise.all(
      TEST_USERS.map(async (u) => {
        const user = await getOrCreateTestUser(u.phone, u.name);
        const token = generateToken(user.userId);
        return { ...user, token };
      })
    );

    RequestResponse(res, 200, true, "Test users seeded", { users });
  } catch (err) {
    console.error("[TEST SEED-USERS ERROR]", err);
    RequestResponse(res, 500, false, "Failed to seed test users");
  }
});

// ─── Run full rally lifecycle in one call ───
router.post("/run-full-lifecycle", async (req: Request, res: Response) => {
  const participantCount = Math.min(Math.max(req.body.participantCount || 3, 2), 4);
  const groupName = req.body.groupName || "Test Hangout";
  const location = req.body.location || "San Francisco, CA";

  try {
    // 1. Create test users
    const users = await Promise.all(
      TEST_USERS.slice(0, participantCount).map((u) =>
        getOrCreateTestUser(u.phone, u.name)
      )
    );

    const leader = users[0];
    const leaderToken = generateToken(leader.userId);

    // 2. Create rally
    const rally = await createRally(
      leader.userId,
      groupName,
      "Let's find something fun to do!",
      new Date(Date.now() + 3 * 60 * 60 * 1000),
      location,
      5,
      37.7749,
      -122.4194,
      60
    );

    // 3. Join all participants
    const participants = await Promise.all(
      users.map((u) => createParticipant(rally.id, u.displayName, u.userId))
    );

    const participantTokens = participants.map((p) =>
      generateParticipantToken(p.id, rally.id, p.displayName)
    );

    // 4. Submit constraint votes
    const votes = await Promise.all(
      participants.map((p, i) =>
        createConstraintVote(
          rally.id,
          p.id,
          VOTE_PRESETS[i].budget,
          VOTE_PRESETS[i].vibes,
          VOTE_PRESETS[i].distance
        )
      )
    );

    // 5. Close voting → recommending
    await updateRallyStatus(rally.id, "recommending");

    // 6. Insert fake recommendations (bypass AI/Google)
    const recommendations = await createRecommendationsBatch(
      rally.id,
      FAKE_RECOMMENDATIONS
    );

    // 7. Move to picking
    await updateRallyStatus(rally.id, "picking");

    // 8. Submit final picks (spread votes, first rec gets majority)
    const picks = await Promise.all(
      participants.map((p, i) => {
        const recIndex = i === 0 || i === 1 ? 0 : i === 2 ? 1 : 2;
        return createFinalVote(rally.id, p.id, recommendations[recIndex].id);
      })
    );

    // 9. Move to decided
    await updateRallyStatus(rally.id, "decided");

    // 10. Get final tally
    const tally = await getVoteTallyByRallyId(rally.id);
    const winner = tally.length > 0
      ? recommendations.find((r) => r.id === tally[0].recommendationId) || null
      : null;

    RequestResponse(res, 200, true, "Full lifecycle completed", {
      rally: {
        id: rally.id,
        hexId: rally.hexId,
        groupName: rally.groupName,
        status: "decided",
      },
      leader: {
        userId: leader.userId,
        displayName: leader.displayName,
        token: leaderToken,
      },
      participants: participants.map((p, i) => ({
        id: p.id,
        displayName: p.displayName,
        token: participantTokens[i],
        vote: VOTE_PRESETS[i],
        pick: recommendations[i === 0 || i === 1 ? 0 : i === 2 ? 1 : 2].name,
      })),
      recommendations: recommendations.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        priceLevel: r.priceLevel,
        rating: r.rating,
      })),
      tally,
      winner: winner
        ? { id: winner.id, name: winner.name, category: winner.category }
        : null,
      urls: {
        join: `/:hexId → /${rally.hexId}`,
        vote: `/${rally.hexId}/vote`,
        waiting: `/${rally.hexId}/waiting`,
        recommendations: `/${rally.hexId}/recommendations`,
        result: `/${rally.hexId}/result`,
      },
    });
  } catch (err) {
    console.error("[TEST LIFECYCLE ERROR]", err);
    RequestResponse(res, 500, false, "Lifecycle test failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// ─── Step-by-step: Create a rally with participants ready to vote ───
router.post("/setup-rally", async (req: Request, res: Response) => {
  const participantCount = Math.min(Math.max(req.body.participantCount || 3, 2), 4);
  const groupName = req.body.groupName || "Test Hangout";
  const location = req.body.location || "San Francisco, CA";

  try {
    const users = await Promise.all(
      TEST_USERS.slice(0, participantCount).map((u) =>
        getOrCreateTestUser(u.phone, u.name)
      )
    );

    const leader = users[0];
    const leaderToken = generateToken(leader.userId);

    const rally = await createRally(
      leader.userId,
      groupName,
      "Let's find something fun to do!",
      new Date(Date.now() + 3 * 60 * 60 * 1000),
      location,
      5,
      37.7749,
      -122.4194,
      60
    );

    const participants = await Promise.all(
      users.map((u) => createParticipant(rally.id, u.displayName, u.userId))
    );

    const participantTokens = participants.map((p) =>
      generateParticipantToken(p.id, rally.id, p.displayName)
    );

    RequestResponse(res, 200, true, "Rally set up — participants can now vote", {
      rally: {
        id: rally.id,
        hexId: rally.hexId,
        groupName: rally.groupName,
        status: "voting",
      },
      leader: { userId: leader.userId, token: leaderToken },
      participants: participants.map((p, i) => ({
        id: p.id,
        displayName: p.displayName,
        token: participantTokens[i],
      })),
    });
  } catch (err) {
    console.error("[TEST SETUP-RALLY ERROR]", err);
    RequestResponse(res, 500, false, "Failed to set up rally");
  }
});

// ─── Seed fake recommendations for a rally (bypass AI) ───
router.post("/seed-recommendations/:hexId", async (req: Request, res: Response) => {
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    const existing = await getRecommendationsByRallyId(rally.id);
    if (existing.length > 0) {
      await updateRallyStatus(rally.id, "picking");
      RequestResponse(res, 200, true, "Recommendations already exist, moved to picking", {
        recommendations: existing,
      });
      return;
    }

    await updateRallyStatus(rally.id, "recommending");
    const recommendations = await createRecommendationsBatch(rally.id, FAKE_RECOMMENDATIONS);
    await updateRallyStatus(rally.id, "picking");

    RequestResponse(res, 200, true, "Fake recommendations seeded", {
      recommendations: recommendations.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        priceLevel: r.priceLevel,
        rating: r.rating,
      })),
    });
  } catch (err) {
    console.error("[TEST SEED-RECS ERROR]", err);
    RequestResponse(res, 500, false, "Failed to seed recommendations");
  }
});

// ─── Advance rally status (for testing transitions) ───
router.post("/advance-status/:hexId", async (req: Request, res: Response) => {
  const { hexId } = req.params;
  const { status } = req.body;

  const validStatuses = ["voting", "recommending", "picking", "decided", "completed"];
  if (!status || !validStatuses.includes(status)) {
    RequestResponse(res, 400, false, `Status must be one of: ${validStatuses.join(", ")}`);
    return;
  }

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    const updated = await updateRallyStatus(rally.id, status);
    RequestResponse(res, 200, true, `Rally status updated to ${status}`, {
      rally: { hexId: updated!.hexId, status: updated!.status },
    });
  } catch (err) {
    console.error("[TEST ADVANCE-STATUS ERROR]", err);
    RequestResponse(res, 500, false, "Failed to update status");
  }
});

export default router;
