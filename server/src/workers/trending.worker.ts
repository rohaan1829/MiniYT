import { trendingService } from '../services/trending.service';
import { logger } from '../utils/logger';

/**
 * Trending Worker
 * Runs periodic jobs to maintain trending scores and view snapshots
 */

const FIFTEEN_MINUTES = 15 * 60 * 1000;

let snapshotIntervalId: NodeJS.Timeout | null = null;
let trendingIntervalId: NodeJS.Timeout | null = null;

async function takeViewSnapshotsJob() {
    logger.info('📸 Taking view snapshots...');
    try {
        await trendingService.takeViewSnapshots();
        logger.info('✅ View snapshots completed');
    } catch (error) {
        logger.error('❌ View snapshot job failed:', error);
    }
}

async function updateTrendingScoresJob() {
    logger.info('🔥 Updating trending scores...');
    try {
        await trendingService.updateAllTrendingScores();
        logger.info('✅ Trending scores updated');
    } catch (error) {
        logger.error('❌ Trending score update failed:', error);
    }
}

export function startTrendingWorker() {
    // Take initial snapshot after 30 seconds
    setTimeout(takeViewSnapshotsJob, 30 * 1000);

    // Update initial scores after 2 minutes
    setTimeout(updateTrendingScoresJob, 2 * 60 * 1000);

    // Schedule recurring jobs
    snapshotIntervalId = setInterval(takeViewSnapshotsJob, FIFTEEN_MINUTES);
    trendingIntervalId = setInterval(updateTrendingScoresJob, FIFTEEN_MINUTES);

    logger.info('🔥 Trending worker initialized - Jobs scheduled every 15 minutes');
}

export function stopTrendingWorker() {
    if (snapshotIntervalId) {
        clearInterval(snapshotIntervalId);
        snapshotIntervalId = null;
    }
    if (trendingIntervalId) {
        clearInterval(trendingIntervalId);
        trendingIntervalId = null;
    }
    logger.info('Trending worker stopped');
}

