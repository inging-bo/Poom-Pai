import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import { v4 } from "uuid";
import { useDataStore } from "@/store/useDataStore.ts";
import { ERRORS } from "@/constant/contant.ts";
import { useModalStore } from "@/store/modalStore.ts";
import { cn } from "@/lib/utils.ts";
import { useMobileEnv } from "@/hooks/useMobileEnv";

function SettlementDetail() {

  const safeValue = useMobileEnv();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const { openModal } = useModalStore();

  const {
    currentMeetCode, meetTitle, // 현재 코드와 제목 추가
    people, useHistory, dbData, isEdit, cancelEdit, toggleEditMode,
    enterMeet, updatePeople, updateHistory, saveAllData,
    getTotals, getBalances
  } = useDataStore();

  const [isLoading, setIsLoading] = useState(false);

  // 계산값 최적화 (Zustand 셀렉터 활용)
  const totals = getTotals();
  const balances = getBalances();

  useEffect(() => {
    if (routeId) enterMeet(routeId);
  }, [routeId, enterMeet]);

  // 수정 모드 핸들러
  const handleEditMode = () => {
    if (!isEdit) {
      openModal("ModalEditMode", {});
    } else {
      // 수정 모드 취소 시 (저장하지 않고 나갈 때) 알림
      openModal("ModalNotice", {
        title: "수정을 중단하시겠습니까?",

        showCancel: true,
        onConfirm: () => cancelEdit(), // 스토어에서 한방에 롤백
      });
    }
  };

  // 저장 로직
  const handleSave = async () => {
    if (!currentMeetCode) return;

    // 1. 변경 사항 검사 (필터링 후 비교)
    const currentPeople = people.filter(p => p.name.trim() !== "");
    const currentHistory = useHistory.filter(h => h.name.trim() !== "");

    const isUnchanged =
      JSON.stringify(dbData.people) === JSON.stringify(currentPeople) &&
      JSON.stringify(dbData.history) === JSON.stringify(currentHistory);

    if (isUnchanged) {
      return openModal("ModalNotice", { title: ERRORS.EXCLUDE_SAME });
    }

    try {
      setIsLoading(true);
      // 2. 스토어 액션 호출 (인자 필요 없음)
      await saveAllData();

      toggleEditMode(false);
      openModal("ModalNotice", { title: "데이터가 안전하게 저장되었습니다." });
    } catch (error) {
      console.error(error);
      openModal("ModalNotice", { title: "저장 중 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-dvh max-w-xl mx-auto bg-main-bg"
    >
      {/* 모임 제목 표시부 추가 */}
      <div className="bg-main-bg pt-4 px-4 text-center">
        <h1 className="text-xl font-bold text-main-color truncate">
          {meetTitle || "모임 정보를 불러오는 중..."}
        </h1>
      </div>

      <header className="flex shrink-0 z-50 bg-main-bg border-b-2 border-main-color justify-between pt-2 pb-1 px-4 mt-2">
        <SummaryBox label="총 경비" value={totals.totalMoney} />
        <SummaryBox label="총 사용" value={totals.totalUse} />
        <SummaryBox label="잔액" value={totals.haveMoney} isNegative={totals.haveMoney < 0} />
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        <SectionTitle title="참여자 명단">
          <EditModeBtn isEdit={isEdit} onClick={handleEditMode} />
        </SectionTitle>

        <ul className="flex flex-col gap-3 p-4">
          {people.map((item) => {
            const balance = item.givePay - Math.round(balances[item.userId] || 0);
            return (
              <li key={item.userId} className="flex text-xl gap-2 font-money items-center">
                <div className="basis-1/3 flex items-center gap-1">
                  <AnimatePresence mode="wait">
                    {isEdit && (
                      <Motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        onClick={() => updatePeople(people.filter(p => p.userId !== item.userId))}
                        className="text-red-500 border border-red-200 rounded-full w-6 h-6 shrink-0 flex items-center justify-center"
                      >
                        <span className="mb-1">-</span>
                      </Motion.button>
                    )}
                  </AnimatePresence>
                  <input
                    value={item.name}
                    disabled={!isEdit}
                    onChange={(e) => updatePeople(people.map(p => p.userId === item.userId ? {...p, name: e.target.value} : p))}
                    className={cn("w-full p-1 text-center outline-none bg-transparent transition-colors", isEdit && "bg-black/5 rounded focus:bg-black/10")}
                    placeholder="이름"
                  />
                </div>
                <div className={cn("flex-1 text-right font-bold truncate", balance < 0 ? "text-red-500" : "text-main-text")}>
                  {balance > 0 ? `+${balance.toLocaleString()}` : balance.toLocaleString()}
                </div>
                <div className="basis-1/3 flex items-center justify-end">
                  <input
                    value={item.givePay.toLocaleString()}
                    disabled={!isEdit}
                    inputMode="numeric"
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                      updatePeople(people.map(p => p.userId === item.userId ? {...p, givePay: val} : p));
                    }}
                    className={cn("w-20 text-right outline-none bg-transparent", isEdit && "bg-black/5 rounded focus:bg-black/10")}
                  />
                  <span className="ml-0.5">원</span>
                </div>
              </li>
            );
          })}
          {isEdit && <AddBtn label="인원 추가" onClick={() => updatePeople([...people, { userId: v4(), name: "", givePay: 0 }])} />}
        </ul>

        <SectionTitle title="지출 내역" />
        <ul className="flex flex-col gap-3 p-4">
          {useHistory.map((list) => (
            <li key={list.placeId} className="flex text-xl gap-2 items-center">
              <div className="basis-1/3 flex items-center gap-1">
                <AnimatePresence mode="wait">
                  {isEdit && (
                    <Motion.button
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      onClick={() => updateHistory(useHistory.filter(h => h.placeId !== list.placeId))}
                      className="text-red-500 border border-red-200 rounded-full w-6 h-6 shrink-0 flex items-center justify-center"
                    >
                      <span className="mb-1">-</span>
                    </Motion.button>
                  )}
                </AnimatePresence>
                <TextareaAutosize
                  value={list.name}
                  disabled={!isEdit}
                  onChange={(e) => updateHistory(useHistory.map(h => h.placeId === list.placeId ? {...h, name: e.target.value} : h))}
                  className={cn("w-full p-1 text-center outline-none resize-none bg-transparent transition-colors", isEdit && "bg-black/5 rounded focus:bg-black/10")}
                  placeholder="사용처"
                />
              </div>
              <div className="flex-1 text-right">
                <input
                  value={list.useMoney.toLocaleString()}
                  disabled={!isEdit}
                  inputMode="numeric"
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                    updateHistory(useHistory.map(h => h.placeId === list.placeId ? {...h, useMoney: val} : h));
                  }}
                  className={cn("w-full text-right outline-none bg-transparent", isEdit && "bg-black/5 rounded focus:bg-black/10")}
                />
              </div>
              <div
                onClick={() => isEdit && openModal("ModalParticipantList", { placeId: list.placeId })}
                className={cn("basis-1/4 min-h-[40px] flex flex-wrap gap-1 p-1 items-center justify-center transition-all", isEdit && "bg-black/5 rounded cursor-pointer hover:bg-black/10")}
              >
                {list.excludeUser.length > 0 ? (
                  list.excludeUser.map(exId => (
                    <span key={exId} className="text-[10px] bg-sub-color text-white px-1 rounded-full whitespace-nowrap">
                      {people.find(p => p.userId === exId)?.name || "익명"}
                    </span>
                  ))
                ) : <span className="text-xs text-gray-400">{isEdit ? "제외 +" : "전원"}</span>}
              </div>
            </li>
          ))}
          {isEdit && <AddBtn label="내역 추가" onClick={() => updateHistory([...useHistory, { placeId: v4(), name: "", useMoney: 0, excludeUser: [] }])} />}
        </ul>
      </main>

      <footer className={cn("flex gap-4 px-4 pt-2 border-t-2 border-main-color bg-main-bg",
        safeValue === 0 && "pb-2",
        safeValue === 1 && "pb-safe-bottom"
      )}>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 bg-gray-100 rounded-xl font-bold active:scale-95 transition-transform"
        >
          홈으로
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 py-3 bg-main-color text-white rounded-xl font-bold disabled:bg-gray-300 active:scale-95 transition-transform"
        >
          {isLoading ? "저장 중..." : "데이터 저장"}
        </button>
      </footer>
    </Motion.div>
  );
}

