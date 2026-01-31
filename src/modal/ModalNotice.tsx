import { motion as Motion } from "framer-motion";
import { type ModalData, useModalStore } from "@/store/modalStore.ts";
import { useDataStore } from "@/store/useDataStore.ts";

/**
 * [ ModalNotice 사용 예시 ]
 * * 기본 알림 (확인 버튼만)
 * openModal("ModalNotice", {
 * title: "저장되었습니다.",
 * onConfirm: () => console.log("확인됨")
 * });
 * * 확인/취소 선택 (버튼 문구 커스텀)
 * openModal("ModalNotice", {
 * title: "정말로 삭제하시겠습니까?",
 * showCancel: true,
 * confirmText: "삭제",
 * cancelText: "유지",
 * onConfirm: () => deleteLogic(),
 * onCancel: () => console.log("취소됨")
 * });
 */
const ModalNotice = ({
                       title,
                       message = "",
                       confirmText = "확인",
                       cancelText = "취소",
                       showCancel = false,
                       onConfirm,
                       onCancel,
                       modalId
                     }: ModalData) => {
  const { closeModal } = useModalStore();
  const { isLoading } = useDataStore();

  const isSave = confirmText.includes("저장")

  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();
    if (modalId) closeModal(modalId);
  };

  return (
    <div className="modal-bg">
      <Motion.div
        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col max-w-xl gap-6 w-full items-center bg-white py-8 px-6 modal-border"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-main-text text-xl sm:text-2xl text-center break-keep">{title}</h2>
          {message !== "" && (
            <h3 className="text-main-color font-money text-base sm:text-xl text-center break-keep">{message}</h3>
          )}
        </div>
        <div className="flex w-full gap-4 justify-center font-money">
          {showCancel && (
            <Motion.button
              whileTap={{ scale: 0.98 }} onClick={() => { if (onCancel) onCancel(); if (modalId) closeModal(modalId); }}
              className="btn-cancel"
            >
              {cancelText}
            </Motion.button>
          )}
          <Motion.button
            whileTap={{ scale: 0.98 }} onClick={handleConfirm} autoFocus={!showCancel}
            className="btn-success"
          >
            {isLoading && isSave ? "저장 중..." : confirmText}
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
};
export default ModalNotice;