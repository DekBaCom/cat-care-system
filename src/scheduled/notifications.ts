import type { Env } from '../types';
import { NotificationService } from '../services/notificationService';

export async function handleScheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  ctx.waitUntil((async () => {
    try {
      // Pre-create 7-day / 1-day / same-day vaccine notifications (runs every hour)
      await NotificationService.checkVaccinationsDue(env);

      // Daily medication reminders at 9am UTC+7 (02:00 UTC)
      const hour = new Date().getUTCHours();
      if (hour === 2) {
        await NotificationService.checkMedicationsDue(env);
      }

      // Send all pending notifications that are due now
      await NotificationService.sendDueNotifications(env);
    } catch (error) { console.error('[Scheduler]', error); }
  })());
}
