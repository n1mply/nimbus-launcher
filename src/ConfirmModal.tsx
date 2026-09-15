import CustomModal from "./CustomModal";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmModal({ isOpen, onClose, onConfirm }: Props) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async () => {
    setIsCancelling(true);
    try {
      await onConfirm();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel installation?"
      size="small"
      closeOnEsc={false}
      closeOnOutsideClick={false}
      isFlexible
    >
      <div className="flex flex-col gap-5 pt-1">
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-red-200">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-400" size={18} />
          <p className="text-[13px] leading-relaxed">
            Are you sure you want to cancel the instance installation? If you cancel now, downloaded files for this session will be cleaned up and you will have to download everything again later.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50"
          >
            No, continue
          </button>

          <button
            type="button"
            disabled={isCancelling}
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 text-[13px] font-semibold text-red-300 transition-colors hover:bg-red-500/30 hover:border-red-500/50 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isCancelling && <Loader2 size={15} className="animate-spin" />}
            <span>Yes, cancel</span>
          </button>
        </div>
      </div>
    </CustomModal>
  );
}