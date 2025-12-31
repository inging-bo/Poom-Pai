import { motion as Motion } from "framer-motion";
import { type ModalData, useModalStore } from "@/store/modalStore.ts";

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
                       confirmText = "확인",
                       cancelText = "취소",
                       showCancel = false,
                       onConfirm,
                       onCancel,
                       modalId
                     }: ModalData) => {
  const { closeModal } = useModalStore();

  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();
    if (modalId) closeModal(modalId);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#00000050] z-50">
      <Motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col max-w-xl gap-6 w-[90%] items-center bg-main-bg rounded-lg border-main-color border-6 py-6 px-4">
        <h2 className="text-main-text text-2xl text-center break-keep font-bold">{title}</h2>
        <div className="flex w-full gap-4 justify-center">
          {showCancel && (
            <Motion.button whileTap={{ scale: 0.98 }} onClick={() => { if (onCancel) onCancel(); if (modalId) closeModal(modalId); }}
                           className="flex-1 py-3 text-2xl border-[4px] border-main-color rounded-lg font-bold text-main-text">{cancelText}</Motion.button>
          )}
          <Motion.button whileTap={{ scale: 0.98 }} onClick={handleConfirm} autoFocus={!showCancel}
                         className="flex-1 py-3 text-2xl bg-main-color text-white rounded-lg font-bold">{confirmText}</Motion.button>
        </div>
      </Motion.div>
    </div>
  );
};
export default ModalNotice;