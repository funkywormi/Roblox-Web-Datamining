import { ReportsResponse } from "../types/api";

/**
 * Fetches the user's submitted report list.
 * TODO: @andrewxu This is a placeholder, implement the actual endpoint.
 */
export const useReports = () => {
  const response: ReportsResponse = {
    inboxPageHeader: "Your reports",
    reports: [
      {
        id: "1",
        reportPageHeader: "Report details",
        title: "br****",
        metadata: "Voice chat",
        description: "Jan 26, 2026",
        details: {
          title: "br****",
          description: "Chat message",
          activities: [
            {
              id: "1",
              title: "We received your report",
              metadata: "January 24, 2025",
              description: "Thank you for helping us keep our community safe.",
            },
            {
              id: "2",
              title: "We warned br****",
              metadata: "January 25, 2025",
              description:
                "We reviewed your report and found that br**** broke a rule in our Community Standards.",
            },
          ],
          educationSection: {
            title: "What we consider bullying?",
            items: [
              {
                type: "text",
                text: "We act on language or behavior meant to hurt, scare, or humiliate a specific person.",
              },
              {
                type: "bulletList",
                text: "For example:",
                bulletList: [
                  "Personal attacks based on someone's identity",
                  "Mocking, insulting, or threatening another player",
                  "Sharing someone’s private info to harm them",
                  "Encouraging others to pile on a specific person",
                ],
              },
              {
                type: "link",
                text: "View our Community Standards",
                href: "https://about.roblox.com/community-standards",
              },
            ],
          },
        },
      },
      {
        id: "2",
        reportPageHeader: "Report details",
        title: "ch****",
        metadata: "Chat message",
        description: "Jan 25, 2026",
        details: {
          title: "ch****",
          description: "Chat message",
          activities: [
            {
              id: "1",
              title: "We received your report",
              metadata: "January 23, 2026",
              description: "Thank you for helping us keep our community safe.",
            },
            {
              id: "2",
              title: "We warned ch****",
              metadata: "January 24, 2026",
              description:
                "We reviewed your report and found that ch**** broke a rule in our Community Standards.",
            },
          ],
        },
      },
      {
        id: "3",
        reportPageHeader: "Report details",
        title: "99 Nights in the Forest",
        metadata: "Game",
        description: "Jan 25, 2026",
        details: {
          title: "99 Nights in the Forest",
          description: "Game",
          activities: [
            {
              id: "1",
              title: "We received your report",
              metadata: "January 23, 2026",
              description: "Thank you for helping us keep our community safe.",
            },
            {
              id: "2",
              title: "We reviewed 99 Nights in the Forest",
              metadata: "January 24, 2026",
              description:
                "We reviewed your report and did not find a violation of our Community Standards.",
            },
          ],
        },
      },
      {
        id: "4",
        reportPageHeader: "Report details",
        title: "Grow a Garden",
        metadata: "Item",
        description: "Jan 20, 2026",
        details: {
          title: "Grow a Garden",
          description: "Item",
          activities: [
            {
              id: "1",
              title: "We received your report",
              metadata: "January 18, 2026",
              description: "Thank you for helping us keep our community safe.",
            },
            {
              id: "2",
              title: "We removed Grow a Garden",
              metadata: "January 19, 2026",
              description:
                "We reviewed your report and found that this item broke a rule in our Community Standards.",
            },
          ],
        },
      },
      {
        id: "5",
        reportPageHeader: "Report details",
        title: "bi*****",
        metadata: "Voice chat",
        description: "Oct 20, 2025",
        details: {
          title: "bi*****",
          description: "Voice chat",
          activities: [
            {
              id: "1",
              title: "We received your report",
              metadata: "October 18, 2025",
              description: "Thank you for helping us keep our community safe.",
            },
            {
              id: "2",
              title: "We warned bi*****",
              metadata: "October 19, 2025",
              description:
                "We reviewed your report and found that bi***** broke a rule in our Community Standards.",
            },
          ],
        },
      },
      {
        id: "6",
        reportPageHeader: "Report details",
        title: "ch****",
        metadata: "Wall post",
        description: "Sep 13, 2025",
        details: {
          title: "ch****",
          description: "Wall post",
          activities: [
            {
              id: "1",
              title: "We received your report",
              metadata: "September 11, 2025",
              description: "Thank you for helping us keep our community safe.",
            },
            {
              id: "2",
              title: "We removed the post from ch****",
              metadata: "September 12, 2025",
              description:
                "We reviewed your report and found that this post broke a rule in our Community Standards.",
            },
          ],
        },
      },
    ],
  };

  return response;
};
