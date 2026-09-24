/** The ODP parent-mode agreement screen. */

import { useCallback, type ComponentProps, type JSX } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemLeadingAccessorySpacer,
  ListItemLeadingIcon,
} from "@rbx/foundation-ui";

import { FullPageChrome, FULL_PAGE_CTA_INSET_CLASS } from "../FullPageChrome";
import { renderAnchoredCopy } from "../../utils/anchoredCopy";
import { asText } from "../../utils/nodeDetails";
import type { NodeComponent, NodeProps } from "../../types";

type AgreementBullet = {
  icon?: string;
  title: string;
  description?: string;
};

const BUILDER_ICONS: Record<string, ComponentProps<typeof ListItemLeadingIcon>["name"]> = {
  Tilt: "icon-regular-tilt",
  ShieldCheck: "icon-regular-shield-check",
};

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

export const UserAgreementNode: NodeComponent = ({
  props,
  report,
  transitions,
}: NodeProps): JSX.Element => {
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

  // Back is transition-driven: the server declares a `Back` transition only when there is an earlier
  // screen to return to, so the header chevron appears exactly then.
  const hasBack = transitions?.Back != null;

  return (
    <FullPageChrome title={headerTitle} onBack={hasBack ? onBack : undefined}>
      <div className="gap-large flex grow flex-col" data-testid="amp-v2-wizard-user-agreement">
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
        <div
          className={`gap-small flex flex-col [margin-top:auto] ${FULL_PAGE_CTA_INSET_CLASS}`}
          data-testid="amp-v2-wizard-full-page-cta-stack"
        >
          <Button variant="Emphasis" size="Medium" className="width-full" onClick={onContinue}>
            {continueLabel}
          </Button>
          {legalText ? (
            <p
              className="text-body-small content-default margin-none"
              data-testid="amp-v2-wizard-agreement-legal-text"
            >
              {renderAnchoredCopy(legalText)}
            </p>
          ) : null}
        </div>
      </div>
    </FullPageChrome>
  );
};

// Renders its own full-page surface (FullPageChrome): the host must not add a modal overlay, nor a
// loading spinner that would mis-position against this fixed, out-of-flow node.
UserAgreementNode.ownsOverlay = true;
UserAgreementNode.ownsLoadingState = true;
