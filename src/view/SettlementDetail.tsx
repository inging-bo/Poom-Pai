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
    currentMeetCode, meetTitle,
    people, useHistory, dbData, isEdit, cancelEdit, toggleEditMode,
    enterMeet, updatePeople, updateHistory, saveAllData,
    getTotals, getBalances
  } = useDataStore();

  const [isLoading, setIsLoading] = useState(false);

  const totals = getTotals();
  const balances = getBalances();

  useEffect(() => {
    if (routeId) enterMeet(routeId);
  }, [routeId, enterMeet]);

  const handleEditMode = () => {
    if (!isEdit) {
      openModal("ModalEditMode", {});
    } else {
      openModal("ModalNotice", {
        title: "수정을 중단하시겠습니까?",
        showCancel: true,
        onConfirm: () => cancelEdit(),
      });
    }
  };

  const handleSave = async () => {
    if (!currentMeetCode) return;

    const currentPeople = people.filter(p => p.userName.trim() !== "");
    const currentHistory = useHistory.filter(h => h.placeName.trim() !== "");

    const isUnchanged =
      JSON.stringify(dbData.people) === JSON.stringify(currentPeople) &&
      JSON.stringify(dbData.history) === JSON.stringify(currentHistory);

    if (isUnchanged) {
      return openModal("ModalNotice", { title: ERRORS.EXCLUDE_SAME });
    }

    try {
      setIsLoading(true);
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

      <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 pb-10 overflow-y-auto">
        {/* 참여자 명단 */}
        <div className="border-r border-gray-100">
          <SectionTitle title="참여자 명단">
            <EditModeBtn isEdit={isEdit} onClick={handleEditMode} />
          </SectionTitle>

          <ul className="grid grid-cols-1 gap-4 p-2">
            {people.map((item) => {
              const balance = item.upFrontPayment - Math.round(balances[item.userId] || 0);
              return (
                <li
                  key={item.userId}
                  className={cn(
                    "relative flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all shadow-sm",
                    isEdit ? "border-main-color/20 bg-main-color/5" : "border-gray-100 bg-white"
                  )}
                >
                  <AnimatePresence>
                    {isEdit && (
                      <Motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => updatePeople(people.filter(p => p.userId !== item.userId))}
                        className="absolute -left-2 -top-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10"
                      >
                        <span className="mb-0.5 text-xl">×</span>
                      </Motion.button>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 shrink-0">이름</span>
                      <input
                        value={item.userName}
                        disabled={!isEdit}
                        onChange={(e) => updatePeople(people.map(p => p.userId === item.userId ? {...p, userName: e.target.value} : p))}
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
                        value={item.upFrontPayment.toLocaleString()}
                        disabled={!isEdit}
                        inputMode="numeric"
                        onChange={(e) => {
                          const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                          updatePeople(people.map(p => p.userId === item.userId ? {...p, upFrontPayment: val} : p));
                        }}
                        className={cn(
                          "w-20 text-right text-lg font-money font-bold outline-none bg-transparent",
                          isEdit && "bg-black/5 rounded px-1"
                        )}
                      />
                      <span className="text-sm font-bold">원</span>
                    </div>
                  </div>

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
                onClick={() => updatePeople([...people, { userId: v4(), userName: "", upFrontPayment: 0 }])}
              />
            )}
          </ul>
        </div>

        {/* 지출 내역 */}
        <div>
          <SectionTitle title="지출 내역" />
          <ul className="flex flex-col gap-6 p-4">
            {useHistory.map((curPlace) => {
              const subTotal = curPlace.placeDetails.reduce((sum, d) => sum + d.placeItemPrice, 0);
              const remaining = (curPlace.placeTotalPrice || 0) - subTotal;

              return (
                <li key={curPlace.placeId} className="bg-white rounded-2xl border-2 border-main-color/10 overflow-hidden shadow-sm">
                  {/* 장소 헤더 (선금/전체금액 설정) */}
                  <div className="bg-main-color/5 p-3 flex flex-col gap-2 border-b border-main-color/10">
                    <div className="flex items-center gap-2">
                      {isEdit && (
                        <button onClick={() => updateHistory(useHistory.filter(h => h.placeId !== curPlace.placeId))}
                                className="text-red-500 font-bold px-2">-</button>
                      )}
                      <input
                        value={curPlace.placeName}
                        disabled={!isEdit}
                        onChange={(e) => updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? { ...h, placeName: e.target.value } : h))}
                        className="flex-1 bg-transparent font-bold text-lg outline-none"
                        placeholder="장소 (예: 1차 고기집)"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          value={curPlace.placeTotalPrice?.toLocaleString() || 0}
                          disabled={!isEdit}
                          inputMode="numeric"
                          onChange={(e) => {
                            const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                            updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? { ...h, placeTotalPrice: val } : h));
                          }}
                          className={cn(
                            "w-24 text-right font-money font-bold outline-none rounded px-1",
                            isEdit ? "bg-white shadow-sm" : "bg-transparent"
                          )}
                        />
                        <span className="text-sm font-bold">원</span>
                      </div>
                    </div>
                    {/* 장소 단위 제외 설정 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => isEdit && openModal("ModalParticipantList", {
                          placeId: curPlace.placeId,
                          isPlaceLevel: true, // 장소 단위임을 표시
                        })}
                        className={cn("px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                          (curPlace.placeExcludeUser?.length || 0) > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                        )}
                      >
                        {(curPlace.placeExcludeUser?.length || 0) > 0 ? `장소 제외: ${curPlace.placeExcludeUser.length}명` : "장소 전체 참여"}
                      </button>
                    </div>
                  </div>

                  {/* 세부 항목 리스트 */}
                  <div className="p-3 flex flex-col gap-3">
                    {curPlace.placeDetails.map((sub) => (
                      <div key={sub.placeItemId} className="flex flex-col gap-1 border-b border-dashed border-gray-100 pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          {/* 🔥 세부 항목 삭제 버튼 */}
                          {isEdit && (
                            <button
                              onClick={() => {
                                const nextDetails = curPlace.placeDetails.filter(d => d.placeItemId !== sub.placeItemId);
                                updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? { ...h, placeDetails: nextDetails } : h));
                              }}
                              className="text-red-400 hover:text-red-600 font-bold px-1 transition-colors"
                            >
                              ×
                            </button>
                          )}
                          <input
                            value={sub.placeItemName}
                            disabled={!isEdit}
                            onChange={(e) => {
                              const nextDetails = curPlace.placeDetails.map(d => d.placeItemId === sub.placeItemId ? { ...d, placeItemName: e.target.value } : d);
                              updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? { ...h, placeDetails: nextDetails } : h));
                            }}
                            className="flex-1 outline-none bg-transparent text-sm"
                            placeholder="항목 (예: 삼겹살)"
                          />
                          <input
                            value={sub.placeItemPrice.toLocaleString()}
                            disabled={!isEdit}
                            inputMode="numeric"
                            onChange={(e) => {
                              const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                              const otherSum = curPlace.placeDetails.filter(d => d.placeItemId !== sub.placeItemId).reduce((s, d) => s + d.placeItemPrice, 0);

                              // 🔥 유효성 검사: 전체 금액 초과 방지
                              if (val + otherSum > (curPlace.placeTotalPrice || 0)) {
                                openModal("ModalNotice", { title: "장소 전체 금액을 초과할 수 없습니다." });
                                return;
                              }

                              const nextDetails = curPlace.placeDetails.map(d => d.placeItemId === sub.placeItemId ? { ...d, placeItemPrice: val } : d);
                              updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? { ...h, placeDetails: nextDetails } : h));
                            }}
                            className="w-20 text-right font-money font-bold outline-none bg-transparent"
                          />
                          <button
                            onClick={() => isEdit && openModal("ModalParticipantList", {
                              placeId: curPlace.placeId,
                              subItemId: sub.placeItemId,
                            })}
                            className={cn("px-2 py-1 rounded-md text-[10px] font-bold",
                              sub.placeItemExcludeUser.length > 0 ? "bg-sub-color text-white" : "bg-gray-100 text-gray-400"
                            )}
                          >
                            {sub.placeItemExcludeUser.length > 0 ? `${sub.placeItemExcludeUser.length}명 제외` : "참여"}
                          </button>
                        </div>
                      </div>
                    ))}

                    {isEdit && (
                      <div className="flex flex-col gap-2 mt-1">
                        <button
                          onClick={() => {
                            const nextDetails = [...curPlace.placeDetails, { placeItemId: v4(), placeItemName: "", placeItemPrice: 0, placeItemExcludeUser: [] }];
                            updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? { ...h, placeDetails: nextDetails } : h));
                          }}
                          className="text-xs text-main-color font-bold py-1.5 border border-main-color/20 rounded-lg border-dashed hover:bg-main-color/5"
                        >
                          + 세부 항목 추가
                        </button>
                        {/* 🔥 남은 미분류 금액 안내 */}
                        {remaining > 0 && (
                          <div className="text-[10px] text-center text-orange-500 font-bold bg-orange-50 py-1 rounded">
                            미분류 잔액: {remaining.toLocaleString()}원이 남았습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {isEdit && <AddBtn label="장소 추가" onClick={() => updateHistory([...useHistory, {
              placeId: v4(),
              placeName: "",
              placeTotalPrice: 0,
              placeExcludeUser: [],
              placeDetails: []
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
          className="flex-1 py-3 bg-main-color text-white rounded-xl font-bold disabled:bg-gray-300 active:scale-95 transition-transform shadow-lg"
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