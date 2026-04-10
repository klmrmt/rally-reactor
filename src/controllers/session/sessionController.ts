import { Request, Response } from "express";
import { getRallyByRallyHexId, getRallyById, updateRallyStatus, setChosenRecommendation } from "../../models/RallyModel";
import { createParticipant, getParticipantsByRallyId, getParticipantCount, getParticipantByUserAndRally, getParticipantPhonesForRally, getParticipantById } from "../../models/ParticipantModel";
import { createConstraintVote, getVoteCountByRallyId, getAggregatedVotes, getVoteByParticipantId } from "../../models/ConstraintVoteModel";
import { getRecommendationsByRallyId, getRecommendationById } from "../../models/RecommendationModel";
import { createFinalVote } from "../../models/FinalVoteModel";
import { createFeedback } from "../../models/FeedbackModel";
import { generateParticipantToken } from "../../auth/participantToken";
import { ParticipantRequest } from "../../middlewares/authenticateParticipant";
import { AuthenticatedRequest } from "../../auth/types";
import { RequestResponse } from "../../utils/apiResponse";
import { JoinRallyType, ConstraintVoteType, FinalVoteType, FeedbackType, SelectWinnerType } from "../../schemas/sessionSchemas";
import { generateRecommendationsForRally } from "../../ai/pipeline/recommendationPipeline";
import { getUserFullById, getUserById } from "../../models/UserModel";
import { trackEvent } from "../../utils/analytics";
import { sendLocationDecidedNotification } from "../../services/feedbackReminder";
import { decryptPhoneNumber } from "../../utils/security";
import { config } from "../../config/config";

export const joinRally = async (
  req: AuthenticatedRequest & { body: JoinRallyType },
  res: Response
): Promise<void> => {
  const { hexId } = req.params;
  const userId = req.user!.user_id;
  const bodyName = req.body.displayName;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    const userExists = await getUserById(userId);
    if (!userExists) {
      RequestResponse(res, 403, false, "User account not found — please log in again");
      return;
    }

    const existingParticipant = await getParticipantByUserAndRally(rally.id, userId);

    if (existingParticipant) {
      const token = generateParticipantToken(
        existingParticipant.id,
        rally.id,
        existingParticipant.displayName
      );

      const existingVote = await getVoteByParticipantId(rally.id, existingParticipant.id);

      RequestResponse(res, 200, true, "Already joined this rally", {
        participant: existingParticipant,
        token,
        alreadyJoined: true,
        hasVoted: !!existingVote,
        rally: {
          hexId: rally.hexId,
          groupName: rally.groupName,
          scheduledTime: rally.scheduledTime,
          callToAction: rally.callToAction,
          status: rally.status,
          location: rally.location,
          votingClosesAt: rally.votingClosesAt,
        },
      });
      return;
    }

    let displayName = bodyName;
    if (!displayName) {
      const user = await getUserFullById(userId);
      displayName = user?.displayName || "Anonymous";
    }

    const participant = await createParticipant(rally.id, displayName, userId);
    const token = generateParticipantToken(
      participant.id,
      rally.id,
      participant.displayName
    );

    RequestResponse(res, 201, true, "Joined rally successfully", {
      participant,
      token,
      alreadyJoined: false,
      hasVoted: false,
      rally: {
        hexId: rally.hexId,
        groupName: rally.groupName,
        scheduledTime: rally.scheduledTime,
        callToAction: rally.callToAction,
        status: rally.status,
        location: rally.location,
        votingClosesAt: rally.votingClosesAt,
      },
    });

    trackEvent("session.joined", {
      rallyId: rally.id,
      hexId: rally.hexId,
      participantId: participant.id,
      userId,
    });
  } catch (err: any) {
    if (err.code === "23505") {
      RequestResponse(res, 409, false, "Display name already taken in this rally");
      return;
    }
    if (err.code === "23503") {
      RequestResponse(res, 403, false, "User account not found — please log in again");
      return;
    }
    console.error("Error joining rally:", err);
    RequestResponse(res, 500, false, "Failed to join rally");
  }
};

export const getRallyInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    const participantCount = await getParticipantCount(rally.id);

    RequestResponse(res, 200, true, "Rally info", {
      hexId: rally.hexId,
      groupName: rally.groupName,
      scheduledTime: rally.scheduledTime,
      callToAction: rally.callToAction,
      status: rally.status,
      location: rally.location,
      votingClosesAt: rally.votingClosesAt,
      participantCount,
    });
  } catch (err) {
    console.error("Error fetching rally info:", err);
    RequestResponse(res, 500, false, "Something went wrong");
  }
};

