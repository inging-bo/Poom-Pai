import { AnimatePresence, motion as Motion } from "framer-motion";
import React, { useState } from "react";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js"; // 위에서 만든 firebase.js
import { DUPLICATION, PLACEHOLDERS } from "../constant/contant.js";
import { useModalStore } from "../store/modalStore.js";

function MakeMoneyDetails() {

  const { openModal } = useModalStore()

  const [isLoading, setIsLoading] = useState(false)

  const goHome = () => {
    setOpenPopUp(false)
  }
  /* 모임 등록 모달 온 오프 */
  const [openPopUp, setOpenPopUp] = useState(false)
  const makeDetails = () => {
    setOpenPopUp(true)
  }

  /* 모임 제목 내용 */
  const [meetName, setMeetName] = useState('')
  const [meetNamePlaceholder, setMeetNamePlaceholder] = useState(PLACEHOLDERS.name.normal);
  const [meetNameError, setMeetNameError] = useState(false)
  const changeMeetName = (value) => {
    if (value.length > 10) {
      setMeetNameError(true);
      setDupicationMsg(DUPLICATION.name.limit);
      setTimeout(() => {
        setMeetNameError(false);
      }, 600)
      return
    } else {
      setMeetNameError(false);
      setDupicationMsg("");
    }
    setMeetName(value)
  }

  /* 입장 코드 */
  const [meetCode, setMeetCode] = useState('')
  const [meetCodePlaceholder, setMeetCodePlaceholder] = useState(PLACEHOLDERS.code.normal);
  const [meetCodeError, setMeetCodeError] = useState(false)
  const changeMeetCode = (inputValue) => {
    let value = Number(inputValue)

    if (isNaN(value)) return
    if (inputValue.length > 15) {
      setMeetCodeError(true);
      setDupicationMsg(DUPLICATION.code.limit);
      setTimeout(() => {
        setMeetCodeError(false);
      }, 600)
      return
    } else {
      setMeetCodeError(false);
      setDupicationMsg("");
    }

    setMeetCode(inputValue)
  }

  /* 수정할 때 쓰는 코드 */
  const [editCode, setEditCode] = useState('')
  const [editCodePlaceholder, setEditCodePlaceholder] = useState(PLACEHOLDERS.edit.normal);
  const [editCodeError, setEditCodeError] = useState(false)
  const changeEditCode = (inputValue) => {
    let value = Number(inputValue)

    if (isNaN(value)) return
    if (inputValue.length > 15) {
      setEditCodeError(true);
      setDupicationMsg(DUPLICATION.edit.limit);
      setTimeout(() => {
        setEditCodeError(false);
      }, 600)
      return
    } else {
      setEditCodeError(false);
      setDupicationMsg("");
    }

    setEditCode(inputValue)
  }

  /* 모임 등록 */
  const addMeeting = () => {
    saveData()
  }

// ✅ 에러 표시 함수: 에러 상태 true → 일정 시간 후 false
  function triggerInputError(type) {
    if (type === "name") {
      setMeetNameError(true);
      setMeetNamePlaceholder(PLACEHOLDERS.name.error);
      setTimeout(() => {
        setMeetNameError(false);
        setMeetNamePlaceholder(PLACEHOLDERS.name.normal);
      }, 600);
    } else if (type === "code") {
      setMeetCodeError(true);
      setMeetCodePlaceholder(PLACEHOLDERS.code.error);
      setTimeout(() => {
        setMeetCodeError(false);
        setMeetCodePlaceholder(PLACEHOLDERS.code.normal);
      }, 600);
    } else if (type === "edit") {
      setEditCodeError(true);
      setEditCodePlaceholder(PLACEHOLDERS.edit.error);
      setTimeout(() => {
        setEditCodeError(false);
        setEditCodePlaceholder(PLACEHOLDERS.edit.normal);
      }, 600);
    }
  }

  const [duplicationMsg, setDupicationMsg] = useState("")

  /* 빈칸 시 에러 표시 용 */
  const fieldMap = {
    name: meetName,
    code: meetCode,
    edit: editCode,
  };

  /* 빈 값인 input 찾기 */
  const emptyFields = Object.entries(fieldMap).filter(([, value]) => value === '');

  /* 모임 등록 시 */
  async function saveData() {
    if (emptyFields.length > 0) {
      emptyFields.forEach(([key]) => triggerInputError(key));
      return;
    }

    try {
      setIsLoading(true)
      const customId = meetName;
      // 1️⃣ ID 중복 확인 (문서 ID가 이미 존재하는지)
      const docRef = doc(db, "MeetList", customId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMeetNameError(true);
        setDupicationMsg(DUPLICATION.name.error)
        setTimeout(() => {
          setMeetNameError(false);
          setDupicationMsg("")
        }, 800);
        return;
      }

      // 2️⃣ code 필드 중복 확인
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", meetCode));

      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        setMeetCodeError(true);
        setDupicationMsg(DUPLICATION.code.error)
        setTimeout(() => {
          setMeetCodeError(false);
          setDupicationMsg("")
        }, 800);
        return;
      }

      // ✅ 중복 없을 때만 저장
      await setDoc(docRef, {
        name: meetName,
        code: meetCode,
        edit: editCode,
        createdAt: new Date()
      });
      setDupicationMsg(DUPLICATION.success)
      setTimeout(() => {
        setMeetCodeError(false);
        setDupicationMsg("")
      }, 800);
      openModal("ModalNotice", {
        title : "방 저장 완료",
        onlyConfirm : true,
        openPopUp : openPopUp,
        setOpenPopUp : setOpenPopUp
      })
      console.log("✅ 방 저장 완료:", customId);
    } catch (e) {
      console.error("❌ Error setting document:", e);
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault(); // 폼 제출 막기 (필요시)
  }

  return (
    <Motion.form
      onSubmit={(e) => handleSubmit(e)}
      className={`
      ${openPopUp ? "" : "justify-start cursor-pointer"}
      fixed flex flex-col max-w-2xl gap-5 overflow-hidden rounded-lg`}
      initial={false}
      animate={openPopUp ? "open" : "closed"}
      whileTap={openPopUp ? "open" : { y: 5 }}
      variants={{
        open: {
          width: "85%",
          top: "30%",
          height: "400px",
          backgroundColor: "var(--color-main-bg)",
          transition: {
            width: { duration: 0.3, delay: 0.2 },
            height: { duration: 0.2, delay: 0.3 },
            top: { duration: 0.3 },
            backgroundColor: { duration: 0.1, delay: 0.3 },
          },
        },
        closed: {
          width: "200px",
          top: "85%",
          height: "50px",
          lineHeight: "50px",
          backgroundColor: "var(--color-active-color)",
          transition: {
            width: { duration: 0.3 },
            height: { duration: 0.3 },
            top: { duration: 0.3, delay: 0.3 }
          },
        }
      }}
    >
      {/* 모임 제목 */}
      <div className="flex flex-col gap-2">
        <Motion.h2
          onClick={() => makeDetails()}
          initial={false}
          animate={openPopUp ? "open" : "closed"}
          variants={{
            open: {
              fontSize: "1.875rem",
              color: "var(--color-main-text)",
              transition: {
                color: { delay: 0.3 }
              },
            },
            closed: {
              fontSize: "1.275rem",
              color: "#ffffff",
              transition: {},
            }
          }}
          className="text-main-text text-center">모임 {openPopUp ? "제목" : "등록 +"}
        </Motion.h2>
        <Motion.input
          initial={false}
          animate={meetNameError ? "error" : ""}
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
          value={meetName}
          onChange={(e) => changeMeetName(e.target.value)}
          className={`${meetNameError ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color"}
          focus:border-active-color focus:outline-0 h-14 text-xl text-main-text placeholder:text-lg placeholder:font-money border-[6px] px-2 border-main-color rounded-lg`}
          type="text" maxLength="11" placeholder={meetNamePlaceholder}/>
      </div>
      {/* 입장 코드 */}
      <div className="flex items-center gap-2">
        <h2 className="text-main-text text-2xl">입장 코드</h2>
        <Motion.input
          initial={false}
          animate={meetCodeError ? "error" : ""}
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
          className={`${meetCodeError ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color"}
          focus:border-active-color focus:outline-0 flex-1 w-full text-main-text placeholder:font-money border-[6px] h-14 px-2 border-main-color rounded-lg`}
          inputMode="numeric" pattern="[0-9]*" maxLength="16" placeholder={meetCodePlaceholder}
          value={meetCode}
          onChange={(e) => changeMeetCode(e.target.value)}
        />
      </div>
      {/* 수정 코드 */}
      <div className="flex items-center gap-2">
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
          className={`${editCodeError ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color"}
          focus:border-active-color focus:outline-0 flex-1 w-full text-main-text placeholder:font-money border-[6px] h-14 px-2 border-main-color rounded-lg`}
          inputMode="numeric" pattern="[0-9]*" maxLength="16" placeholder={editCodePlaceholder}
          value={editCode}
          onChange={(e) => changeEditCode(e.target.value)}
        />
      </div>
      {/* 버튼 */}
      <Motion.div
        initial={false}
        animate={openPopUp ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.3, delay: 0.3
            },
          },
          closed: {
            opacity: 0,
            y: 5,
            transition: {
              duration: 0.3
            },
          }
        }}
        className="text-main-text flex justify-between"
      >
        <Motion.button
          whileTap={{ y: 5 }}
          className="px-1 py-2 w-32 text-2xl border-[6px] border-main-color rounded-lg"
          type="button"
          onClick={() => goHome()}>등록 취소
        </Motion.button>
        <Motion.button
          disabled={meetNameError}
          whileTap={{ y: 5 }}
          onClick={() => addMeeting()}
          type="submit"
          className="px-1 py-2 w-32 text-2xl bg-main-color text-white rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              등록중
              <span
                className="animate-spin w-5 aspect-square border-4 border-white rounded-full border-t-main-color">
              </span>
            </div>
          ) : (
            <span>등록</span>
          )}
        </Motion.button>
      </Motion.div>
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
    </Motion.form>
  )
}

export default MakeMoneyDetails;