import type { Env } from '../types';
import { NotificationService } from '../services/notificationService';

export async function handleScheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  ctx.waitUntil((async () => {
    try {
      await NotificationService.sendDueNotifications(env);
      const hour = new Date().getUTCHours();
      if (hour === 9 || hour === 18) {
        await NotificationService.checkVaccinationsDue(env);
        await NotificationService.checkMedicationsDue(env);
      }
    } catch (error) { console.error('[Scheduler]', error); }
  })());
}
