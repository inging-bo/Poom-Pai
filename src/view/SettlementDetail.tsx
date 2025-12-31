import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { useDataStore } from "@/store/useDataStore.ts";
import { useModalStore } from "@/store/modalStore.ts";
import { cn } from "@/lib/utils.ts";
import { useMobileEnv } from "@/hooks/useMobileEnv";
import { RefreshCw } from "lucide-react";

function SettlementDetail() {

  const { isMobile, isStandalone } = useMobileEnv() // 모바일 여부 확인

  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const { openModal } = useModalStore();

  // 참여자 명단, 지출 내역 변경 탭 - 모바일 용
  const [tab, setTab] = useState(0)

  const [rotate, setRotate] = useState(false)

  const {
    meetTitle,
    people, useHistory, isEdit, cancelEdit, toggleEditMode,
    enterMeet, updatePeople, updateHistory, fetchData, saveAllData,
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
    try {
      setIsLoading(true);
      await saveAllData();
      toggleEditMode(false);
      openModal("ModalNotice", { title: "데이터가 안전하게 저장되었습니다.", });
    } catch (error) {
      console.error(error);
      openModal("ModalNotice", { title: "저장 중 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefresh = async () => {
    if (rotate) return; // 이미 로딩 중이면 차단

    setRotate(true);

    try {
      // 1. 최신 데이터 불러오기
      await fetchData();
      console.log("새로고침 완료");
    } catch (error) {
      console.error(error)
      alert("데이터를 불러오지 못했습니다.");
    } finally {
      // 2. 애니메이션 멈추기 예약
      setRotate(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full sm:max-w-[1024px] h-dvh mx-auto bg-main-bg"
    >
      {/* 총 경비 / 총 사용 / 잔액 */}
      <header className="flex gap-2 shrink-0 bg-main-bg pb-1 px-4 py-2">
        <SummaryBox className={"flex-1 items-start"} label="총 경비" value={totals.totalMoney} />
        <SummaryBox className={"flex-1 items-center"} label="총 사용" value={totals.totalUse} />
        <SummaryBox className={"flex-1 items-end"} label="잔액" value={totals.haveMoney}
                    isNegative={totals.haveMoney < 0} />
      </header>

      {/* 나가기 / 모임 제목 / 새로 고침 (db 동기화용) */}
      <div className="flex items-center bg-main-bg p-2">
        {/* 왼쪽: flex-1로 공간 확보 */}
        <div className="flex-1 shrink-0 flex font-money items-center justify-start">
          <Motion.button
            whileTap={{
              scale: 0.96, // 살짝 작아지면서
              y: 2,        // 2px 정도 아래로 내려감
              boxShadow: "none" // 떠 있던 그림자를 없애서 바닥에 붙은 느낌 전달
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }} // 쫀득한 스프링 효과
            onClick={() => navigate("/")}
            className="flex items-center px-4 py-2 rounded-lg bg-main-bg active:bg-sub-color/30"
          >
            나가기
          </Motion.button>
        </div>

        {/* 중앙: 본인 크기만큼만 차지 */}
        <h1 className="text-xl max-w-1/2 font-bold text-main-color truncate shrink-0 px-2">
          {meetTitle || "정보 불러오는 중..."}
        </h1>

        {/* 오른쪽: flex-1로 공간 확보 (왼쪽과 대칭) */}
        <div className="flex-1 shrink-0 flex justify-end">
          {!isMobile && (
            <div className="flex">
              <EditModeBtn className="relative" isEdit={isEdit} onClick={handleEditMode} />
              {isEdit && (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-main-color text-white rounded-lg font-bold hover:bg-main-color/90 transition-colors"
                >
                  저장하기
                </button>
              )}
            </div>
          )}
          <button
            onClick={handleRefresh} className={cn("cursor-pointer",
            rotate && "animate-spin"
          )}>
            <div className="p-2 active:bg-sub-color/30 rounded-full">
              <RefreshCw className="size-5" />
            </div>
          </button>
        </div>
      </div>
      <main className={cn(
        "flex-1 grid grid-cols-1 pb-10 overflow-y-auto",
        "sm:grid-cols-2 sm:overflow-hidden" // PC(sm 이상)에서는 2열로 고정
      )}>
        {/* 참여자 명단 */}
        {(!isMobile || tab === 0) && (
          <div className={cn("",
            "sm:overflow-y-auto",
            isMobile && "overflow-y-auto"
          )}>
            <ul className={cn("grid items-start gap-2 p-2",
              "max-sm:grid-cols-2",
              "sm:grid-cols-1",
              "md:grid-cols-2",
            )}>
              {people.map((item) => {
                const balance = item.upFrontPayment - Math.round(balances[item.userId] || 0);
                return (
                  <li
                    key={item.userId}
                    className={cn(
                      "relative flex flex-col px-3 py-2 rounded-2xl border-2 transition-all shadow-sm",
                      "sm:px-4 sm:py-2",
                      isEdit ? "border-main-color/20 bg-main-color/5" : "border-gray-100 bg-white"
                    )}
                  >
                    {/* 참여자 삭제 버튼 */}
                    <AnimatePresence initial={false}>
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

                    {/* 참여자 리스트 */}
                    <div
                      className={cn("grid gap-1 w-full overflow-hidden",
                        "max-sm:grid-rows-[auto_auto_1fr]",
                        "sm:grid-rows-2 sm:grid-cols-2",
                        "md:grid-rows-[auto_auto_1fr] md:grid-cols-1 gap-1"
                      )}>
                      {/* 이름 */}
                      <div className={cn("relative flex items-center gap-2",
                        "max-sm:pt-3.5",
                      )}>
                        <span className={cn("text-xs font-money text-gray-400 shrink-0 transition-all",
                          "max-sm:absolute max-sm:top-0 max-sm:left-0 max-sm:text-[10px]",
                        )}>
                          이름
                        </span>
                        <input
                          value={item.userName}
                          disabled={!isEdit}
                          onChange={(e) => updatePeople(people.map(p => p.userId === item.userId ? {
                            ...p,
                            userName: e.target.value
                          } : p))}
                          className={cn(
                            "w-full min-w-0 text-lg text-right font-bold outline-none truncate bg-transparent transition-all",
                            item.userName.length > 10
                              ? "text-sm"
                              : item.userName.length > 7
                                ? "text-base"
                                : "text-lg",
                            isEdit && "bg-black/5 rounded px-2 py-0.5"
                          )}
                          placeholder={"이름 입력"}
                        />
                      </div>
                      {/* 선입금 */}
                      <div className={cn("relative flex items-center gap-2",
                        "max-sm:pt-3.5",
                        "sm:col-start-2",
                        "md:col-start-1",
                      )}>
                        <span className={cn("text-xs font-money text-gray-400 shrink-0 transition-all",
                          "max-sm:absolute max-sm:top-0 max-sm:left-0 max-sm:text-[10px]",
                        )}>선입금</span>
                        <div className={cn("flex-1 flex items-baseline gap-0.5",
                          "md:gap-1"
                        )}>
                          <input
                            value={item.upFrontPayment.toLocaleString()}
                            disabled={!isEdit}
                            inputMode="numeric"
                            onChange={(e) => {
                              const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                              updatePeople(people.map(p => p.userId === item.userId ? {
                                ...p,
                                upFrontPayment: val
                              } : p));
                            }}
                            className={cn(
                              "flex-1 w-0 min-w-0 text-right font-money font-bold outline-none bg-transparent transition-all",
                              item.upFrontPayment.toLocaleString().length > 10
                                ? "text-sm"
                                : item.upFrontPayment.toLocaleString().length > 7
                                  ? "text-base"
                                  : "text-lg",
                              isEdit && "bg-black/5 rounded px-1"
                            )}
                          />
                          <span className="text-sm font-bold">원</span>
                        </div>
                      </div>
                      {/* 뿜빠이 */}
                      <div
                        className={cn("relative flex items-center gap-2 border-t border-dashed border-gray-200 pt-1",
                          "max-sm:pt-3.5",
                          "sm:col-span-2",
                          "md:col-span-1",
                        )}>
                        <span className={cn("text-xs font-money text-gray-400 shrink-0 transition-all",
                          "max-sm:absolute max-sm:top-0.5 max-sm:left-0 max-sm:text-[10px]",
                        )}>뿜빠이</span>
                        <div className={cn("flex-1 flex items-baseline gap-0.5",
                          "md:gap-1",
                          balance < 0
                            ? "text-red-500"
                            : balance > 0
                              ? "text-blue-500"
                              : "text-main-text"
                        )}>
                          <div className={cn(
                            "flex-1 min-w-0 text-right font-money wrap-anywhere transition-all",
                            balance.toLocaleString().length > 10
                              ? "text-sm"
                              : balance.toLocaleString().length > 7
                                ? "text-base"
                                : "text-lg",
                          )}>
                            {balance > 0 ? `+${balance.toLocaleString()}` : balance.toLocaleString()}
                          </div>
                          <span className="text-sm">원</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}

            </ul>
            {isEdit && (
              <div className="p-3 mb-2">
                <AddBtn
                  label="인원 추가"
                  onClick={() => updatePeople([...people, { userId: v4(), userName: "", upFrontPayment: 0 }])}
                />
              </div>
            )}
          </div>
        )}

        {/* 지출 내역 */}
        {(!isMobile || tab === 1) && (
          <div className={cn("",
            "sm:overflow-y-auto",
            isMobile && "overflow-y-auto"
          )}>
            <ul className="grid grid-cols-1 gap-4 p-2">
              {useHistory.map((curPlace) => {
                const isDetailMode = curPlace.isDetailMode ?? false;
                const subTotal = curPlace.placeDetails.reduce((sum, d) => sum + d.placeItemPrice, 0);

                // 토글 핸들러
                const handleDetailToggle = () => {
                  if (!isEdit) return;

                  const nextDetailMode = !isDetailMode;

                  updateHistory(useHistory.map(h => {
                    if (h.placeId === curPlace.placeId) {
                      // 1. 상세 모드 ON: 기존 total 값을 첫 번째 세부 항목으로 이전
                      if (nextDetailMode) {
                        return {
                          ...h,
                          isDetailMode: true,
                          // 이전의 total 값을 보관하고 싶다면 별도 필드(placePrevTotalPrice)를 활용하거나,
                          // 아래처럼 세부 항목이 비어있을 때만 기존 값을 넣어줍니다.
                          placePrevTotalPrice: h.placeTotalPrice,
                          placeTotalPrice: subTotal
                        };
                      }
                      // 2. 상세 모드 OFF: 진입 전 보관했던 placePrevTotalPrice 값으로 복구
                      else {
                        return {
                          ...h,
                          isDetailMode: false,
                          placeTotalPrice: h.placePrevTotalPrice ?? h.placeTotalPrice
                        };
                      }
                    }
                    return h;
                  }));
                };

                return (
                  <li key={curPlace.placeId}
                      className="bg-white rounded-2xl border-2 border-main-color/10 overflow-hidden shadow-sm">
                    {/* 장소 헤더 (선금/전체금액 설정) */}
                    <div className="bg-main-color/5 p-3 flex flex-col gap-2 border-b border-main-color/10">
                      <div className="flex items-center gap-2">
                        {isEdit && (
                          <button onClick={() => updateHistory(useHistory.filter(h => h.placeId !== curPlace.placeId))}
                                  className="text-red-500 font-bold px-2"
                          >
                            -
                          </button>
                        )}
                        <input
                          value={curPlace.placeName}
                          disabled={!isEdit}
                          onChange={(e) => updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                            ...h,
                            placeName: e.target.value
                          } : h))}
                          className="w-full bg-transparent font-bold text-lg outline-none"
                          placeholder="장소 (예: 1차 고기집)"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            // 상세 모드면 실시간 합계(subTotal)를, 기본 모드면 placeTotalPrice를 표시
                            value={(isDetailMode ? subTotal : (curPlace.placeTotalPrice || 0)).toLocaleString()}
                            disabled={!isEdit || isDetailMode} // 상세 모드에선 직접 수정 불가 (하단에서 수정)
                            inputMode="numeric"
                            onChange={(e) => {
                              const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                              updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                                ...h,
                                placeTotalPrice: val
                              } : h));
                            }}
                            className={cn(
                              "w-24 text-right font-money font-bold outline-none rounded px-1 transition-all",
                              isEdit && !isDetailMode ? "bg-white shadow-sm ring-1 ring-main-color/20" : "bg-transparent",
                              isDetailMode && "text-main-color" // 상세 모드임을 시각적으로 강조
                            )}
                          />
                          <span className="text-sm font-bold">원</span>
                        </div>
                      </div>

                      {/* 장소 단위 제외 설정 */}
                      <div className="flex justify-end">
                        {isEdit && (
                          <div className="flex items-center gap-2 cursor-pointer" onClick={handleDetailToggle}>
                            <span className="text-[10px] font-bold text-gray-500">세부 항목 모드</span>
                            <div
                              className={cn("relative w-8 h-4 rounded-full transition-colors", isDetailMode ? "bg-main-color" : "bg-gray-300")}>
                              <Motion.div
                                className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full"
                                initial={false}
                                animate={{ x: isDetailMode ? 16 : 0 }}
                              />
                            </div>
                          </div>
                        )}
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

                    {/* 세부 항목 리스트 (토글이 켜져 있을 때만 노출) */}
                    <AnimatePresence initial={false}>
                      {isDetailMode && (
                        <Motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-white"
                        >
                          <div className="p-3 flex flex-col gap-3 border-t border-dashed border-gray-100">
                            {curPlace.placeDetails.map((sub) => (
                              <div key={sub.placeItemId}
                                   className="flex items-center gap-2 pb-2 border-b border-gray-50 last:border-0">
                                {isEdit && (
                                  <button
                                    onClick={() => {
                                      const nextDetails = curPlace.placeDetails.filter(d => d.placeItemId !== sub.placeItemId);
                                      updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                                        ...h,
                                        placeDetails: nextDetails,
                                        placeTotalPrice: nextDetails.reduce((s, d) => s + d.placeItemPrice, 0) // 즉시 동기화
                                      } : h));
                                    }}
                                    className="text-red-400 font-bold px-1"
                                  >×</button>
                                )}
                                <input
                                  value={sub.placeItemName}
                                  disabled={!isEdit}
                                  onChange={(e) => {
                                    const nextDetails = curPlace.placeDetails.map(d => d.placeItemId === sub.placeItemId ? {
                                      ...d,
                                      placeItemName: e.target.value
                                    } : d);
                                    updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                                      ...h,
                                      placeDetails: nextDetails
                                    } : h));
                                  }}
                                  className="flex-1 min-w-0 outline-none bg-transparent text-sm"
                                  placeholder="항목 (예: 삼겹살)"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    value={sub.placeItemPrice.toLocaleString()}
                                    disabled={!isEdit}
                                    inputMode="numeric"
                                    onChange={(e) => {
                                      const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                                      const nextDetails = curPlace.placeDetails.map(d => d.placeItemId === sub.placeItemId ? {
                                        ...d,
                                        placeItemPrice: val
                                      } : d);
                                      const newTotal = nextDetails.reduce((s, d) => s + d.placeItemPrice, 0);
                                      updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                                        ...h,
                                        placeDetails: nextDetails,
                                        placeTotalPrice: newTotal // 상세 수정 시 실시간 total 반영
                                      } : h));
                                    }}
                                    className="w-20 text-right font-money font-bold bg-gray-50 rounded"
                                  />
                                  <span className="text-[10px] font-bold">원</span>
                                </div>
                                <button
                                  onClick={() => isEdit && openModal("ModalParticipantList", {
                                    placeId: curPlace.placeId,
                                    subItemId: sub.placeItemId,
                                  })}
                                  className={cn("px-2 py-1 rounded-md text-[10px] font-bold",
                                    sub.placeItemExcludeUser.length > 0 ? "bg-sub-color text-white" : "bg-gray-100 text-gray-400"
                                  )}
                                >
                                  {sub.placeItemExcludeUser.length > 0 ? `${sub.placeItemExcludeUser.length}명` : "참여"}
                                </button>
                              </div>
                            ))}

                            {isEdit && (
                              <button
                                onClick={() => {
                                  const nextDetails = [...curPlace.placeDetails, {
                                    placeItemId: v4(),
                                    placeItemName: "",
                                    placeItemPrice: 0,
                                    placeItemExcludeUser: []
                                  }];
                                  updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                                    ...h,
                                    placeDetails: nextDetails
                                  } : h));
                                }}
                                className="text-xs text-main-color font-bold py-2 border border-main-color/20 rounded-lg border-dashed"
                              >
                                + 세부 항목 추가
                              </button>
                            )}
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
            {isEdit &&
              <div className="p-3 mb-2">
                <AddBtn label="장소 추가" onClick={() => updateHistory([...useHistory, {
                  placeId: v4(),
                  placeName: "",
                  placeTotalPrice: 0,
                  placeExcludeUser: [],
                  placeDetails: [],
                  isDetailMode: false,
                  placePrevTotalPrice: 0,
                }])}
                />
              </div>
            }
          </div>
        )}
      </main>

      {/* 모바일일 때만 나타나는 탭 선택 바 */}
      {isMobile && (
        <div className="relative flex px-4 py-2 gap-2 bg-main-bg border-b border-gray-100">
          <EditModeBtn className="absolute left-1/2 -translate-x-1/2 bottom-full" isEdit={isEdit}
                       onClick={handleEditMode} />
          <button
            onClick={() => setTab(0)}
            className={cn(
              "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
              tab === 0 ? "bg-main-color text-white shadow-md" : "bg-gray-100 text-gray-400"
            )}
          >
            참여자 명단
          </button>
          <button
            onClick={() => setTab(1)}
            className={cn(
              "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
              tab === 1 ? "bg-main-color text-white shadow-md" : "bg-gray-100 text-gray-400"
            )}
          >
            지출 내역
          </button>
        </div>
      )}

      <footer className={cn("flex gap-4 px-4 pt-2 border-t-2 border-main-color bg-main-bg",
        isStandalone
          ? "pb-safe-bottom"
          : "pb-2"
      )}>
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
const SummaryBox = ({ className, label, value, isNegative }: {
  className: string,
  label: string,
  value: number,
  isNegative?: boolean
}) => (
  <div className={cn("flex flex-col items-center min-w-[60px]", className)}>
    <span className="text-main-text">{label}</span>
    <span className={cn("text-sm font-money wrap-anywhere", isNegative ? "text-red-500" : "text-main-text")}>
      {value.toLocaleString()}원
    </span>
  </div>
);

/* 기본 / 수정 모드 변경 버튼 */
const EditModeBtn = ({ className, isEdit, onClick }: { className: string, isEdit: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn("mb-1 z-20 flex items-center bg-gray-100 rounded-full p-1 w-20 h-8 border border-main-color/10 overflow-hidden shadow-inner",
      className
    )}
  >
    <Motion.div
      className="absolute w-[calc(50%-4px)] h-[calc(100%-8px)] bg-active-color rounded-full shadow-sm"
      animate={{ x: isEdit ? "100%" : "0%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
    <span
      className={cn("flex-1 text-[10px] z-10 font-bold transition-colors", !isEdit ? "text-white" : "text-gray-400")}>기본</span>
    <span
      className={cn("flex-1 text-[10px] z-10 font-bold transition-colors", isEdit ? "text-white" : "text-gray-400")}>수정</span>
  </button>
);

const AddBtn = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <Motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-3 h-fit py-auto text-center text-sm font-bold text-main-color border-2 border-dashed border-main-color/30 rounded-xl cursor-pointer bg-main-color/5 hover:bg-main-color/10 transition-colors"
  >
    {label} +
  </Motion.div>
);

export default SettlementDetail;