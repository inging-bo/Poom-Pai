import { AnimatePresence, motion as Motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { PLACEHOLDERS, ERRORS } from "@/constant/contant.ts";
import { useModalStore } from "@/store/modalStore.ts";
import { useDataStore, type MeetFormData } from "@/store/useDataStore.ts";
import { cn } from "@/lib/utils.ts";
import { useTimeout } from "@/hooks/useTimeout.ts";

// MeetFormData의 키값을 유동적으로 사용하기 위한 타입
type FieldKey = keyof MeetFormData;

const RECOVERY_MAP: Record<FieldKey, string> = {
  meetTitle: PLACEHOLDERS.MEET_NAME,
  meetEntryCode: PLACEHOLDERS.NEED_IN,
  meetEditCode: PLACEHOLDERS.NEED_EDIT
};

function CreateMeet() {
  const { openModal } = useModalStore();
  const { createMeet } = useDataStore();

  const [openPopUp, setOpenPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicationMsg, setDuplicationMsg] = useState("");

  // 스토어 공통 타입을 활용한 상태 관리
  const [formData, setFormData] = useState<MeetFormData>({
    meetTitle: "",
    meetEntryCode: "",
    meetEditCode: ""
  });

  // 에러 및 플레이스홀더 상태 관리
  const [errors, setErrors] = useState<Record<FieldKey, boolean>>({
    meetTitle: false, meetEntryCode: false, meetEditCode: false
  });

  const [placeholderState, setPlaceholderState] = useState<Record<FieldKey, string>>({
    meetTitle: PLACEHOLDERS.MEET_NAME,
    meetEntryCode: PLACEHOLDERS.NEED_IN,
    meetEditCode: PLACEHOLDERS.NEED_EDIT
  });

  // 0.8초 후 실행될 리셋 로직 (인자 전달 버전 훅 사용)
  const resetErrorState = useTimeout((info: { key: FieldKey; isToast: boolean }) => {
    const { key, isToast } = info;

    // 에러 흔들림 효과 해제
    setErrors(prev => ({ ...prev, [key]: false }));

    // 토스트 메시지 제거
    if (isToast) setDuplicationMsg("");

    // 플레이스홀더를 다시 원래의 친절한 안내 문구로 복구
    setPlaceholderState(prev => ({
      ...prev,
      [key]: RECOVERY_MAP[key]
    }));
  }, 800);

  // 입력 핸들러
  const handleInputChange = (key: FieldKey, value: string) => {
    // 숫자 전용 필드 예외 처리
    if ((key === "meetEntryCode" || key === "meetEditCode") && value !== "" && isNaN(Number(value))) return;

    // 글자수 제한 체크 (이름 10, 코드 15)
    const limit = key === "meetTitle" ? 10 : 15;
    if (value.length > limit) {
      triggerError(key, key === "meetTitle" ? ERRORS.LIMIT_NAME : ERRORS.LIMIT_CODE);
      return;
    }

    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: false }));
    setDuplicationMsg("");
  };

  // 에러 발생 시 시각적 효과 트리거
  const triggerError = (key: FieldKey, message: string, isToast = true) => {
    // 즉시 에러 상태로 변경
    setErrors(prev => ({ ...prev, [key]: true }));
    if (isToast) setDuplicationMsg(message);

    // 만약 입력 누락 에러라면 플레이스홀더에 직접 경고문 표시
    if (message.includes("비었습니다") || message.includes("입력")) {
      setPlaceholderState(prev => ({ ...prev, [key]: message }));
    }

    resetErrorState({ key, isToast });
  };

  // 등록 로직
  const saveData = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 빈 값 1차 검증
    if (!formData.meetTitle) return triggerError("meetTitle", PLACEHOLDERS.EMPTY_NAME, false);
    if (!formData.meetEntryCode) return triggerError("meetEntryCode", PLACEHOLDERS.EMPTY_CODE, false);
    if (!formData.meetEditCode) return triggerError("meetEditCode", PLACEHOLDERS.EMPTY_CODE, false);

    try {
      setIsLoading(true);

      // 스토어 액션 호출 (중복 확인 및 저장 수행)
      const result = await createMeet(formData);

      if (result.success) {
        openModal("ModalNotice", {
          title: result.message, // SUCCESS.CREATE
          onConfirm: () => {
            setOpenPopUp(false);
            setFormData({ meetTitle: "", meetEntryCode: "", meetEditCode: "" });
          }
        });
      } else {
        // 중복 등 에러 처리
        const errorField = result.message.includes("이름") ? "meetTitle" : "meetEntryCode";
        triggerError(errorField, result.message);
      }
    } catch (error) {
      console.error(error);
      setDuplicationMsg(ERRORS.SAVE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Motion.form
      onSubmit={saveData}
      className={cn(
        "absolute flex max-w-2xl gap-3 overflow-hidden rounded-lg z-20 transition-all shadow-xl",
        openPopUp ? "flex-col border-6 border-main-color p-6 bg-white" : "items-center cursor-pointer bg-active-color hover:bg-active-color-hover active:bg-active-color-active active:scale-98 transition-colors"
      )}
      initial="closed"
      animate={openPopUp ? "open" : "closed"}
      variants={formVariants}
    >
      {/* 제목 영역 */}
      <div className={cn("flex flex-col w-full gap-2 px-2", !openPopUp && "h-full")}>
        <Motion.h2
          onClick={() => !openPopUp && setOpenPopUp(true)}
          className={cn(
            "text-center transition-colors",
            openPopUp
              ? "text-main-text text-2xl"
              : "flex items-center justify-center text-xl text-white w-full h-full"
          )}
        >
          {openPopUp ? "모임 정보 등록" : "모임 등록 +"}
        </Motion.h2>

        {openPopUp && (
          <Motion.input
            animate={errors.meetTitle ? "error" : ""}
            variants={inputErrorVariants}
            value={formData.meetTitle}
            onChange={(e) => handleInputChange("meetTitle", e.target.value)}
            className={cn("input-primary", errors.meetTitle && "border-red-500")}
            placeholder={placeholderState.meetTitle}
          />
        )}
      </div>

      {/* 팝업 활성화 시 추가 입력창 영역 */}
      {openPopUp && (
        <div className="flex flex-col gap-4 w-full px-2">
          {(["meetEntryCode", "meetEditCode"] as const).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <h2 className="text-main-text text-xl w-24 shrink-0">
                {key === "meetEditCode" ? "수정" : "입장"} 코드
              </h2>
              <Motion.input
                animate={errors[key] ? "error" : ""}
                variants={inputErrorVariants}
                className={cn("input-primary flex-1 min-w-0", errors[key] && "border-red-500")}
                inputMode="numeric"
                value={formData[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={placeholderState[key]}
              />
            </div>
          ))}

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary active:scale-98 transition-transform"
            >
              {isLoading ? "등록 중..." : "등록하기"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenPopUp(false);
                setDuplicationMsg("");
              }}
              className="btn-secondary active:scale-98 transition-transform"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 애니메이션 */}
      <AnimatePresence>
        {duplicationMsg && (
          <Motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-red-600 mt-2"
          >
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
    transition: { staggerChildren: 0.1 }
  },
  closed: { width: "200px", top: "85%", height: "50px" }
};

/* input 에러가 있을 경우 */
const inputErrorVariants = {
  error: { borderColor: ["#f87171", "var(--color-main-color)"], transition: { duration: 0.6 } }
};

export default CreateMeet;