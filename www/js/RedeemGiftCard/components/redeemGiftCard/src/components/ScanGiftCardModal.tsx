/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TranslateFunction } from "react-utilities";
import { Modal } from "react-style-guide";
import { Button } from "@rbx/foundation-ui";
import { scanGiftCard, trackCounter, trackError } from "@rbx/payments/creditCheckout";
import cutoutBorderSvg from "@rbx/payments/src/assets/images/redeemGiftCard/cutout-border.svg";
import { redeemGiftCardURL } from "../constants/redeemGiftCardConstants";

const HORIZONTAL_OFFSET_PX = 29;
const VERTICAL_HEIGHT_PX = 50;

enum View {
  AccessingCamera,
  CameraAccessFailed,
  Ready,
  ValidationFailed,
  Validating,
}

export default function ScanGiftCardModal({
  onClose,
  onValidateSuccess,
  translate,
}: {
  onClose: () => void;
  onValidateSuccess: (code: string) => void;
  translate: TranslateFunction;
}): JSX.Element {
  const [stream, setStream] = useState<MediaStream>();

  const [[videoWidth, videoHeight], setVideoDimensions] = useState<[number, number]>([0, 0]);
  const [[canvasWidth, canvasHeight], setCanvasDimensions] = useState<[number, number]>([0, 0]);

  const [view, setView] = useState<View>(View.AccessingCamera);

  const [renderedVideoHeight, setRenderedVideoHeight] = useState(0);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [isInstructionTextVisible, setIsInstructionTextVisible] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const takePicture = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    trackCounter("TakePhotoClicked");

    // our cutout is calculated based on rendered dimensions,
    // but canvas sees the raw camera dimensions, so scaling is needed
    const heightRatio = video.videoHeight / videoHeight;
    const widthRatio = video.videoWidth / videoWidth;

    const sy = (videoHeight - VERTICAL_HEIGHT_PX) / 2;
    const sWidth = videoWidth - HORIZONTAL_OFFSET_PX * 2;

    try {
      context.drawImage(
        video,
        HORIZONTAL_OFFSET_PX * widthRatio,
        sy * heightRatio,
        sWidth * widthRatio,
        VERTICAL_HEIGHT_PX * heightRatio,
        0,
        0,
        canvasWidth,
        canvasHeight,
      );
    } catch (e) {
      trackError("Error_ScanDrawImageException", null, e);
      console.error(e);
      return;
    }

    setView(View.Validating);
    const result = await scanGiftCard(canvas.toDataURL("image/jpeg").split(",")[1] ?? "");

    if (!result) {
      setView(View.ValidationFailed);
      trackError("Error_ScanRequestFailed");
      return;
    }

    const { scannedCode } = result;

    if (!scannedCode) {
      setView(View.ValidationFailed);
      trackError("ScanNoCodeFound");
      return;
    }

    trackCounter("ScanCodeFound");
    onValidateSuccess(scannedCode);
  }, [canvasRef, videoRef, videoWidth, videoHeight, canvasWidth, canvasHeight, onValidateSuccess]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream || view !== View.AccessingCamera) {
      return () => undefined;
    }

    const eventListener = () => {
      const containerWidth = video.parentElement?.clientWidth ?? window.innerWidth;
      const width = Math.min(containerWidth, 600);
      const height = video.videoHeight / (video.videoWidth / width);

      setVideoDimensions([width, height]);

      const widthRatio = video.videoWidth / width;
      const heightRatio = video.videoHeight / height;
      const canvWidth = (width - HORIZONTAL_OFFSET_PX * 2) * widthRatio;
      const canvHeight = VERTICAL_HEIGHT_PX * heightRatio;

      setCanvasDimensions([canvWidth, canvHeight]);

      setView(View.Ready);
    };

    video.addEventListener("canplay", eventListener);
    video.srcObject = null;
    video.srcObject = stream;
    void video.play();

    return () => {
      video.removeEventListener("canplay", eventListener);
    };
  }, [videoRef, stream, view]);

  useEffect(() => {
    trackCounter("CameraAccessStarted");

    if (!navigator.mediaDevices) {
      setView(View.CameraAccessFailed);
      trackError("Error_CameraAccessUnsupported");
      return () => undefined;
    }

    let activeStream: MediaStream | undefined;
    let isMounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(mediaStream => {
        activeStream = mediaStream;
        if (isMounted) {
          setStream(mediaStream);
          trackCounter("CameraAccessSuccess");
        } else {
          // component unmounted before camera was ready - stop track immediately
          trackCounter("CameraAccessUnmounted");
          mediaStream.getTracks().forEach(track => {
            track.stop();
          });
        }
      })
      .catch((e: unknown) => {
        console.error(e);
        if (!(e instanceof Error)) {
          trackError("Error_CameraAccessException", null, e);
          return;
        }
        if (isMounted) {
          setView(View.CameraAccessFailed);
          trackError("Error_CameraAccessFailed", null, e);
        }
      });

    return () => {
      isMounted = false;
      // turn off camera indicator
      activeStream?.getTracks().forEach(track => {
        track.stop();
      });
    };
  }, [cameraRetryCount]);

  // Measure the video's actual rendered height after it is painted so that
  // the box-shadow vignette spread is based on real CSS pixels, not the
  // computed videoHeight (which may differ when width:100%/height:auto scales the video).
  useEffect(() => {
    if (view === View.Ready && videoRef.current) {
      setRenderedVideoHeight(videoRef.current.clientHeight);
    }
  }, [view]);

  // Show the "Place PIN code inside here" hint when the camera becomes ready,
  // then fade it out so it stops obscuring the scan area.
  useEffect(() => {
    if (view !== View.Ready) {
      setIsInstructionTextVisible(true);
      return undefined;
    }
    const timer = setTimeout(setIsInstructionTextVisible, 2000, false);
    return () => {
      clearTimeout(timer);
    };
  }, [view]);

  return (
    <Modal id="scan-gift-card-modal" show onHide={onClose} scrollable={false}>
      <div className="h-[100dvh] flex flex-col">
        <div className="modal-header flex items-center justify-between width-full">
          <h2 className="text-heading-small margin-none">
            {translate("Label.ScanGiftCard.ScanYourCode")}
          </h2>
          <button
            type="button"
            className="close"
            title="close"
            onClick={onClose}
            // Bootstrap's .close has float:right, which would yank the X
            // out of the flex row. Foundation-tailwind has no float utility,
            // so we override inline.
            style={{ float: "none" }}
          >
            <span className="icon-close" />
          </button>
        </div>
        <div className="modal-body flex-1 overflow-hidden p-[20px]">
          {view === View.CameraAccessFailed || view === View.ValidationFailed ? (
            <div className="flex flex-col justify-center items-center gap-[24px] mt-[140px] max-w-[600px] mx-auto">
              <span className="icon-status-alert-xl" />
              <div className="flex flex-col items-center gap-[8px] text-center">
                <p className="text-[20px] font-bold leading-[120%] [letter-spacing:-0.2px]">
                  {view === View.CameraAccessFailed
                    ? translate("Label.ScanGiftCard.CouldNotAccessCamera")
                    : translate("Label.ScanGiftCard.CouldNotReadCard")}
                </p>
                <p className="text-[14px] leading-[140%]">
                  {view === View.CameraAccessFailed
                    ? translate("Description.ScanGiftCard.SorryWeCouldntAccessCamera")
                    : translate("Description.ScanGiftCard.SorryWeCouldntReadCard")}
                </p>
              </div>
              <div className="flex flex-col gap-[16px] width-full">
                <Button
                  type="button"
                  variant="Emphasis"
                  size="Medium"
                  onClick={() => {
                    if (view === View.ValidationFailed) {
                      setRenderedVideoHeight(0);
                      setView(View.AccessingCamera);
                    } else if (view === View.CameraAccessFailed) {
                      trackCounter("CameraRetryClicked");
                      setView(View.AccessingCamera);
                      setCameraRetryCount(c => c + 1);
                    }
                  }}
                >
                  {view === View.CameraAccessFailed
                    ? translate("Action.ScanGiftCard.IveUpdatedMyCameraSettings")
                    : translate("Action.ScanGiftCard.RetakePhoto")}
                </Button>
                <Button
                  type="button"
                  variant="Standard"
                  size="Medium"
                  onClick={() => {
                    onClose();
                  }}
                >
                  {translate("Action.ScanGiftCard.EnterManually")}
                </Button>
                <Button type="button" variant="ActionUtility" size="Medium">
                  {translate("Label.ScanGiftCard.CardDamaged")}&nbsp;
                  <a
                    className="get-help-link"
                    href={redeemGiftCardURL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {translate("Action.ScanGiftCard.GetHelp")}
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center">
              <p className="text-[16px] text-center">
                {view === View.AccessingCamera
                  ? translate("Label.ScanGiftCard.LoadingCamera")
                  : view === View.Validating
                    ? translate("Label.ScanGiftCard.ValidatingPINCode")
                    : translate("Label.ScanGiftCard.CaptureTheBackOfYourCard")}
              </p>
              {(view === View.AccessingCamera || view === View.Validating) && (
                <span className="spinner spinner-default mt-[100px]" />
              )}
              {(view === View.AccessingCamera || view === View.Ready) && (
                <div
                  className="scan-gift-card-video-container"
                  style={{
                    position: "relative",
                    height: renderedVideoHeight > 0 ? renderedVideoHeight : undefined,
                  }}
                >
                  <video
                    controls={false}
                    muted
                    playsInline
                    ref={videoRef}
                    className="block w-full h-auto"
                    width={videoWidth}
                    height={videoHeight}
                  />
                  <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
                  <div className="scan-gift-card-video-overlay" />
                  {view === View.Ready && (
                    <div
                      className="scan-gift-card-pin-window"
                      style={{
                        backgroundImage: `url(${cutoutBorderSvg})`,
                        position: "absolute",
                        top: `${(renderedVideoHeight - 52) / 2}px`,
                        left: `${(videoWidth - 297) / 2}px`,
                        width: "297px",
                        height: "52px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        // Darken the camera feed around the notch. The video
                        // container has overflow:hidden, so this paints only
                        // the area between the notch and the video edges.
                        boxShadow: "0 0 0 9999px rgba(18, 18, 21, 0.6)",
                        // Dark fill inside the notch. Paints behind the SVG
                        // corner brackets (which are the background-image) and
                        // fades together with the instruction text.
                        backgroundColor: isInstructionTextVisible
                          ? "rgba(18, 18, 21, 0.6)"
                          : "rgba(18, 18, 21, 0)",
                        transition: "background-color 2000ms ease-out",
                      }}
                    >
                      <p
                        style={{
                          opacity: isInstructionTextVisible ? 1 : 0,
                          transition: "opacity 2000ms ease-out",
                        }}
                      >
                        {translate("Label.ScanGiftCard.PlacePINCodeInsideHere")}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {view === View.Ready && (
                <div className="flex justify-center margin-top-medium">
                  <Button type="button" variant="Emphasis" size="Medium" onClick={takePicture}>
                    {translate("Action.ScanGiftCard.TakePhoto")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
