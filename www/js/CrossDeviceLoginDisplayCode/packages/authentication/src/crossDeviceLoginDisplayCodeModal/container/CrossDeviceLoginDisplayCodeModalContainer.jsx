import React, { useState, useEffect, useRef } from "react";
import { EnvironmentUrls } from "@rbx/environment-urls";
import PropTypes from "prop-types";
import { eventStreamService } from "core-roblox-utilities";
import CrossDeviceLoginDisplayCodeModal from "../components/CrossDeviceLoginDisplayCodeModal";
import {
  createNewCode,
  pullCrossDeviceLoginStatus,
  cancelCrossDeviceLoginCode,
  CODE_MODAL_CLOSE_EVENT,
  CODE_MODAL_OPEN_EVENT,
} from "../services/crossDeviceLoginDisplayCodeService";

import events from "../constants/eventConstants";
import { isCreatedCode } from "../utils/isCreatedCode";

// to construct QR image url
const { apiGatewayUrl } = EnvironmentUrls;

// pulling cross device login code status every 5 seconds
const CODESTATUSPULLINGINTERVAL = 5000;

function CrossDeviceLoginDisplayCodeModalContainer({ translate }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountPictureUrl, setAccountPictureUrl] = useState("");
  const activeCode = useRef("");

  const setQrUrlFromPath = imagePath => {
    if (imagePath) {
      setQrUrl(`${apiGatewayUrl}/auth-token-service${imagePath}`);
    }
  };

  useEffect(() => {
    const onOpen = event => {
      activeCode.current = event.detail.code;
      setCode(event.detail.code);
      setPrivateKey(event.detail.privateKey);
      setQrUrlFromPath(event.detail.imagePath);
      eventStreamService.sendEventWithTarget(events.showModal.type, events.showModal.context, {});
      setModalOpen(true);
    };
    window.addEventListener(CODE_MODAL_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CODE_MODAL_OPEN_EVENT, onOpen);
  }, []);

  const handleModalDismiss = cancelCode => {
    activeCode.current = "";
    setCode("");
    setQrUrl("");
    setPrivateKey("");
    setAccountName("");
    setAccountPictureUrl("");
    setModalOpen(false);
    return cancelCode ? cancelCrossDeviceLoginCode({ code: cancelCode }) : null;
  };

  const refreshCode = codeBody => {
    activeCode.current = codeBody.code;
    setCode(codeBody.code);
    setPrivateKey(codeBody.privateKey);
    setQrUrlFromPath(codeBody.imagePath);
    setAccountName("");
    setAccountPictureUrl("");
  };

  useEffect(() => {
    let interval = null;
    let disposed = false;
    const isCurrent = () => !disposed && activeCode.current === code;
    const refreshCurrentCode = async () => {
      const data = (await createNewCode())?.data;
      if (isCurrent() && isCreatedCode(data)) {
        refreshCode(data);
      }
    };
    if (code && privateKey) {
      interval = setInterval(async () => {
        if (!isCurrent()) return;
        const params = {
          code,
          privateKey,
        };
        try {
          const { data: crossDeviceLoginData } = await pullCrossDeviceLoginStatus(params);
          if (!isCurrent()) return;
          if (crossDeviceLoginData?.status === "Cancelled") {
            await refreshCurrentCode();
          }
          if (crossDeviceLoginData?.status === "UserLinked") {
            if (accountName === "") {
              eventStreamService.sendEventWithTarget(
                events.showProfile.type,
                events.showProfile.context,
                {},
              );
            }
            setAccountName(crossDeviceLoginData.accountName || "unknown");
            setAccountPictureUrl(crossDeviceLoginData.accountPictureUrl);
          }
          if (crossDeviceLoginData?.status === "Validated") {
            const loginParams = {
              ctype: "AuthToken",
              code,
              privateKey,
            };
            const event = new CustomEvent("OnCrossDeviceCodeValidated", {
              detail: loginParams,
            });
            window.dispatchEvent(event);
            handleModalDismiss();
            clearInterval(interval);
          }
        } catch (e) {
          // refresh when code expires.
          if (isCurrent()) {
            await refreshCurrentCode();
          }
        }
      }, CODESTATUSPULLINGINTERVAL);
    }
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [accountName, code, privateKey]);

  return (
    <CrossDeviceLoginDisplayCodeModal
      show={isModalOpen}
      code={code}
      qrUrl={qrUrl}
      accountName={accountName}
      accountPictureUrl={accountPictureUrl}
      onHide={() => {
        handleModalDismiss(code);
        window.dispatchEvent(new Event(CODE_MODAL_CLOSE_EVENT));
      }}
      translate={translate}
    />
  );
}

CrossDeviceLoginDisplayCodeModalContainer.propTypes = {
  translate: PropTypes.func.isRequired,
};

export default CrossDeviceLoginDisplayCodeModalContainer;
