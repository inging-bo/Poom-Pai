import React, { useState } from 'react';
import { EDITMODAL } from "../constant/contant.js";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useModalStore } from "../store/modalStore.js";

const ModalEditMode = ({ meetCode, meetEditCode, isEdit, setIsEdit, modalId }) => {

  const { closeModal } = useModalStore();
  /* 수정할 때 쓰는 코드 */
  const [editCode, setEditCode] = useState('')
  const [editCodePlaceholder, setEditCodePlaceholder] = useState(EDITMODAL.placeHolder.normal);
  const [editCodeError, setEditCodeError] = useState(false)
  const [duplicationMsg, setDuplicationMsg] = useState("")
  const changeEditCode = (inputValue) => {
    let value = Number(inputValue)

    if (isNaN(value)) return
    if (inputValue.length > 15) {
      setEditCodeError(true);
      setDuplicationMsg(EDITMODAL.notice.limit);
      setTimeout(() => {
        setEditCodeError(false);
      }, 600)
      return
    } else {
      setEditCodeError(false);
      setDuplicationMsg("");
    }

    setEditCode(inputValue)
  }
  const close = () => {
    if (modalId) {
      closeModal(modalId)
    }
  }

  const changeEditMode = () => {
    if (editCode === "") {
      setEditCodeError(true);
      setTimeout(() => {
        setEditCodeError(false);
      }, 600)
      return;
    }
    if (editCode !== meetEditCode) {
      setEditCodeError(true);
      setDuplicationMsg(EDITMODAL.notice.noExist);
      setTimeout(() => {
        setEditCodeError(false);
        setDuplicationMsg("");
      }, 600)
      return;
    }

    if (modalId) {
      setIsEdit(!isEdit)
      closeModal(modalId)
    }
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#00000050] z-50">
      {/* 수정 코드 */}
      <div
        className="flex flex-col max-w-xl gap-4 w-[90%] items-center bg-main-bg rounded-lg border-main-color border-6 py-4 px-4">
        <div className="flex w-full gap-2 items-center">
          <h2 className="text-main-text text-2xl">수정 코드</h2>
          <Motion.input
            initial={false}
            animate={editCodeError ? "error" : ""}
            variants={{
              error: {
                borderColor: ["#f87171", "var(--color-main-color)"], // 빨강 ↔ 검정 반복
                transition: {
                  borderColor: {
                    duration: 0.6,
                    ease: "easeInOut",
                    times: [0, 1] // 단계별 색상 타이밍
                  },
                }
              },
            }}
            className={`${editCodeError ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color border-main-color"}
            focus:border-active-color focus:outline-0 flex-1 w-full text-main-text placeholder:font-money border-[6px] h-14 px-2  rounded-lg`}
            inputMode="numeric" pattern="[0-9]*" maxLength="16" placeholder={editCodePlaceholder}
            value={editCode}
            onChange={(e) => changeEditCode(e.target.value)}
          />
        </div>
        <div className="flex w-full gap-5 justify-between">
          <Motion.button
            whileTap={{ y: 5 }}
            onClick={() => close()}
            className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg">나가기
          </Motion.button>
          <Motion.button
            whileTap={{ y: 5 }}
            onClick={() => changeEditMode()}
            className="px-1 py-2 flex-1 text-2xl bg-main-color text-white rounded-lg">수정모드
          </Motion.button>
        </div>
        <AnimatePresence>
          {duplicationMsg && (
            <Motion.span
              key="duplicationMsg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { delay: 0.4 } }} // ✅ exit에 직접 transition 명시
              transition={{ opacity: { duration: 0.4 } }} // ✅ animate용
              className="text-center text-xl text-red-600"
            >
              {duplicationMsg}
            </Motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModalEditMode;
