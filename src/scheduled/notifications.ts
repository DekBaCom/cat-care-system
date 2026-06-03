import type { Env } from '../types';
import { NotificationService } from '../services/notificationService';

export async function handleScheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  ctx.waitUntil((async () => {
    try {
      // Pre-create upcoming vaccine and deworming notifications (runs every hour)
      await NotificationService.checkVaccinationsDue(env);
      await NotificationService.checkDewormingsDue(env);

      // Daily checks at 9am UTC+7 (02:00 UTC)
      const hour = new Date().getUTCHours();
      if (hour === 2) {
        await NotificationService.checkMedicationsDue(env);
        await NotificationService.checkOverdueVaccinations(env);
        await NotificationService.checkOverdueDewormings(env);
      }

      // Send all pending notifications that are due now
      await NotificationService.sendDueNotifications(env);
    } catch (error) { console.error('[Scheduler]', error); }
  })());
}
