"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreak = getStreak;
exports.updateStreak = updateStreak;
const database_1 = __importDefault(require("../config/database"));
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function daysBetween(a, b) {
    const msPerDay = 86400000;
    return Math.floor((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay);
}
async function getStreak(userId) {
    let streak = await database_1.default.streakData.findUnique({
        where: { userId },
    });
    if (!streak) {
        streak = await database_1.default.streakData.create({
            data: { userId },
        });
    }
    // Calculate week activity (last 7 days)
    const weekActivity = await getWeekActivity(userId);
    return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        totalPosts: streak.totalPosts,
        lastPostDate: streak.lastPostDate
            ? streak.lastPostDate.toISOString()
            : null,
        weekActivity,
    };
}
async function updateStreak(userId) {
    const today = startOfDay(new Date());
    let streak = await database_1.default.streakData.findUnique({
        where: { userId },
    });
    if (!streak) {
        await database_1.default.streakData.create({
            data: {
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastPostDate: today,
                totalPosts: 1,
            },
        });
        return;
    }
    const lastPost = streak.lastPostDate
        ? startOfDay(streak.lastPostDate)
        : null;
    let newCurrentStreak = streak.currentStreak;
    if (!lastPost) {
        // First post ever
        newCurrentStreak = 1;
    }
    else {
        const diff = daysBetween(lastPost, today);
        if (diff === 0) {
            // Already posted today — streak stays the same, just increment totalPosts
            newCurrentStreak = streak.currentStreak;
        }
        else if (diff === 1) {
            // Consecutive day
            newCurrentStreak = streak.currentStreak + 1;
        }
        else {
            // Streak broken
            newCurrentStreak = 1;
        }
    }
    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
    await database_1.default.streakData.update({
        where: { userId },
        data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastPostDate: today,
            totalPosts: { increment: 1 },
        },
    });
}
async function getWeekActivity(userId) {
    const today = startOfDay(new Date());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const posts = await database_1.default.gratitudePost.findMany({
        where: {
            authorId: userId,
            createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
    });
    const postDays = new Set(posts.map((p) => startOfDay(p.createdAt).toISOString()));
    const activity = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(sevenDaysAgo);
        day.setDate(day.getDate() + i);
        activity.push(postDays.has(startOfDay(day).toISOString()));
    }
    return activity;
}
//# sourceMappingURL=streakService.js.map