export const submitConstraintVote = async (
  req: ParticipantRequest & { body: ConstraintVoteType },
  res: Response
): Promise<void> => {
  const participant = req.participant!;
  const { budget, vibes, distance } = req.body;
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.id !== participant.rallyId) {
      RequestResponse(res, 403, false, "Token does not match this rally");
      return;
    }

    if (rally.status !== "voting") {
      RequestResponse(res, 400, false, "Voting is no longer open for this rally");
      return;
    }

    const vote = await createConstraintVote(
      rally.id,
      participant.participantId,
      budget,
      vibes,
      distance
    );

    trackEvent("session.voted", {
      rallyId: rally.id,
      hexId,
      participantId: participant.participantId,
      budget,
      vibes,
      distance,
    });

    RequestResponse(res, 201, true, "Vote submitted", { vote });
  } catch (err: any) {
    console.error("Error submitting vote:", err);
    if (err.code === "23503") {
      RequestResponse(res, 400, false, "Participant not found — please rejoin the rally");
      return;
    }
    RequestResponse(res, 500, false, "Failed to submit vote");
  }
};

export const getVoteStatus = async (
  req: ParticipantRequest,
  res: Response
): Promise<void> => {
  const participant = req.participant!;
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.id !== participant.rallyId) {
      RequestResponse(res, 403, false, "Token does not match this rally");
      return;
    }

    const voteCount = await getVoteCountByRallyId(rally.id);
    const participantCount = await getParticipantCount(rally.id);
    const participants = await getParticipantsByRallyId(rally.id);
    const myVote = await getVoteByParticipantId(rally.id, participant.participantId);

    const me = await getParticipantById(participant.participantId);
    const isOwner = me?.userId === rally.groupLeaderId;

    RequestResponse(res, 200, true, "Vote status", {
      status: rally.status,
      voteCount,
      participantCount,
      votingClosesAt: rally.votingClosesAt,
      hasVoted: !!myVote,
      isOwner,
      participants: participants.map((p) => ({
        id: p.id,
        displayName: p.displayName,
      })),
    });
  } catch (err) {
    console.error("Error getting vote status:", err);
    RequestResponse(res, 500, false, "Something went wrong");
  }
};

export const closeVoting = async (
  req: ParticipantRequest,
  res: Response
): Promise<void> => {
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.status !== "voting") {
      RequestResponse(res, 400, false, "Voting is already closed");
      return;
    }

    await updateRallyStatus(rally.id, "recommending");

    generateRecommendationsForRally(rally.id).catch((err) => {
      console.error("Background recommendation generation failed:", err);
    });

    RequestResponse(res, 200, true, "Voting closed, generating recommendations");
  } catch (err) {
    console.error("Error closing voting:", err);
    RequestResponse(res, 500, false, "Failed to close voting");
  }
};

export const triggerRecommendations = async (
  req: ParticipantRequest,
  res: Response
): Promise<void> => {
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.status !== "recommending" && rally.status !== "voting") {
      RequestResponse(res, 400, false, "Recommendations already generated");
      return;
    }

    if (rally.status === "voting") {
      await updateRallyStatus(rally.id, "recommending");
    }

    await generateRecommendationsForRally(rally.id);

    const recommendations = await getRecommendationsByRallyId(rally.id);
    RequestResponse(res, 200, true, "Recommendations generated", {
      recommendations,
    });
  } catch (err) {
    console.error("Error generating recommendations:", err);
    RequestResponse(res, 500, false, "Failed to generate recommendations");
  }
};

export const getRecommendations = async (
  req: ParticipantRequest,
  res: Response
): Promise<void> => {
  const participant = req.participant!;
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.id !== participant.rallyId) {
      RequestResponse(res, 403, false, "Token does not match this rally");
      return;
    }

    if (rally.status === "voting") {
      RequestResponse(res, 400, false, "Voting has not closed yet");
      return;
    }

    const recommendations = await getRecommendationsByRallyId(rally.id);
    const participantCount = await getParticipantCount(rally.id);

    const me = await getParticipantById(participant.participantId);
    const isOwner = me?.userId === rally.groupLeaderId;

    trackEvent("session.recs_viewed", {
      rallyId: rally.id,
      hexId,
      participantId: participant.participantId,
      recommendationCount: recommendations.length,
    });

    RequestResponse(res, 200, true, "Recommendations", {
      status: rally.status,
      recommendations,
      participantCount,
      isOwner,
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    RequestResponse(res, 500, false, "Something went wrong");
  }
};

