import { useState } from 'react';
import { AnimatePresence, motion as Motion } from "framer-motion";
import { type ModalData, useModalStore } from "../store/modalStore.ts";
import { useDataStore } from "@/store/useDataStore.ts";
import { ERRORS } from "@/constant/contant.ts";
import { cn } from "@/lib/utils.ts";

const ModalEditMode = ({ modalId }: ModalData) => {
  const { closeModal } = useModalStore();
  const { meetEditCode, toggleEditMode } = useDataStore(); // 스토어의 editCode (문자열 혹은 숫자)

  const [editCode, setEditCode] = useState('');
  const [errorMsg, setErrorMsg] = useState("");

  // 에러 발생 시 처리 (흔들림 애니메이션 trigger 및 메세지 초기화)
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 600);
  };

  const handleInputChange = (val: string) => {
    // 숫자가 아니거나 15자 초과 시 에러 처리
    if (isNaN(Number(val))) return;
    if (val.length > 15) return triggerError(ERRORS.LIMIT_CODE);

    setEditCode(val);
  };

  const handleConfirm = () => {
    if (!editCode) return triggerError("코드를 입력해주세요.");

    if (String(editCode) === String(meetEditCode)) {
      toggleEditMode(true); // 🔥 직접 스토어 상태 변경
      closeModal(modalId!);
    }

    // 스토어의 meetEditCode와 비교 (타입 차이 방지를 위해 String 변환)
    if (String(editCode) !== String(meetEditCode)) {
      return triggerError(ERRORS.WRONG_EDIT_CODE);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 font-money p-4">
      <Motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col max-w-xl w-full gap-4 items-center bg-main-bg rounded-lg border-[6px] border-main-color p-4 shadow-xl"
      >
        <div className="flex w-full gap-2 items-center">
          <h2 className="text-main-text text-2xl font-bold shrink-0">수정 코드</h2>
          <Motion.input
            animate={errorMsg ? { x: [-2, 2, -2, 2, 0] } : {}}
            className={cn(
              "flex-1 h-14 px-3 rounded-lg text-xl border-[6px] outline-none transition-colors",
              errorMsg ? "border-red-400" : "border-main-color"
            )}
            inputMode="numeric"
            type="password"
            value={editCode}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="코드를 입력하세요"
          />
        </div>

        <div className="flex w-full gap-3">
          <Motion.button
            whileTap={{ y: 3 }}
            onClick={() => modalId && closeModal(modalId)}
            className="flex-1 py-3 text-xl border-[6px] border-main-color rounded-lg font-bold hover:bg-black/5 transition-colors"
          >
            나가기
          </Motion.button>
          <Motion.button
            whileTap={{ y: 3 }}
            onClick={handleConfirm}
            className="flex-1 py-3 text-xl bg-main-color text-white rounded-lg font-bold hover:brightness-110 transition-all"
          >
            수정모드
          </Motion.button>
        </div>

        <div className="h-6"> {/* 레이아웃 튐 방지 고정 높이 */}
          <AnimatePresence>
            {errorMsg && (
              <Motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-600 font-bold text-center"
              >
                {errorMsg}
              </Motion.span>
            )}
          </AnimatePresence>
        </div>
      </Motion.div>
    </div>
  );
};

export default ModalEditMode;