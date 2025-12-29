import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import React, { useEffect, useState } from "react";
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
      className="flex flex-col w-full sm:max-w-[1024px] h-dvh mx-auto bg-main-bg"
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

      <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 pb-10">
        {/* 참여자 명단 */}
        <div>
          <SectionTitle title="참여자 명단">
            <EditModeBtn isEdit={isEdit} onClick={handleEditMode} />
          </SectionTitle>

          <ul className="grid grid-cols-1 gap-4 p-2">
            {people.map((item) => {
              const balance = item.givePay - Math.round(balances[item.userId] || 0);

              return (
                <li
                  key={item.userId}
                  className={cn(
                    "relative flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all shadow-sm",
                    isEdit ? "border-main-color/20 bg-main-color/5" : "border-gray-100 bg-white"
                  )}
                >
                  {/* 삭제 버튼 (수정 모드일 때만 절대 위치로 표시) */}
                  <AnimatePresence>
                    {isEdit && (
                      <Motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => updatePeople(people.filter(p => p.userId !== item.userId))}
                        className="absolute left-0 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10"
                      >
                        <span className="mb-1 text-xl">×</span>
                      </Motion.button>
                    )}
                  </AnimatePresence>

                  {/* 상단: 이름 및 보낸 금액 */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 shrink-0">이름</span>
                      <input
                        value={item.name}
                        disabled={!isEdit}
                        onChange={(e) => updatePeople(people.map(p => p.userId === item.userId ? {...p, name: e.target.value} : p))}
                        className={cn(
                          "w-full text-lg font-bold outline-none bg-transparent transition-colors",
                          isEdit && "bg-black/5 rounded px-2 py-0.5"
                        )}
                        placeholder="이름 입력"
                      />
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs font-bold text-gray-400 shrink-0">보냄</span>
                      <input
                        value={item.givePay.toLocaleString()}
                        disabled={!isEdit}
                        inputMode="numeric"
                        onChange={(e) => {
                          const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                          updatePeople(people.map(p => p.userId === item.userId ? {...p, givePay: val} : p));
                        }}
                        className={cn(
                          "w-20 text-right text-lg font-money font-bold outline-none bg-transparent",
                          isEdit && "bg-black/5 rounded px-1"
                        )}
                      />
                      <span className="text-sm font-bold">원</span>
                    </div>
                  </div>

                  {/* 하단: 정산 결과 (결과값은 시각적으로 강조) */}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 mt-1">
                    <span className="text-sm font-bold text-gray-500">정산 결과</span>
                    <div className={cn(
                      "text-xl font-money font-black",
                      balance < 0 ? "text-red-500" : balance > 0 ? "text-blue-500" : "text-main-text"
                    )}>
                      {balance > 0 ? `+${balance.toLocaleString()}` : balance.toLocaleString()}
                      <span className="text-sm ml-0.5">원</span>
                    </div>
                  </div>
                </li>
              );
            })}

            {isEdit && (
              <AddBtn
                label="인원 추가"
                onClick={() => updatePeople([...people, { userId: v4(), name: "", givePay: 0 }])}
              />
            )}
          </ul>
        </div>
        {/* 지출 내역 */}
        <div>
          <SectionTitle title="지출 내역" />
          <ul className="flex flex-col gap-6 p-4">
            {useHistory.map((list) => (
              <li key={list.placeId}
                  className="bg-white rounded-2xl border-2 border-main-color/10 overflow-hidden shadow-sm">
                {/* 장소 헤더 */}
                <div className="bg-main-color/5 p-3 flex items-center gap-2 border-b border-main-color/10">
                  {isEdit && (
                    <button onClick={() => updateHistory(useHistory.filter(h => h.placeId !== list.placeId))}
                            className="text-red-500 font-bold px-2">-</button>
                  )}
                  <input
                    value={list.name}
                    disabled={!isEdit}
                    onChange={(e) => updateHistory(useHistory.map(h => h.placeId === list.placeId ? {
                      ...h,
                      name: e.target.value
                    } : h))}
                    className="flex-1 bg-transparent font-bold text-lg outline-none placeholder:text-gray-300"
                    placeholder="장소 (예: 1차 고기집)"
                  />
                </div>

                {/* 세부 항목 리스트 */}
                <div className="p-3 flex flex-col gap-3">
                  {list.details.map((sub) => (
                    <div key={sub.id}
                         className="flex items-center gap-2 text-base border-b border-dashed border-gray-100 pb-2 last:border-0">
                      <input
                        value={sub.name}
                        disabled={!isEdit}
                        onChange={(e) => {
                          const nextDetails = list.details.map(d => d.id === sub.id ? {
                            ...d,
                            name: e.target.value
                          } : d);
                          updateHistory(useHistory.map(h => h.placeId === list.placeId ? {
                            ...h,
                            details: nextDetails
                          } : h));
                        }}
                        className="flex-1 outline-none bg-transparent placeholder:text-gray-300"
                        placeholder="항목 (예: 삼겹살)"
                      />
                      <input
                        value={sub.price.toLocaleString()}
                        disabled={!isEdit}
                        inputMode="numeric"
                        onChange={(e) => {
                          const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                          const nextDetails = list.details.map(d => d.id === sub.id ? { ...d, price: val } : d);
                          updateHistory(useHistory.map(h => h.placeId === list.placeId ? {
                            ...h,
                            details: nextDetails
                          } : h));
                        }}
                        className="w-20 text-right font-money font-bold outline-none bg-transparent"
                      />
                      <button
                        onClick={() => isEdit && openModal("ModalParticipantList", {
                          placeId: list.placeId,
                          subItemId: sub.id
                        })}
                        className={cn("px-2 py-1 rounded-md text-[10px] font-bold transition-colors",
                          sub.excludeUser.length > 0 ? "bg-sub-color text-white" : "bg-gray-100 text-gray-400",
                          isEdit && "hover:bg-main-color hover:text-white cursor-pointer"
                        )}
                      >
                        {sub.excludeUser.length > 0 ? `${sub.excludeUser.length}명 제외` : "전원 참여"}
                      </button>
                    </div>
                  ))}

                  {isEdit && (
                    <button
                      onClick={() => {
                        const nextDetails = [...list.details, { id: v4(), name: "", price: 0, excludeUser: [] }];
                        updateHistory(useHistory.map(h => h.placeId === list.placeId ? {
                          ...h,
                          details: nextDetails
                        } : h));
                      }}
                      className="text-xs text-main-color font-bold py-1 border border-main-color/20 rounded-lg border-dashed"
                    >
                      + 항목 추가
                    </button>
                  )}
                </div>
              </li>
            ))}
            {isEdit && <AddBtn label="장소 추가" onClick={() => updateHistory([...useHistory, {
              placeId: v4(),
              name: "",
              details: []
            }])} />}
          </ul>
        </div>

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

/* 참여자 명단 , 지출 내역 */
const SectionTitle = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="relative flex items-center justify-center border-b-2 border-main-color w-full py-3">
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