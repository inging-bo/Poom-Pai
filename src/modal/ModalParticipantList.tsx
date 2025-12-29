import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from "framer-motion";
import { type ModalData, useModalStore } from "@/store/modalStore.ts";
import { useDataStore } from "@/store/useDataStore.ts";
import { ERRORS } from "@/constant/contant.ts";

const ModalParticipantList = ({ placeId, subItemId, modalId }: ModalData) => {
  const { closeModal } = useModalStore();

  const { people, useHistory, updateHistory, saveAllData } = useDataStore();

  // 현재 수정 중인 장소와 세부 항목을 정확히 매칭
  const currentPlace = useHistory.find(h => h.placeId === placeId);
  const currentSubItem = currentPlace?.details.find(d => d.id === subItemId);

  const [isLoading, setIsLoading] = useState(false);
  const [excludeCheck, setExcludeCheck] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // 2. 초기 데이터 로드 (세부 항목 기준)
  useEffect(() => {
    if (currentSubItem) {
      setExcludeCheck(currentSubItem.excludeUser || []);
    }
  }, [currentSubItem]);

  // 인원 선택 토글
  const toggleChoice = (userId: string) => {
    setExcludeCheck(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // 저장 로직
  const handleSave = async () => {
    const activePeople = people.filter(p => p.name.trim() !== "");

    // 유효성 검사: 전원 제외 방지
    if (activePeople.length > 0 && activePeople.length === excludeCheck.length) {
      setErrorMsg(ERRORS.EXCLUDE_FULL);
      setTimeout(() => setErrorMsg(""), 600);
      return;
    }

    try {
      setIsLoading(true);

      // 3. 계층형 데이터 업데이트 로직
      const newHistory = useHistory.map(h => {
        if (h.placeId === placeId) {
          return {
            ...h,
            details: h.details.map(d =>
              d.id === subItemId ? { ...d, excludeUser: excludeCheck } : d
            )
          };
        }
        return h;
      });

      updateHistory(newHistory);
      await saveAllData();

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
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 font-money p-4">
      <Motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col max-w-xl w-full gap-2 items-center bg-main-bg rounded-lg border-[6px] border-main-color py-6 px-4 shadow-xl"
      >
        <div className="text-2xl font-bold text-main-text">사용처 : {currentPlace.name}</div>
        <div className="text-gray-500 font-bold">함께하지 않은 사람을 선택하세요</div>

        <ul className="grid grid-cols-2 gap-2 w-full my-6">
          {people.filter(p => p.name.trim() !== "").map(p => {
            const isExcluded = excludeCheck.includes(p.userId);
            return (
              <li
                key={p.userId}
                onClick={() => toggleChoice(p.userId)}
                className={`
                  cursor-pointer flex w-full justify-between items-center border-2 rounded-xl p-3 transition-all
                  ${isExcluded
                  ? "border-main-color bg-main-color/10 opacity-100"
                  : "border-gray-200 opacity-40"}
                `}
              >
                <span className={`text-xl font-bold ${isExcluded ? "text-main-color" : "text-gray-400"}`}>
                  {p.name}
                </span>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isExcluded ? "border-main-color bg-main-color" : "border-gray-300"}
                `}>
                  {isExcluded && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-4 w-full">
          <Motion.button
            whileTap={{ y: 3 }}
            onClick={() => modalId && closeModal(modalId)}
            className="flex-1 py-3 text-xl border-[6px] border-main-color rounded-xl font-bold hover:bg-black/5 transition-colors"
          >
            취소
          </Motion.button>
          <Motion.button
            whileTap={{ y: 3 }}
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-3 text-xl bg-main-color text-white rounded-xl font-bold disabled:bg-gray-300 hover:brightness-110 transition-all"
          >
            {isLoading ? "저장 중..." : "확인"}
          </Motion.button>
        </div>

        <div className="h-6 mt-2">
          <AnimatePresence>
            {errorMsg && (
              <Motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-600 font-bold"
              >
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