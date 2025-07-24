import React from 'react';
import { motion as Motion } from "framer-motion";
import { useModalStore } from "../store/modalStore.js";

const ModalNotice = ({
                       title,
                       cancelName,
                       onConfirmName,
                       onlyCancel,
                       onlyConfirm,
                       isEdit,
                       setIsEdit,
                       openPopUp,
                       setOpenPopUp,
                       modalId
                     }) => {

  const { closeModal } = useModalStore();

  const cancelBtn = () => {
    closeModal(modalId)
  }

  const onConfirmBtn = () => {
    if (isEdit) setIsEdit(false)
    if (openPopUp) setOpenPopUp(false)
      closeModal(modalId)
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#00000050] z-50">
      <Motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5, transition: { delay: 0.2 } }} // ✅ exit에 직접 transition 명시
        transition={{ opacity: { duration: 0.2 } }} // ✅ animate용
        className="flex flex-col max-w-xl gap-4 w-[90%] items-center bg-main-bg rounded-lg border-main-color border-6 py-4 px-4">
        <div className="flex w-full gap-2 items-center justify-center">
          <h2 className="text-main-text text-2xl">
            {title}
          </h2>
        </div>
        <div className="flex w-full gap-5 justify-between">
          {!onlyConfirm && (
            <Motion.button
              whileTap={{ y: 3 }}
              onClick={() => cancelBtn()}
              className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg cursor-pointer">
              {cancelName || "취소"}
            </Motion.button>
          )}
          {!onlyCancel && (
            <Motion.button
              whileTap={{ y: 3 }}
              onClick={() => onConfirmBtn()}
              className="px-1 py-2 flex-1 text-2xl bg-main-color text-white rounded-lg">
              {onConfirmName || "확인"}
            </Motion.button>
          )}
        </div>
      </Motion.div>
    </div>
  );
};

export default ModalNotice;
