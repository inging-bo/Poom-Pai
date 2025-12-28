import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase.ts";
import MakeMoneyDetails from "@/view/MakeMoneyDetails.tsx";
import { DUPLICATION, HOMEINPUT } from "@/constant/contant.ts";
import { cn } from "@/lib/utils.ts";

type CodeInput = string;

function Home() {

  // 코드 입력 input 값
  const [inputCode, setInputCode] = useState<CodeInput>('')

  // 코드 입력 값 placeholder
  const [placeholder, setPlaceholder] = useState(HOMEINPUT.placeHolder.normal)

  // 빈 값 체크
  const [emptyValue, setEmptyValue] = useState(false)

  // 확인 후 표시 값
  const [checkResult, setCheckResult] = useState("")

  const navigate = useNavigate()

  // 입력값 변경 핸들러
  const changeInputValue = (value: CodeInput) => {
    if (value.length > 15) {
      triggerError(DUPLICATION.edit.limit);
      return;
    }

    // 빈 문자열 허용
    if (value === "" || /^[0-9]*$/.test(value)) {
      setInputCode(value); // 문자열 그대로 저장
      setEmptyValue(false);
      setCheckResult("");
    }
  };

  // 에러 발생 시 공통 처리 함수
  const triggerError = (message: string, isPlaceholder = false) => {
    setEmptyValue(true);
    if (isPlaceholder) {
      setPlaceholder(message);
    } else {
      setCheckResult(message);
    }

    setTimeout(() => {
      setEmptyValue(false);
      if (isPlaceholder) setPlaceholder(HOMEINPUT.placeHolder.normal);
      else setCheckResult("");
    }, 600);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (inputCode === "") {
      triggerError(HOMEINPUT.placeHolder.empty, true);
      return;
    }

    try {
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", inputCode));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        console.log("✅ 입장 성공:", inputCode);
        navigate(`/money-details/${inputCode}`);
      } else {
        triggerError(HOMEINPUT.notice.noExist);
      }
    } catch (e) {
      console.error("❌ Error fetching document:", e);
    }
  };

  return (
    <Motion.div
      className="flex flex-col h-dvh overflow-hidden justify-center items-center max-w-xl my-0 mx-auto"
    >
      <div className="absolute top-1/4 text-main-color text-5xl">Poom-Pai</div>
      <form onSubmit={(e) => handleSubmit(e)} className="relative flex w-full px-4 flex-col gap-4 bg-main-bg ">
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
              transition: {
                borderColor: {
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 1] // 단계별 색상 타이밍
                },
              }
            },
          }}
          className={cn("input-primary",
            emptyValue ? "placeholder:text-[#f87171]" : "placeholder:text-sub-color"
            )}
          value={inputCode}
          onChange={(e: ChangeEvent<HTMLInputElement>) => changeInputValue(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          name="checkCode"
          placeholder={placeholder}
          />
        <Motion.button
          whileTap={{ y: 5 }}
          className={cn("btn-primary")}
          type="submit"
        >
          입장하기
        </Motion.button>
      </form>
      <MakeMoneyDetails />
    </Motion.div>
  );
}

export default Home;