import React from "react";
import { About } from "@rbx/profile-platform";
import {
  Description,
  SocialLinks,
  NameHistory,
  JoinDate,
} from "../components/About/Sections/index";
import { SectionKeys } from "../constants/enums";

const SECTIONS_MAP: Record<string, React.FC<About>> = {
  [SectionKeys.Description]: Description,
  [SectionKeys.SocialLinks]: SocialLinks,
  [SectionKeys.NameHistory]: NameHistory,
  [SectionKeys.JoinDateTime]: JoinDate,
};

const DEFAULT_SECTION_ORDERING = [
  SectionKeys.Description,
  SectionKeys.SocialLinks,
  SectionKeys.NameHistory,
  SectionKeys.JoinDateTime,
];

export default function useAboutSectionsFromData(
  aboutDetails: About | null | undefined,
): React.ReactElement[] {
  const ordering = DEFAULT_SECTION_ORDERING;
  const sections: React.ReactElement[] = [];

  if (!aboutDetails) {
    return sections;
  }

  for (const sectionKey of ordering) {
    const SectionComponent = SECTIONS_MAP[sectionKey];

    if (SectionComponent) {
      sections.push(<SectionComponent key={sectionKey} {...aboutDetails} />);
    }
  }

  return sections;
}
