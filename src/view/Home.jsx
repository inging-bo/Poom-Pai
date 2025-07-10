import { useNavigate } from "react-router-dom";
import MakeMoneyDetails from "./MakeMoneyDetails.jsx";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase.js";
import { DUPLICATION, HOMEINPUT } from "../constant/contant.js";

function Home() {
  
  
  const [inputCode, setInputCode] = useState('')
  
  const [placeholder, setPlaceholder] = useState(HOMEINPUT.placeHolder.normal)
  const [emptyValue, setEmptyValue] = useState(false)
  const [checkResult, setCheckResult] = useState("")
  
  const navigate = useNavigate()
  
  const goList = (inputCode) => {
    checkCode(inputCode)
  }
  
  /* 모임 등록 시 */
  async function checkCode(inputCode) {
    if (inputCode === "") {
      setEmptyValue(true)
      setPlaceholder(HOMEINPUT.placeHolder.empty)
      
      setTimeout(() => {
        setEmptyValue(false)
        setPlaceholder(HOMEINPUT.placeHolder.normal)
      }, 600)
      return;
    }
    
    try {
      // 2️⃣ code 필드 중복 확인
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", inputCode.toString()));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        navigate(`/money-details/${inputCode}`)
      } else {
        setCheckResult(HOMEINPUT.notice.noExist)
        setEmptyValue(true)
        
        setTimeout(() => {
          setEmptyValue(false)
          setCheckResult("")
        }, 600)
        return;
      }
      console.log("✅ 입장 성공:", inputCode);
    } catch (e) {
      console.error("❌ Error setting document:", e);
    }
  }
  
  const changeInputValue = (value) => {
    // 문자열인 value를 숫자로 변환
    const numberValue = Number(value)
    
    // 숫자가 아니면 무시
    if (isNaN(numberValue)) return
    if (value.length > 15) {
      setEmptyValue(true);
      setCheckResult(DUPLICATION.edit.limit);
      setTimeout(() => {
        setEmptyValue(false);
      }, 600)
      return
    } else {
      setEmptyValue(false);
      setCheckResult("");
    }
    // 값이 숫자일 경우 상태 업데이트
    setInputCode(numberValue)
  }
  
  function handleSubmit(event) {
    event.preventDefault(); // 폼 제출 막기 (필요시)
  }
  
  return (
    <Motion.div
      className="relative touch-none min-h-svh w-screen max-w-xl my-0 mx-auto flex gap-2 flex-col justify-center items-center"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.4 }}
    >
      <div className="fixed top-1/5 text-main-color text-5xl">Poom-Pai</div>
      <form onSubmit={(e) => handleSubmit(e)} className="relative flex flex-col w-3/4 gap-4 bg-main-bg ">
        <AnimatePresence>
          {checkResult && (
            <Motion.span
              key="checkResult"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { delay: 0.4 } }} // ✅ exit에 직접 transition 명시
              transition={{ opacity: { duration: 0.4 } }} // ✅ animate용
              className="absolute bottom-[105%] left-0 right-0 text-center text-lg text-red-600"
            >
              {checkResult}
            </Motion.span>
          )}
        </AnimatePresence>
        <Motion.input
          initial={false}
          animate={emptyValue ? "error" : ""}
          variants={{
            error: {
              borderColor: ["#f87171", "var(--color-main-color)"], // 빨강 ↔ 검정 반복
              transition : {
                borderColor: {
                  duration: 0.6,
                  ease    : "easeInOut",
                  times   : [0, 1] // 단계별 색상 타이밍
                },
              }
            },
          }}
          className={`${emptyValue ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color"}
            focus:border-active-color focus:outline-0 border-main-color placeholder:font-money border-[6px] h-14 text-xl px-2 rounded-lg`}
          value={inputCode}
          onChange={(e) => changeInputValue(e.target.value)}
          inputMode="numeric" pattern="[0-9]*" name="checkCode" placeholder={placeholder}/>
        <Motion.button
          whileTap={{ y: 5 }}
          className="tracking-wide bg-main-color text-2xl text-white rounded-lg h-14 cursor-pointer"
          onClick={() => goList(inputCode)}
          type="submit"
          value="Sign in">입장하기
        </Motion.button>
      </form>
      <MakeMoneyDetails/>
    </Motion.div>
  )
}

export default Home;