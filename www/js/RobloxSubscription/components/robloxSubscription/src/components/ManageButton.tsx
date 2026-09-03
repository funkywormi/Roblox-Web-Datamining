import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import { useCallback, useState, useMemo } from "react";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v1";
import type { FC } from "react";

export type ManageButtonProps = {
  robloxSubscriptionProduct: SubscriptionProductInfo;
};

const ManageButton: FC<ManageButtonProps> = ({ robloxSubscriptionProduct }) => {
  const { translate } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const onClick = useCallback(() => {
    setIsLoading(true);
  }, []);

  const subscriptionsManagementUrl = useMemo(() => {
    const url = new URL("/my/account#!/subscriptions", window.location.origin);
    url.searchParams.append("id", robloxSubscriptionProduct.productKey.id);
    url.searchParams.append("type", robloxSubscriptionProduct.productKey.type);
    return url.toString();
  }, [robloxSubscriptionProduct.productKey.id, robloxSubscriptionProduct.productKey.type]);

  return (
    <Button
      as="a"
      href={subscriptionsManagementUrl}
      isLoading={isLoading}
      variant="Standard"
      onClick={onClick}
    >
      {translate("Action.Manage")}
    </Button>
  );
};

export default ManageButton;
