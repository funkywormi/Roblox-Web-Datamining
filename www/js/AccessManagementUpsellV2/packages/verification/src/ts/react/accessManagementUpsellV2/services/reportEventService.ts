import * as eventStreamService from '@rbx/core-scripts/event-stream';
import { ReportEvent, Recourse } from '../enums';

const reportEvent = (
  event: ReportEvent,
  context: Recourse | null,
  eventParams: Record<string, string>
): void => {
  eventStreamService.sendEventWithTarget(event, context as Recourse, eventParams);
};

export default reportEvent;
