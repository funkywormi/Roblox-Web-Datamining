/** The ODP parent-mode agreement screen. */

import { useCallback, type ComponentProps, type JSX, type ReactNode } from "react";
import {
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemLeadingAccessorySpacer,
  ListItemLeadingIcon,
} from "@rbx/foundation-ui";

import { asText } from "../../utils/nodeDetails";
import type { NodeProps } from "../../types";

type AgreementBullet = {
  icon?: string;
  title: string;
  description?: string;
};

const BUILDER_ICONS: Record<string, ComponentProps<typeof ListItemLeadingIcon>["name"]> = {
  Tilt: "icon-regular-tilt",
  ShieldCheck: "icon-regular-shield-check",
};

const ANCHOR = /<a\s+href=(?:"([^"]*)"|'([^']*)')\s*>(.*?)<\/a>/gi;

function asBullets(input: unknown): AgreementBullet[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const bullets: AgreementBullet[] = [];
  const items: unknown[] = input;
  for (const item of items) {
    if (typeof item !== "object" || item === null || !("title" in item)) {
      continue;
    }
    const title = asText(item.title);
    if (title === undefined) {
      continue;
    }
    bullets.push({
      title,
      icon: "icon" in item ? asText(item.icon) : undefined,
      description: "description" in item ? asText(item.description) : undefined,
    });
  }
  return bullets;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function decodeEntities(value: string): string {
  if (typeof document === "undefined") {
    return value;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

/** Renders the server's intentionally small legal-copy markup without injecting raw HTML. */
function LegalText({ text }: { text: string }): JSX.Element {
  const content: ReactNode[] = [];
  let index = 0;
  let lastIndex = 0;

  for (const match of text.matchAll(ANCHOR)) {
    const [anchor] = match;
    const start = match.index;
    if (start > lastIndex) {
      content.push(decodeEntities(text.slice(lastIndex, start)));
    }

    const href = match.at(1) ?? match.at(2) ?? "";
    const linkLabel = decodeEntities(match.at(3) ?? "");
    content.push(
      isHttpUrl(href) ? (
        <Link
          key={`link-${index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          variant="Inline"
          underline="always"
          isExternal={false}
        >
          {linkLabel}
        </Link>
      ) : (
        <span key={`text-${index}`}>{linkLabel}</span>
      ),
    );
    index += 1;
    lastIndex = start + anchor.length;
  }

  if (lastIndex < text.length) {
    content.push(decodeEntities(text.slice(lastIndex)));
  }

  return (
    <p
      className="text-body-small content-default margin-none"
      data-testid="amp-v2-wizard-agreement-legal-text"
    >
      {content}
    </p>
  );
}

function BulletLeading({ bullet }: { bullet: AgreementBullet }): JSX.Element | null {
  const icon = bullet.icon ? BUILDER_ICONS[bullet.icon] : undefined;
  if (icon) {
    return (
      <ListItemLeadingAccessorySpacer>
        <ListItemLeadingIcon name={icon} className="content-emphasis" />
      </ListItemLeadingAccessorySpacer>
    );
  }
  if (bullet.icon) {
    return (
      <ListItemLeadingAccessorySpacer>
        <img src={bullet.icon} alt="" className="height-600 width-600 [object-fit:contain]" />
      </ListItemLeadingAccessorySpacer>
    );
  }
  return null;
}

function Bullet({ bullet }: { bullet: AgreementBullet }): JSX.Element {
  return (
    <ListItem
      isContained
      size="Large"
      divider="None"
      title={bullet.title}
      description={bullet.description}
      leading={<BulletLeading bullet={bullet} />}
    />
  );
}

export function UserAgreementNode({ props, report }: NodeProps): JSX.Element {
  const headerTitle = asText(props.headerTitle);
  const title = asText(props.title) ?? "";
  const description = asText(props.description);
  const continueLabel = asText(props.continueLabel) ?? "";
  const legalText = asText(props.legalText);
  const bullets = asBullets(props.bullets);
  const onContinue = useCallback(() => {
    report("Continue");
  }, [report]);
  const onBack = useCallback(() => {
    report("Back");
  }, [report]);

  return (
    <div className="gap-large flex flex-col" data-testid="amp-v2-wizard-user-agreement">
      <div className="flex items-center">
        <IconButton
          icon="icon-regular-chevron-large-left"
          ariaLabel="Back"
          variant="Utility"
          size="Small"
          onClick={onBack}
        />
        {headerTitle ? (
          <span className="text-title-medium content-emphasis fill text-align-x-center">
            {headerTitle}
          </span>
        ) : null}
        <div className="width-800" aria-hidden />
      </div>
      <div className="gap-xlarge flex flex-col">
        <div className="gap-none flex flex-col" data-testid="amp-v2-wizard-agreement-intro">
          <h2 className="text-heading-medium content-emphasis margin-none">{title}</h2>
          {description ? (
            <p className="text-body-large content-default margin-none">{description}</p>
          ) : null}
        </div>
        {bullets.length > 0 ? (
          <List className="flex flex-col gap-large">
            {bullets.map(bullet => (
              <Bullet
                key={`${bullet.icon ?? ""}-${bullet.title}-${bullet.description ?? ""}`}
                bullet={bullet}
              />
            ))}
          </List>
        ) : null}
      </div>
      <div className="gap-small flex flex-col">
        <Button variant="Emphasis" size="Medium" className="width-full" onClick={onContinue}>
          {continueLabel}
        </Button>
        {legalText ? <LegalText text={legalText} /> : null}
      </div>
    </div>
  );
}
