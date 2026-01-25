import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from "framer-motion";
import { type ModalData, useModalStore } from "@/store/modalStore.ts";
import { useDataStore } from "@/store/useDataStore.ts";
import { ERRORS } from "@/constant/contant.ts";
import { cn } from "@/lib/utils";
import { useTimeout } from "@/hooks/useTimeout.ts";

const ModalParticipantList = ({ placeId, subItemId, modalId, isPlaceLevel }: ModalData) => {
  const { closeModal } = useModalStore();
  const { people, useHistory, updateHistory } = useDataStore();

  const [isLoading, setIsLoading] = useState(false);
  const [excludeCheck, setExcludeCheck] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // 현재 타겟 데이터(장소 혹은 세부항목) 찾기
  const currentPlace = useHistory.find(h => h.placeId === placeId);
  const currentSubItem = currentPlace?.placeDetails.find(d => d.placeItemId === subItemId);

  // 0.6초 후 에러 메시지를 비워주는 훅 선언
  const resetError = useTimeout(() => {
    setErrorMsg("");
  }, 600);

  // 초기 데이터 설정
  useEffect(() => {
    if (isPlaceLevel && currentPlace) {
      // 장소 단위 수정 시
      setExcludeCheck(currentPlace.placeExcludeUser || []);
    } else if (currentSubItem) {
      // 세부 항목 수정 시
      setExcludeCheck(currentSubItem.placeItemExcludeUser || []);
    }
  }, [currentPlace, currentSubItem, isPlaceLevel]);

  // 3. 인원 선택 토글
  const toggleChoice = (userId: string) => {
    // 세부 항목 수정 중인데, 이미 장소에서 제외된 인원이라면 토글 불가
    if (!isPlaceLevel && currentPlace?.placeExcludeUser?.includes(userId)) return;

    setExcludeCheck(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // 4. 저장 로직
  const handleSave = async () => {

    const activePeople = people.filter(p => p.userName.trim() !== "");

    // 유효성 검사: 전원 제외 방지
    if (activePeople.length > 0 && activePeople.length === excludeCheck.length) {
      setErrorMsg(ERRORS.EXCLUDE_FULL);

      resetError();
      return;
    }

    try {
      setIsLoading(true);

      const newHistory = useHistory.map(h => {
        if (h.placeId === placeId) {
          if (isPlaceLevel) {
            // 장소 단위 업데이트
            return { ...h, placeExcludeUser: excludeCheck };
          } else {
            // 세부 항목 단위 업데이트
            return {
              ...h,
              placeDetails: h.placeDetails.map(d =>
                d.placeItemId === subItemId ? { ...d, placeItemExcludeUser: excludeCheck } : d
              )
            };
          }
        }
        return h;
      });

      updateHistory(newHistory);
      if (modalId) closeModal(modalId);
    } catch (error) {
      console.error(error);
      alert("저장 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentPlace) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/60 z-50 font-money p-4">
      <Motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col max-w-xl w-full gap-2 items-center bg-white rounded-3xl border-[4px] border-main-color py-8 px-6 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl font-black text-main-text mt-1">
            {isPlaceLevel ? `${currentPlace.placeName}` : `${currentSubItem?.placeItemName || '세부내역'}`}
          </div>
          <span className="text-xs text-main-color bg-main-color/10 px-3 py-1 rounded-full">
            {currentPlace.placeName}
          </span>
        </div>

        <div className="text-gray-400 text-sm mt-2">비용을 나누지 않을 사람을 체크하세요</div>

        <ul className="grid grid-cols-2 gap-3 w-full my-6">
          {people.filter(p => p.userName.trim() !== "").map(p => {
            // 장소에서 이미 제외되었는지 확인 (항목 수정 모드일 때만 적용)
            const isInheritedExclude = !isPlaceLevel && currentPlace.placeExcludeUser?.includes(p.userId);
            const isExcluded = isInheritedExclude || excludeCheck.includes(p.userId);

            return (
              <li
                key={p.userId}
                onClick={() => toggleChoice(p.userId)}
                className={cn(
                  "relative cursor-pointer flex justify-between items-center border-2 rounded-xl px-4 py-3 transition-all",
                  isExcluded ? "border-main-color bg-main-color/5" : "border-gray-100 bg-gray-50",
                  isInheritedExclude ? "opacity-100 border-red-200 bg-red-50 cursor-not-allowed" : ""
                )}
              >
                <div className="flex flex-col">
                   <span className={cn("text-lg", isExcluded ? "text-main-color" : "text-gray-400")}>
                    {p.userName}
                  </span>
                  {isInheritedExclude && <span className="text-[10px] sm:text-sm text-red-500">장소 제외됨</span>}
                </div>

                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isExcluded ? "border-main-color bg-main-color" : "border-gray-200 bg-white",
                  isInheritedExclude && "border-red-500 bg-red-500"
                )}>
                  {isExcluded && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => modalId && closeModal(modalId)}
            className="btn-cancel"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-success"
          >
            {isLoading ? "저장 중..." : "설정 완료"}
          </button>
        </div>

        <div className="h-6 mt-2">
          <AnimatePresence>
            {errorMsg && (
              <Motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm">
                {errorMsg}
              </Motion.span>
            )}
          </AnimatePresence>
        </div>
      </Motion.div>
    </div>
  );
};

export default ModalParticipantList;