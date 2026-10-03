import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import CustomModal from "./CustomModal";
import { MorphIcon } from "morphicons/react";
import { Clipboard, Check } from "lucide";
import { useAlert } from "./contexts/alertContext";

interface DeviceCodeModalProps {
  isOpen: boolean;
  isLoggingIn: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function DeviceCodeModal({
  isOpen,
  onOpen,
  onClose,
  isLoggingIn,
}: DeviceCodeModalProps) {
  const [deviceCode, setDeviceCode] = useState<{
    code: string;
    url: string;
  } | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    const handler = (_event: any, data: any) => {
      if (!isLoggingIn) return;
      setDeviceCode(data);
      onOpen();
    };

    window.ipcRenderer.on("auth:device-code", handler);

    return () => {
      window.ipcRenderer.off("auth:device-code", handler);
    };
  }, [onOpen, isLoggingIn]);

  useEffect(() => {
    if (!deviceCode) {
      setQrDataUrl(null);
      setIsCopied(false);
      return;
    }

    let isActive = true;

    QRCode.toDataURL(deviceCode.url, {
      width: 160,
      margin: 1,
    })
      .then((dataUrl) => {
        if (isActive) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((error) => {
        console.error("QR generation error:", error);
        showAlert("Failed to generate QR code", "error");
      });

    return () => {
      isActive = false;
    };
  }, [deviceCode, showAlert]);

  const handleClose = useCallback(() => {
    setDeviceCode(null);
    setQrDataUrl(null);
    setIsCopied(false);
    onClose();
  }, [onClose]);

  const handleOpenLink = () => {
    if (!deviceCode) return;

    window.ipcRenderer.invoke("shell:open-external", deviceCode.url);
  };

  const handleCopy = async () => {
    if (!deviceCode) return;

    try {
      await navigator.clipboard.writeText(deviceCode.code);

      setIsCopied(true);

      showAlert("Text was copied!", "success");

      setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch (error) {
      console.error("Clipboard error:", error);
      showAlert("Error copying the text", "error");
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      size="medium"
      title="Login to your account"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-400">
          Enter this code at the link below or scan the QR code.
        </p>

        {qrDataUrl && (
          <div className="bg-white p-3 rounded-xl">
            <img
              src={qrDataUrl}
              alt="QR-code for login"
              width={160}
              height={160}
            />
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <div className="text-2xl font-bold tracking-widest text-white bg-white/5 px-4 py-2 rounded-lg">
            {deviceCode?.code}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center p-[14px] rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors h-full"
            title="Copy code"
            aria-label="Copy code"
          >
            <MorphIcon
              icon={isCopied ? Check : Clipboard}
              size={20}
              spring="snappy"
              strokeWidth={2.5}
            />
          </button>
        </div>

        <button
          onClick={handleOpenLink}
          className="text-sm text-blue-300 hover:text-blue-200 underline underline-offset-4 cursor-pointer transition-colors mt-2"
        >
          {deviceCode?.url}
        </button>
      </div>
    </CustomModal>
  );
}
