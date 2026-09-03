const minutesPerHour = 60;
const minutesInDay = 1440;

export const generateTimeLimitDisplay = (
  timeMinutes: number | undefined | null,
  noLimitTranslation: string,
  minutesTranslation: string,
  hoursTranslation: string,
  hourTranslation: string,
): string => {
  if (timeMinutes == null) {
    return noLimitTranslation;
  }

  const hours = Math.floor(timeMinutes / minutesPerHour);
  const minutes = timeMinutes % minutesPerHour;
  let response = "";

  if (hours > 0) {
    response += `${hours} ${hours > 1 ? hoursTranslation : hourTranslation}`;
  }

  if (minutes > 0 || hours === 0) {
    if (response) {
      response += " ";
    }
    response += `${minutes} ${minutesTranslation}`;
  }

  return response;
};

export const generateAllowedTimeAmountOptions = (
  noLimitTranslation: string,
  minutesTranslation: string,
  hoursTranslation: string,
  hourTranslation: string,
): {
  key: string;
  value: number;
  label: string;
}[] => {
  const entries: {
    key: string;
    value: number;
    label: string;
  }[] = [];
  const totalHours = 24;
  const increment = 15;

  entries.push({
    key: "NoLimit",
    value: minutesInDay,
    label: noLimitTranslation,
  });

  const totalMinutesInDay = totalHours * minutesPerHour;

  for (let minute = 15; minute < totalMinutesInDay; minute += increment) {
    const key = generateTimeLimitDisplay(
      minute,
      noLimitTranslation,
      minutesTranslation,
      hoursTranslation,
      hourTranslation,
    );
    const value = minute;
    const label = key;
    entries.push({ key, value, label });
  }

  return entries;
};
