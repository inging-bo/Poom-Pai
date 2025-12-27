import { AnimatePresence, motion as Motion } from "framer-motion";
import { useState, type FormEvent, } from "react";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { DUPLICATION, PLACEHOLDERS } from "../constant/contant.js";
import { useModalStore } from "../store/modalStore.js";
import { db } from "../../firebase";
import { cn } from "@/lib/utils.ts";

// 폼 데이터 타입 정의
interface FormData {
  name: string;
  code: string;
  edit: string;
}

type FieldKey = keyof FormData;

function MakeMoneyDetails() {
  const { openModal } = useModalStore();
  const [openPopUp, setOpenPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicationMsg, setDupicationMsg] = useState("");

  // 1. 통합 폼 상태
  const [formData, setFormData] = useState<FormData>({ name: "", code: "", edit: "" });

  // 2. 통합 에러 상태 (어떤 필드에 에러가 있는지 boolean으로 관리)
  const [errors, setErrors] = useState<Record<FieldKey, boolean>>({
    name: false, code: false, edit: false
  });

  // 3. 통합 플레이스홀더 상태
  const [placeholders, setPlaceholders] = useState<Record<FieldKey, string>>({
    name: PLACEHOLDERS.name.normal,
    code: PLACEHOLDERS.code.normal,
    edit: PLACEHOLDERS.edit.normal
  });

  // 공통 입력 핸들러
  const handleInputChange = (key: FieldKey, value: string) => {
    // 숫자 전용 필드 체크 (code, edit)
    if ((key === "code" || key === "edit") && value !== "" && isNaN(Number(value))) return;

    // 길이 제한 체크
    const limit = key === "name" ? 10 : 15;
    if (value.length > limit) {
      triggerError(key, DUPLICATION[key].limit);
      return;
    }

    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: false }));
    setDupicationMsg("");
  };

  // 공통 에러 트리거
  const triggerError = (key: FieldKey, message: string, isToast = true) => {
    setErrors(prev => ({ ...prev, [key]: true }));
    if (isToast) setDupicationMsg(message);

    // 에러 메시지가 플레이스홀더인 경우 (빈 값 체크 시)
    if (message.includes("입력")) {
      setPlaceholders(prev => ({ ...prev, [key]: message }));
    }

    setTimeout(() => {
      setErrors(prev => ({ ...prev, [key]: false }));
      if (isToast) setDupicationMsg("");
      setPlaceholders(prev => ({ ...prev, [key]: PLACEHOLDERS[key].normal }));
    }, 800);
  };

  // 저장 로직
  const saveData = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 빈 값 검증
    const emptyKeys = (Object.keys(formData) as FieldKey[]).filter(key => !formData[key]);
    if (emptyKeys.length > 0) {
      emptyKeys.forEach(key => triggerError(key, PLACEHOLDERS[key].error, false));
      return;
    }

    try {
      setIsLoading(true);

      // 1️⃣ ID(모임명) 중복 확인
      const docRef = doc(db, "MeetList", formData.name);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        triggerError("name", DUPLICATION.name.error);
        return;
      }

      // 2️⃣ 입장 코드 중복 확인
      const q = query(collection(db, "MeetList"), where("code", "==", formData.code));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        triggerError("code", DUPLICATION.code.error);
        return;
      }

      // ✅ 데이터 저장
      await setDoc(docRef, {
        ...formData,
        createdAt: new Date()
      });

      openModal("ModalNotice", {
        title: "방 저장 완료",
        onlyConfirm: true,
        openPopUp,
        setOpenPopUp
      });

    } catch (e) {
      console.error("❌ 저장 에러:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Motion.form
      onSubmit={saveData}
      className={cn("absolute flex max-w-2xl gap-3 overflow-hidden rounded-lg",
        openPopUp ? "flex-col" : "items-center cursor-pointer"
      )}
      initial="closed"
      animate={openPopUp ? "open" : "closed"}
      variants={formVariants}
    >
      {/* 모임 제목 섹션 */}
      <div className={cn("flex flex-col w-full gap-2 px-4",
        openPopUp
          ? ""
          : "h-full"
      )}
      >
        <Motion.h2
          onClick={() => !openPopUp && setOpenPopUp(true)}
          className={cn("text-center",
            openPopUp
              ? "text-main-text text-2xl sm:text-3xl"
              : "flex items-center justify-center text-xl text-white w-full h-full"
          )}
        >
          모임 {openPopUp ? "제목" : "등록 +"}
        </Motion.h2>

        {openPopUp && (
          <Motion.input
            animate={errors.name ? "error" : ""}
            variants={inputErrorVariants}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`input-primary placeholder:text-lg sm:placeholder:text-xl ${errors.name ? "text-red-600" : ""}`}
            placeholder={placeholders.name}
          />
        )}
      </div>

      {openPopUp && (
        <div className="px-4 flex flex-col gap-4">
          {(["code", "edit"] as const).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <h2 className="text-main-text text-2xl w-fit shrink-0">{key === "code" ? "입장" : "수정"} 코드</h2>
              <Motion.input
                animate={errors[key] ? "error" : ""}
                variants={inputErrorVariants}
                className={`input-primary flex-1 min-w-0 placeholder:text-lg sm:placeholder:text-xl ${errors[key] ? "text-red-600" : ""}`}
                inputMode="numeric"
                value={formData[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={placeholders[key]}
              />
            </div>
          ))}

          {/* 하단 버튼 및 메시지 영역 */}
          <div className="flex flex-col gap-2 justify-between">
            <button type="submit" disabled={isLoading} className="flex-1 py-1 btn-primary">
              {isLoading ? "등록중..." : "등록"}
            </button>
            <button type="button" onClick={() => setOpenPopUp(false)} className="flex-1 py-1 btn-secondary">등록 취소</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {duplicationMsg && (
          <Motion.span key="msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                       className="text-center text-red-600">
            {duplicationMsg}
          </Motion.span>
        )}
      </AnimatePresence>
    </Motion.form>
  );
}

// 전체 모달 창 키고 닫을 때
const formVariants = {
  open: {
    width: "100%",
    top: "50%",
    y: "-50%",
    height: "auto",
    backgroundColor: "var(--color-main-bg)",
    transition: { staggerChildren: 0.1 }
  },
  closed: { width: "200px", top: "85%", height: "50px", backgroundColor: "var(--color-active-color)" }
};

/* input 에러가 있을 경우 */
const inputErrorVariants = {
  error: { borderColor: ["#f87171", "var(--color-main-color)"], transition: { duration: 0.6 } }
};

export default MakeMoneyDetails;