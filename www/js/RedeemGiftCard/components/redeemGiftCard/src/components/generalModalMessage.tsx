import React from "react";

type Props = {
  modalMessageText: string;
  modalMessageSubtext?: string;
  imagePath: string;
  imageAlt: string;
};

function GeneralModalMessage({
  modalMessageText,
  modalMessageSubtext = "",
  imagePath,
  imageAlt,
}: Props) {
  return (
    <div>
      <hr className="modal-message-hr" />
      <div className="modal-message-text">{modalMessageText}</div>
      <img src={imagePath} height="120px" alt={imageAlt} />
      {modalMessageSubtext != null && modalMessageSubtext !== "" ? (
        <p className="text-footer">{modalMessageSubtext}</p>
      ) : null}
    </div>
  );
}

export default GeneralModalMessage;
