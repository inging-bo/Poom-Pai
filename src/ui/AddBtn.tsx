import { motion as Motion } from "framer-motion";
import { createInitialDetail, createInitialHistory, createInitialPerson, useDataStore } from "@/store/useDataStore.ts";
import { cn } from "@/lib/utils.ts";

interface AddBtnProps {
  label: string;
  type: "person" | "history" | "detail";
  placeId?: string; // 세부 항목 추가 시 어떤 장소인지 식별하기 위해 필요
  className?: string; // 추가적인 커스텀 스타일이 필요할 경우 사용
}

const AddBtn = ({ label, type, placeId, className }: AddBtnProps) => {
  const { people, useHistory, updatePeople, updateHistory } = useDataStore();

  // 버튼 타입별 스타일 정의
  const variants = {
    // 인원 및 장소 추가 (큰 버튼)
    default: "p-3 h-fit text-sm border-2 bg-main-color/5 hover:bg-main-color/10",
    // 세부 항목 추가 (작고 얇은 버튼)
    detail: "py-2 text-xs border bg-transparent hover:bg-gray-50"
  };

  const currentVariant = type === "detail" ? variants.detail : variants.default;

  const handleAdd = () => {
    if (type === "person") {
      // 인원 추가 로직
      updatePeople([...people, createInitialPerson()]);
    } else if (type === "history") {
      // 장소 추가 로직
      updateHistory([...useHistory, createInitialHistory()]);
    } else if (type === "detail" && placeId) {
      // 세부 항목 추가 로직
      updateHistory(useHistory.map(h => h.placeId === placeId ? {
        ...h,
        placeDetails: [...h.placeDetails, createInitialDetail()]
      } : h));
    }
  };

  return (
    <Motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleAdd}
      className={cn(
        // 공통 스타일
        "w-full text-center font-bold text-main-color border-dashed border-main-color/30 rounded-xl cursor-pointer transition-colors",
        // 타입별 스타일 적용
        currentVariant,
        className
      )}
    >
      {label} +
    </Motion.div>
  );
};

export default AddBtn;