import { useContext } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { ModalContext } from "../../contexts/ModalContext";
import { SamsungPaymentMethods } from "../../hooks/samsungPaymentMethods/useSamsungPaymentMethods";

type PayButtonProps = {
  onClick: () => void;
  title: string;
  iconComponent: React.ReactNode;
};
const PayButton = (props: PayButtonProps) => {
  const { onClick, title, iconComponent } = props;
  return (
    <button
      className="width-full flex flex-row gap-small bg-action-standard stroke-none justify-between items-center padding-large radius-medium"
      type="button"
      onClick={onClick}
    >
      {iconComponent}
      <div className="text-body-large">{title}</div>
    </button>
  );
};

export function SamsungPaymentMethodsModal({
  handleClose,
  handleRedeemCreditClick,
  handleSamsungPayClick,
}: SamsungPaymentMethods) {
  const {
    samsungPaymentMethods: { isOpen: isSamsungPaymentMethodsModalOpen },
  } = useContext(ModalContext);

  const translate = useTranslations("Feature.Premium");

  return (
    <Dialog
      open={isSamsungPaymentMethodsModalOpen}
      onOpenChange={handleClose}
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      size="Large"
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle>
            {/* Margin right help avoid overlapping with the modal close icon */}
            <div className="margin-right-large">
              {translate("Message.MobilePaymentMethod.BottomSheetTitle")}
            </div>
          </DialogTitle>

          <div className="flex flex-col gap-medium">
            <PayButton
              onClick={handleSamsungPayClick}
              title={translate("Message.MobilePaymentMethod.MilkyWayCheckout")}
              iconComponent={<div className="icon-samsung-pay width-[34px] height-[34px]" />}
            />
            <PayButton
              onClick={handleRedeemCreditClick}
              title={translate("Message.MobilePaymentMethod.RobloxCredit")}
              iconComponent={
                <div className="payment-method-image robloxCredit width-[42px] height-[28px]" />
              }
            />
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
