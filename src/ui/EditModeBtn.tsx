import { cn } from "@/lib/utils.ts";
import { CircleCheck, Edit3 } from "lucide-react";
import { useDataStore } from "@/store/useDataStore.ts";
import { useModalStore } from "@/store/modalStore.ts";

/* 기본 / 수정 모드 변경 버튼 */
const EditModeBtn = ({ propsClass }: { propsClass: string }) => {

  const { isLoading, isEdit, saveAllData } = useDataStore()
  const { openModal } = useModalStore();

  const handleEditMode = () => {
    if (!isEdit) {
      openModal("ModalEditMode", {});
    } else {
      openModal("ModalNotice", {
        title: "수정을 종료 하시겠습니까?",
        showCancel: true,
        onConfirm: async () => {
          try {
            await saveAllData();
            // 성공 시에만 모달을 띄워 알림
            openModal("ModalNotice", { title: "데이터가 안전하게 저장되었습니다.", });
          } catch (error) {
            console.error(error);
            openModal("ModalNotice", { title: "저장 중 오류가 발생했습니다." });
          }
        },
      });
    }
  };

  return (
    <button
      onClick={handleEditMode}
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