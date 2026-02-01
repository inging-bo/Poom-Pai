import { useState } from 'react';
import { motion as Motion, type Transition, type Variants } from "framer-motion";
import { type ModalData, useModalStore } from "../store/modalStore.ts";
import { useDataStore } from "@/store/useDataStore.ts";
import { ERRORS } from "@/constant/contant.ts";
import { cn } from "@/lib/utils.ts";
import { useTimeout } from "@/hooks/useTimeout.ts";
import { X } from "lucide-react";
import CustomKeypad from "@/view/CustomKeypad.tsx";
import { useMobileEnv } from "@/hooks/useMobileEnv.ts";

interface ScreenTypes<T> {
  web: T;
  mobile: T;
}

/** 수정하기 / 수정완료 모달 */
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

  const { isMobile } = useMobileEnv()

  const screens: ScreenTypes<Variants> = {
    web: { // sm 이상: 중앙에서 커지는 방식
      initial: { scale: 0.9, opacity: 0 }, // y축 정렬 보정
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
    },
    mobile: { // sm 미만: 아래에서 올라오는 방식
      initial: { y: "100%", opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 }
    }
  };
  const modalTransition: ScreenTypes<Transition> = {
    web: {
      type: "spring",
      ease: "easeOut",
      duration: 0.3
    },
    mobile: {
      ease: "easeOut",
      duration: 0.2
    }
  };

  const currentMode = isMobile ? "mobile" : "web";

  return (
    <div className={cn("fixed inset-0 z-[1000] flex items-end justify-center sm:items-center",

    )}>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => modalId && closeModal(modalId)}
        className="absolute inset-0 bg-black/10"
      />
      {/* 모달 콘텐츠 */}
      <Motion.div
        key={currentMode}
        variants={screens[currentMode]}
        transition={modalTransition[currentMode]}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn("relative flex flex-col max-w-xl gap-4 w-full items-center bg-white modal-border p-6",
          isMobile && "border-0 rounded-b-none max-w-full"
        )}
      >
        <Motion.div
          className="flex w-full gap-2 items-center"
        >
          <h2 className="text-main-text sm:text-xl w-fit shrink-0">수정 코드</h2>
          <div className="relative w-full">
            <Motion.input
              readOnly={isMobile}
              animate={errorMsg ? { x: [-2, 2, -2, 2, 0] } : {}}
              className={cn(
                "input-primary max-sm:text-base",
                errorMsg && "error-input-border",
                isMobile && "pointer-events-none",
              )}
              inputMode="none"
              type="password"
              value={editCode}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="수정 코드를 입력하세요"
              autoFocus
            />
            {editCode !== "" && (
              <button
                type="button"
                onClick={() => setEditCode("")}
                className={cn("absolute p-1 rounded-full bg-sub-color text-white right-1 bottom-2 cursor-pointer",
                  "hover:bg-sub-color-hover"
                )}
              >
                <X size={16} strokeWidth={3} />
              </button>
            )}
          </div>
        </Motion.div>
        {isMobile && (
          <CustomKeypad setCode={setEditCode} />
        )}
        <div className="flex w-full gap-3">
          <Motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => modalId && closeModal(modalId)}
            className="btn-cancel"
          >
            나가기
          </Motion.button>
          <Motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="btn-success"
          >
            수정하기
          </Motion.button>
        </div>

        {errorMsg && (
          <Motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-600 text-center"
          >
            {errorMsg}
          </Motion.span>
        )}
      </Motion.div>
    </div>
  );
};

export default ModalEditMode;