// 하위 컴포넌트들 (메모이제이션 고려 가능)
const SummaryBox = ({ label, value, isNegative }: { label: string, value: number, isNegative?: boolean }) => (
  <div className="flex flex-col items-center min-w-[60px]">
    <span className="text-[11px] text-gray-500 font-bold">{label}</span>
    <span className={cn("text-base font-money font-bold", isNegative ? "text-red-500" : "text-main-text")}>
      {value.toLocaleString()}원
    </span>
  </div>
);

const SectionTitle = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="relative flex items-center justify-center border-b-2 border-main-color w-full py-3 mt-2">
    <span className="text-lg font-bold bg-main-bg px-6 z-10">{title}</span>
    <div className="absolute w-full h-[1px] bg-main-color/20" />
    {children}
  </div>
);

const EditModeBtn = ({ isEdit, onClick }: { isEdit: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-4 z-20 flex items-center bg-gray-100 rounded-full p-1 w-20 h-8 border border-main-color/10 overflow-hidden shadow-inner"
  >
    <Motion.div
      className="absolute w-[calc(50%-4px)] h-[calc(100%-8px)] bg-active-color rounded-full shadow-sm"
      animate={{ x: isEdit ? "100%" : "0%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
    <span className={cn("flex-1 text-[10px] z-10 font-bold transition-colors", !isEdit ? "text-white" : "text-gray-400")}>기본</span>
    <span className={cn("flex-1 text-[10px] z-10 font-bold transition-colors", isEdit ? "text-white" : "text-gray-400")}>수정</span>
  </button>
);

const AddBtn = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <Motion.li
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-3 text-center text-sm font-bold text-main-color border-2 border-dashed border-main-color/30 mx-8 mt-2 rounded-xl cursor-pointer bg-main-color/5 hover:bg-main-color/10 transition-colors"
  >
    {label} +
  </Motion.li>
);

export default SettlementDetail;