import { useState } from 'react';
import { AnimatePresence, motion as Motion } from "framer-motion";
import { type ModalData, useModalStore } from "../store/modalStore.ts";
import { useDataStore } from "@/store/useDataStore.ts";
import { ERRORS } from "@/constant/contant.ts";
import { cn } from "@/lib/utils.ts";
import { useTimeout } from "@/hooks/useTimeout.ts";

const ModalEditMode = ({ modalId }: ModalData) => {
  const { closeModal } = useModalStore();
  const { meetEditCode, toggleEditMode } = useDataStore(); // 스토어의 editCode (문자열 혹은 숫자)

  const [editCode, setEditCode] = useState('');
  const [errorMsg, setErrorMsg] = useState("");

  const resetErrorState = useTimeout(() => {
    setErrorMsg("")
  }, 600);

  // 에러 발생 시 처리 (흔들림 애니메이션 trigger 및 메세지 초기화)
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    resetErrorState()
  };

  const handleInputChange = (val: string) => {
    // 숫자가 아닌 문자 제거 (inputMode numeric에 대응)
    const numericValue = val.replace(/[^0-9]/g, '');
    if (numericValue.length > 15) return triggerError(ERRORS.LIMIT_CODE);

    setEditCode(numericValue);
  };

  const handleConfirm = () => {
    if (!editCode) return triggerError("코드를 입력해주세요.");

    // 타입 차이 방지를 위해 양쪽 모두 String 변환 및 공백 제거
    if (String(editCode).trim() === String(meetEditCode).trim()) {
      toggleEditMode(true);
      if (modalId) closeModal(modalId);
    } else {
      // 일치하지 않을 때만 에러 발생
      triggerError(ERRORS.WRONG_EDIT_CODE);
      setEditCode(''); // 틀렸을 때 입력창 비워주기 (선택사항)
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
              "flex-1 h-14 min-w-0 px-3 rounded-lg text-xl border-[6px] outline-none transition-colors",
              errorMsg ? "border-red-400" : "border-main-color"
            )}
            inputMode="numeric"
            type="password"
            value={editCode}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="수정 코드를 입력하세요"
            autoFocus
          />
        </div>

        <div className="flex w-full gap-3">
          <Motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => modalId && closeModal(modalId)}
            className="flex-1 py-3 text-xl border-[6px] border-main-color rounded-lg font-bold hover:bg-black/5"
          >
            나가기
          </Motion.button>
          <Motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="flex-1 py-3 text-xl bg-main-color text-white rounded-lg font-bold hover:brightness-110"
          >
            수정모드
          </Motion.button>
        </div>

        <div className="h-6"> {/* 레이아웃 튐 방지 고정 높이 */}
          <AnimatePresence mode="wait">
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