export const submitFinalVote = async (
  req: ParticipantRequest & { body: FinalVoteType },
  res: Response
): Promise<void> => {
  const participant = req.participant!;
  const { hexId } = req.params;
  const { recommendationId } = req.body;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.id !== participant.rallyId) {
      RequestResponse(res, 403, false, "Token does not match this rally");
      return;
    }

    if (rally.status !== "picking") {
      RequestResponse(res, 400, false, "Final voting is not open");
      return;
    }

    const vote = await createFinalVote(
      rally.id,
      participant.participantId,
      recommendationId
    );

    trackEvent("session.picked", {
      rallyId: rally.id,
      hexId,
      participantId: participant.participantId,
      recommendationId,
    });

    RequestResponse(res, 201, true, "Final vote submitted", { vote });
  } catch (err) {
    console.error("Error submitting final vote:", err);
    RequestResponse(res, 500, false, "Failed to submit vote");
  }
};

export const getRallyResult = async (
  req: ParticipantRequest,
  res: Response
): Promise<void> => {
  const participant = req.participant!;
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.id !== participant.rallyId) {
      RequestResponse(res, 403, false, "Token does not match this rally");
      return;
    }

    const recommendations = await getRecommendationsByRallyId(rally.id);

    const winner = rally.chosenRecommendationId
      ? recommendations.find((r) => r.id === rally.chosenRecommendationId) || null
      : null;

    RequestResponse(res, 200, true, "Rally result", {
      status: rally.status,
      winner,
      recommendations,
    });
  } catch (err) {
    console.error("Error fetching result:", err);
    RequestResponse(res, 500, false, "Something went wrong");
  }
};

export const submitFeedback = async (
  req: ParticipantRequest,
  res: Response
): Promise<void> => {
  const participant = req.participant!;
  const { hexId } = req.params;
  const { liked, tags } = req.body as FeedbackType;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.id !== participant.rallyId) {
      RequestResponse(res, 403, false, "Token does not match this rally");
      return;
    }

    if (!rally.chosenRecommendationId) {
      RequestResponse(res, 400, false, "No winner to give feedback on");
      return;
    }

    const feedback = await createFeedback(
      rally.id,
      participant.participantId,
      rally.chosenRecommendationId,
      liked,
      tags
    );

    trackEvent("session.feedback", {
      rallyId: rally.id,
      hexId,
      participantId: participant.participantId,
      liked,
      tags,
    });

    RequestResponse(res, 201, true, "Feedback submitted", { feedback });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    RequestResponse(res, 500, false, "Failed to submit feedback");
  }
};

export const selectWinner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { hexId } = req.params;
  const userId = req.user!.user_id;
  const { recommendationId } = req.body as SelectWinnerType;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.groupLeaderId !== userId) {
      RequestResponse(res, 403, false, "Only the group leader can select the winner");
      return;
    }

    if (rally.status !== "picking") {
      RequestResponse(res, 400, false, "Rally is not in the picking phase");
      return;
    }

    const recommendation = await getRecommendationById(recommendationId);
    if (!recommendation || recommendation.rallyId !== rally.id) {
      RequestResponse(res, 400, false, "Invalid recommendation for this rally");
      return;
    }

    await setChosenRecommendation(rally.id, recommendationId);

    const participants = await getParticipantPhonesForRally(rally.id);
    for (const p of participants) {
      try {
        const participantRecord = await getParticipantById(p.participantId);
        if (participantRecord?.userId === userId) continue;

        const phone = decryptPhoneNumber(p.encryptedPhoneNumber);
        await sendLocationDecidedNotification(
          phone,
          rally.hexId,
          rally.groupName,
          recommendation.name,
          config.clientUrl
        );
      } catch (err) {
        console.error(`Failed to send notification to participant ${p.participantId}:`, err);
      }
    }

    trackEvent("session.winner_selected", {
      rallyId: rally.id,
      hexId,
      userId,
      recommendationId,
      recommendationName: recommendation.name,
    });

    RequestResponse(res, 200, true, "Winner selected", { recommendation });
  } catch (err) {
    console.error("Error selecting winner:", err);
    RequestResponse(res, 500, false, "Failed to select winner");
  }
};
