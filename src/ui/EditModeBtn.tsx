import { cn } from "@/lib/utils.ts";
import { CircleCheck, Edit3 } from "lucide-react";
import { useDataStore } from "@/store/useDataStore.ts";

/* 기본 / 수정 모드 변경 버튼 */
const EditModeBtn = ({ propsClass, onClick }: { propsClass: string, onClick: () => void }) => {

  const { isLoading, isEdit } = useDataStore()

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-sm active:scale-95 cursor-pointer",
        isEdit
          ? "bg-white text-main-color"
          : "bg-main-color text-white border border-main-color/20",
        propsClass
      )}
    >
      {isEdit ? <CircleCheck size={18} /> : <Edit3 size={18} />}
      <span>{isLoading ? "처리 중..." : (isEdit ? "수정완료" : "수정하기")}</span>
    </button>

  )
};

export default EditModeBtn;