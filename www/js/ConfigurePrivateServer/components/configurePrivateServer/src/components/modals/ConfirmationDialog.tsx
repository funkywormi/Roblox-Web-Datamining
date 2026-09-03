import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  body: string | React.ReactNode;
  bodyHtmlUnsafe?: boolean;
  actionText: string;
  cancelText: string;
  onOpenChange: (open: boolean) => void;
  onAction: () => Promise<void> | void;
};

const ConfirmationDialog = ({
  open,
  title,
  body,
  bodyHtmlUnsafe = false,
  actionText,
  cancelText,
  onOpenChange,
  onAction,
}: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="Medium"
      isModal
      hasCloseAffordance={false}
    >
      <DialogContent className="!min-width-[280px] width-full">
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small">{title}</DialogTitle>
          {typeof body === "string" ? (
            bodyHtmlUnsafe ? (
              <p
                className="text-body-large content-default"
                // eslint-disable-next-line react/no-danger -- translation output includes expected HTML placeholders
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <p className="text-body-large content-default whitespace-pre-line">{body}</p>
            )
          ) : (
            <div className="text-body-large content-default">{body}</div>
          )}
        </DialogBody>
        <DialogFooter className="flex flex-col gap-small small:flex-row">
          <Button
            variant="Emphasis"
            size="Medium"
            className="fill small:basis-0"
            onClick={() => {
              onAction();
            }}
          >
            {actionText}
          </Button>
          <Button
            variant="Standard"
            size="Medium"
            className="fill small:basis-0"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
