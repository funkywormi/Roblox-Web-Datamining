import React from "react";
import { Chip, DialogBody, DialogTitle, List, ListItem } from "@rbx/foundation-ui";
import { buildDelaySummaryEntry } from "../../constants/delaySummary";
import { ModalFragmentProps } from "../../constants/types";
import useSessionManagementContext from "../../hooks/useSessionManagementContext";

const ModalSecurityDelays: React.FC<ModalFragmentProps> = () => {
  const {
    state: { selectedSession, resources },
  } = useSessionManagementContext();

  const delays = selectedSession?.delayLabels ?? [];
  const entries = delays.map(delay => buildDelaySummaryEntry(resources, delay));
  const iconForChip = (status: string) => {
    if (status === resources.Label.Delay.Status.Completed) {
      return undefined;
    }
    return "icon-filled-clock";
  };

  return (
    <DialogBody>
      <DialogTitle>{resources.Label.SecurityDelays}</DialogTitle>
      <List>
        {entries.map((entry, index) => (
          <ListItem
            key={entry.label}
            title={entry.label}
            description={entry.startedAt}
            divider={index < entries.length - 1 ? "Full" : "None"}
            isContained
            trailing={
              <Chip
                leadingIconName={iconForChip(entry.status)}
                as="button"
                isChecked={false}
                size="Small"
                text={entry.status}
                variant="Standard"
              />
            }
          />
        ))}
      </List>
    </DialogBody>
  );
};

export default ModalSecurityDelays;
