import { motion as Motion } from "framer-motion";
import { createInitialDetail, createInitialHistory, createInitialPerson, useDataStore } from "@/store/useDataStore.ts";
import { cn } from "@/lib/utils.ts";
import { MapPlus, UserPlus } from "lucide-react"; // 아이콘 라이브러리 추가

interface AddBtnProps {
  label: string;
  type: "person" | "history" | "detail";
  placeId?: string;
  propsClass?: string;
}

const AddBtn = ({ label, type, placeId, propsClass }: AddBtnProps) => {
  const { people, useHistory, updatePeople, updateHistory } = useDataStore();

  const variants = {
    // 인원 추가 (모바일에서 우측 하단 FAB 형태)
    person: cn(
      "p-3 h-fit z-60 text-sm border-2 bg-main-color/5 hover:bg-main-color/10",
      "max-sm:fixed max-sm:bottom-[calc(48px+env(safe-area-inset-bottom))] max-sm:right-4 max-sm:size-12 max-sm:rounded-full max-sm:flex max-sm:items-center max-sm:justify-center max-sm:bg-main-color max-sm:text-white max-sm:shadow-lg max-sm:border-none max-sm:mb-2"
    ),

    // 장소 추가 (모바일에서 우측 하단 FAB 형태, 인원 추가와 겹치지 않게 bottom 조정 필요할 수 있음)
    history: cn(
      "p-3 h-fit z-60 text-sm border-2 bg-main-color/5 hover:bg-main-color/10",
      "max-sm:fixed max-sm:bottom-[calc(48px+env(safe-area-inset-bottom))] max-sm:right-4 max-sm:size-12 max-sm:rounded-full max-sm:flex max-sm:items-center max-sm:justify-center max-sm:bg-main-color max-sm:text-white max-sm:shadow-lg max-sm:border-none max-sm:mb-2"
    ),

    // 세부 항목 추가
    detail: "px-2 py-1 text-xs border font-money font-normal text-sm rounded-md text-white hover:bg-active-color/90 bg-active-color/80 border-none"
  };

  const currentVariant = variants[type] || variants.person;

  const handleAdd = () => {
    if (type === "person") {
      updatePeople([...people, createInitialPerson()]);
    } else if (type === "history") {
      updateHistory([...useHistory, createInitialHistory()]);
    } else if (type === "detail" && placeId) {
      updateHistory(useHistory.map(h => h.placeId === placeId ? {
        ...h,
        placeDetails: [...h.placeDetails, createInitialDetail()]
      } : h));
    }
  };

  return (
    <Motion.div
      whileTap={{ scale: 0.9 }}
      onClick={handleAdd}
      className={cn(
        "w-full text-center font-bold text-main-color border-dashed border-main-color/30 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1",
        currentVariant,
        propsClass
      )}
    >
      {/* 아이콘: 모바일에서는 크게 보이게, 데스크탑에서는 텍스트 옆에 작게 */}
      {/*<Plus className={cn("shrink-0", type === "person" ? "w-3 h-3" : "hidden w-5 h-5 max-sm:w-7 max-sm:h-7")} />*/}
      {type === "person" && (
        <UserPlus className={cn("shrink-0 size-5 max-sm:size-7")} />
      )}
      {type === "history" && (
        <MapPlus className={cn("shrink-0 size-5 max-sm:size-7")} />
      )}
      {/* 텍스트: 모바일(sm 미만)에서 person/history 타입일 때만 숨김 */}
      <span className={cn(
        type !== "detail" && "max-sm:hidden"
      )}>
        {label} +
      </span>
    </Motion.div>
  );
};

export default AddBtn;