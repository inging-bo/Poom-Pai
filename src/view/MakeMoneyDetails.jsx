import { AnimatePresence, motion as Motion } from "framer-motion";
import { useState } from "react";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js"; // 위에서 만든 firebase.js

function MakeMoneyDetails() {
  const goHome = () => {
    setOpenModal(false)
  }
  /* 모임 등록 모달 온 오프 */
  const [openModal, setOpenModal] = useState(false)
  const makeDetails = () => {
    setOpenModal(true)
  }

  /* 모임 제목 내용 */
  const [meetName, setMeetName] = useState('')
  const [meetNamePlaceholder, setMeetNamePlaceholder] = useState("모임 제목을 입력하세요");
  const [meetNameError, setMeetNameError] = useState(false)
  const changeMeetName = (value) => {
    setMeetName(value)
  }

  /* 입장 코드 */
  const [meetCode, setMeetCode] = useState('')
  const [meetCodePlaceholder, setMeetCodePlaceholder] = useState("ex) 123");
  const [meetCodeError, setMeetCodeError] = useState(false)
  const changeMeetCode = (inputValue) => {
    let value = Number(inputValue)

    if (isNaN(value)) return

    setMeetCode(inputValue)
  }

  /* 모임 등록 */
  const addMeeting = () => {
    saveData(meetName, meetCode)
  }


  // ✅ 에러 메시지와 기본 메시지를 상수로 관리
  const PLACEHOLDERS = {
    name: {
      error: "모임 제목이 비었습니다.",
      normal: "모임 제목을 입력하세요.",
    },
    code: {
      error: "입장 코드를 입력해주세요",
      normal: "ex) 123",
    },
  };

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
    }
  }

  /* 중복된 이름 or 코드 */
  const DUPLICATION = {
    name: {
      error: "사용중인 이름 입니다.",
    },
    code: {
      error: "사용중인 코드 입니다.",
    },
  };

  const [duplicationMsg, setDupicationMsg] = useState("ffff")

  function triggerDuplicationError(type) {
    // if (type === "name") {
    //   setMeetNameError(true);
    //   setMeetNamePlaceholder(PLACEHOLDERS.name.error);
    //   setTimeout(() => {
    //     setMeetNameError(false);
    //     setMeetNamePlaceholder(PLACEHOLDERS.name.normal);
    //   }, 600);
    // } else if (type === "code") {
    //   setMeetCodeError(true);
    //   setMeetCodePlaceholder(PLACEHOLDERS.code.error);
    //   setTimeout(() => {
    //     setMeetCodeError(false);
    //     setMeetCodePlaceholder(PLACEHOLDERS.code.normal);
    //   }, 600);
    // }
  }

  /* 모임 등록 시 */
  async function saveData(meetName, meetCode) {
    if (meetName === '' && meetCode === '') {
      triggerInputError("name");
      triggerInputError("code");
      return;
    }

    if (meetName === '') {
      triggerInputError("name");
      return;
    }

    if (meetCode === '') {
      triggerInputError("code");
      return;
    }

    try {
      const customId = meetName;
      // 1️⃣ ID 중복 확인 (문서 ID가 이미 존재하는지)
      const docRef = doc(db, "MeetList", customId);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.exists())
      if (docSnap.exists()) {
        setMeetNameError(true);
        setDupicationMsg(DUPLICATION.name.error)
        setTimeout(() => {
          setMeetNameError(false);
          setDupicationMsg("")
        }, 600);
        return;
      }

      // 2️⃣ code 필드 중복 확인
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", meetCode));
      console.log(q)
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        setMeetCodeError(true);
        setDupicationMsg(DUPLICATION.code.error)
        setTimeout(() => {
          setMeetCodeError(false);
          setDupicationMsg("")
        }, 600);
        return;
      }

      // ✅ 중복 없을 때만 저장
      await setDoc(docRef, {
        name: meetName,
        code: meetCode,
        createdAt: new Date()
      });

      console.log("✅ 방 저장 완료:", customId);
    } catch (e) {
      console.error("❌ Error setting document:", e);
    }
  }

  return (
    <Motion.div
      className={`
      ${openModal ? "" : "justify-start cursor-pointer"}
      fixed flex flex-col max-w-2xl gap-5 overflow-hidden rounded-lg`}
      initial={false}
      animate={openModal ? "open" : "closed"}
      whileTap={openModal ? "open" : { y: 5 }}
      variants={{
        open: {
          width: "85%",
          top: "30%",
          height: "350px",
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
          minHeight: "unset",
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
          animate={openModal ? "open" : "closed"}
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
          className="text-main-text text-center">모임 {openModal ? "제목" : "등록 +"}
        </Motion.h2>
        <Motion.input
          initial={false}
          animate={meetNameError ? "error" : ""}
          variants={{
            error: {
              y: [0, -2, 2, -2, 2, 0],
              borderColor: ["#f87171", "var(--color-main-color)"], // 빨강 ↔ 검정 반복
              transition: {
                y: { duration: 0.4, ease: "easeInOut" },
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
          h-14 text-xl text-main-text placeholder:text-lg placeholder:font-money border-[6px] px-2 border-main-color rounded-lg`}
          type="text" minLength="8" placeholder={meetNamePlaceholder} required/>
      </div>
      {/* 입장 코드 */}
      <div className="flex items-center gap-2">
        <h2 className="text-main-text text-2xl">입장 코드</h2>
        <Motion.input
          initial={false}
          animate={meetCodeError ? "error" : ""}
          variants={{
            error: {
              y: [0, -2, 2, -2, 2, 0],
              borderColor: ["#f87171", "var(--color-main-color)"], // 빨강 ↔ 검정 반복
              transition: {
                y: { duration: 0.4, ease: "easeInOut" },
                borderColor: {
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 1] // 단계별 색상 타이밍
                },
              }
            },
          }}
          className={`${meetCodeError ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color"}
          flex-1 w-full text-main-text placeholder:font-money border-[6px] h-14 px-2 border-main-color rounded-lg`}
          inputMode="numeric" pattern="[0-9]*" minLength="8" placeholder={meetCodePlaceholder} required
          value={meetCode}
          onChange={(e) => changeMeetCode(e.target.value)}
        />
      </div>
      {/* 버튼 */}
      <Motion.div
        initial={false}
        animate={openModal ? "open" : "closed"}
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
          onClick={() => goHome()}>등록 취소
        </Motion.button>
        <Motion.button
          disabled={meetNameError}
          whileTap={{ y: 5 }}
          onClick={() => addMeeting()}
          className="px-1 py-2 w-32 text-2xl bg-main-color text-white rounded-lg">등록
        </Motion.button>
      </Motion.div>
      <div
        className="text-center h-10 overflow-hidden mt-2 font-money text-2xl text-red-600"
      >
        <AnimatePresence>
          {duplicationMsg && (
            <Motion.span
              key="duplicationMsg"
              initial={{ y: "100%" }}
              animate={{ y: "-100%" }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="h-10"
            >{duplicationMsg}</Motion.span>
          )}
        </AnimatePresence>
      </div>
    </Motion.div>
  )
}

export default MakeMoneyDetails;