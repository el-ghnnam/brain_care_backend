const GardenState = require('../models/GardenState');

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const getDayStart = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const STREAK_BONUS_THRESHOLD = 7;
const STREAK_BONUS_POINTS = 25;

/**
 * @desc    Get or create garden state for a patient
 * @route   GET /api/v1/gamification/:patientId
 * @access  Public (Should be protected in production)
 */
const getGardenState = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (req.user.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot access another user\'s garden' });
    }

    // Try to find the existing garden state
    let gardenState = await GardenState.findOne({ patientId });

    // If it doesn't exist, create a new one (Initialization)
    if (!gardenState) {
      gardenState = await GardenState.create({ patientId });
    }

    // Calculate days since last interaction (Dormancy check)
    // We check this for informational purposes or to trigger encouragement messages,
    // but crucially we DO NOT penalize the points to remain "Dormancy Safe".
    const lastInteraction = new Date(gardenState.lastInteractionTimestamp);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastInteraction);
    const daysSinceLastInteraction = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      data: {
        ...gardenState.toObject(),
        daysSinceLastInteraction // Return computed field
      }
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

/**
 * @desc    Award points to a patient's garden
 * @route   POST /api/v1/gamification/award
 * @access  Public (Should be protected in production)
 */
const awardPoints = async (req, res, next) => {
  try {
    const { patientId, actionType } = req.body;

    if (!patientId || !actionType) {
      return res.status(400).json({ success: false, message: 'patientId and actionType are required' });
    }

    if (req.user.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot modify another user\'s garden' });
    }

    let gardenState = await GardenState.findOne({ patientId });
    if (!gardenState) {
      gardenState = await GardenState.create({ patientId });
    }

    console.log('[DEBUG] lastInteractionTimestamp:', gardenState.lastInteractionTimestamp);

    // Smart Recovery Algorithm — 3-level boost for users in their last 15 days (days 45-60)
    const daysPassed = Math.floor((Date.now() - gardenState.createdAt) / (1000 * 60 * 60 * 24));
    const pointsBefore = gardenState.waterPoints + gardenState.sunlightPoints;
    const pointsMissing = 1000 - pointsBefore;

    let requiredStreak = STREAK_BONUS_THRESHOLD;
    let pointsMultiplier = 1;
    let recoveryMessage = null;

    if (daysPassed >= 45 && pointsMissing > 0) {
      if (pointsMissing < 325) {
        recoveryMessage = {
          ar: "أنت على بُعد خطوات من اكتمال حديقتك، التزامك في الـ 15 يوماً القادمة يضمن لك الهدف!",
          en: "You are just steps away from completing your garden! Your commitment over the next 15 days ensures your goal."
        };
      } else if (pointsMissing <= 475) {
        requiredStreak = 3;
      } else {
        requiredStreak = 3;
        pointsMultiplier = 1.5;
      }
    }

    // Daily action dedup — prevent duplicate points for same action on same day
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!gardenState.dailyActions || gardenState.dailyActions.date !== todayStr) {
      gardenState.dailyActions = { date: todayStr, types: [] };
      gardenState.markModified('dailyActions');
    }

    if (gardenState.dailyActions.types.includes(actionType.toLowerCase())) {
      return res.status(200).json({
        success: true,
        data: gardenState,
        pointsAwarded: 0,
        message: `Already awarded for ${actionType} today`
      });
    }

    const isDevMode = false;

    // Streak calculation
    const last = new Date(gardenState.lastInteractionTimestamp);
    const lastDay = getDayStart(last);
    const today = getDayStart(now);
    const dayDiff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    let streakBonus = 0;

    if (gardenState.lastInteractionTimestamp === null) {
      // Fresh start after reset — initialize streak to 1
      console.log('[DEBUG] Entered null-branch — setting streak to 1');
      gardenState.currentStreak = 1;
    } else if (isDevMode) {
      // Dev bypass: always act as 1-day difference
      gardenState.currentStreak += 1;
    } else if (isSameDay(last, now)) {
      // Same day — no streak increment, just award points below
    } else if (dayDiff === 1) {
      gardenState.currentStreak += 1;
    } else {
      // gap > 1 day — reset streak
      gardenState.currentStreak = 1;
    }

    if (gardenState.currentStreak > 0 && gardenState.currentStreak % requiredStreak === 0) {
      streakBonus = STREAK_BONUS_POINTS;
    }

    // Point rewards — strictly one pool per action
    let waterReward = 0;
    let sunlightReward = 0;

    if (actionType.toLowerCase() === 'medication') {
      sunlightReward = 10;
    } else if (actionType.toLowerCase() === 'symptom') {
      waterReward = 5;
    } else if (actionType.toLowerCase() === 'chat') {
      waterReward = 5;
    }

    // Apply recovery multiplier
    waterReward = Math.round(waterReward * pointsMultiplier);
    sunlightReward = Math.round(sunlightReward * pointsMultiplier);

    const pointsAwarded = actionType.toLowerCase() === 'medication'
      ? sunlightReward
      : waterReward;

    gardenState.sunlightPoints += sunlightReward;
    gardenState.waterPoints += waterReward;

    // Apply streak bonus equally to both pools
    if (streakBonus > 0) {
      gardenState.waterPoints += streakBonus;
      gardenState.sunlightPoints += streakBonus;
    }

    gardenState.lastInteractionTimestamp = now;

    gardenState.dailyActions.types.push(actionType.toLowerCase());
    gardenState.markModified('dailyActions');

    console.log('[DEBUG] actionType:', actionType, '| waterReward:', waterReward, '| sunlightReward:', sunlightReward, '| pointsAwarded:', pointsAwarded, '| streakBonus:', streakBonus);

    // Stage evolution: based on total combined points
    const totalPoints = gardenState.sunlightPoints + gardenState.waterPoints;
    gardenState.currentStage = Math.min(10, Math.floor(totalPoints / 100));

    await gardenState.save();

    res.status(200).json({
      success: true,
      data: gardenState,
      pointsAwarded,
      ...(recoveryMessage && { recoveryMessage }),
      message: streakBonus > 0
        ? `Awarded ${sunlightReward > 0 ? sunlightReward + ' sunlight' : ''}${waterReward > 0 ? waterReward + ' water' : ''} + ${streakBonus} streak bonus (Day ${gardenState.currentStreak})`
        : `Awarded ${sunlightReward > 0 ? sunlightReward + ' sunlight' : ''}${waterReward > 0 ? waterReward + ' water' : ''} (Day ${gardenState.currentStreak} streak)`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset a patient's garden state
 * @route   PUT /api/v1/gamification/reset/:patientId
 * @access  Public (Should be protected in production)
 */
const resetGardenState = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (req.user.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot reset another user\'s garden' });
    }

    const now = new Date();
    const gardenState = await GardenState.findOneAndUpdate(
      { patientId },
      {
        $set: {
          currentStage: 0,
          waterPoints: 0,
          sunlightPoints: 0,
          currentStreak: 0,
          lastInteractionTimestamp: null,
          createdAt: now,
          updatedAt: now,
          dailyActions: { date: null, types: [] }
        }
      },
      { overwriteImmutable: true, new: true, runValidators: true }
    );

    if (!gardenState) {
      return res.status(404).json({ success: false, message: 'Patient garden state not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Garden reset successfully',
      data: gardenState
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGardenState,
  awardPoints,
  resetGardenState
};
