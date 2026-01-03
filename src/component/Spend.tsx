import { cn } from "@/lib/utils.ts";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useDataStore } from "@/store/useDataStore.ts";
import { useModalStore } from "@/store/modalStore.ts";
import AddBtn from "@/ui/AddBtn.tsx";

const Spend = ({ propsClass } : { propsClass : string }) => {

  const { openModal } = useModalStore();

  const {
    people, useHistory, isEdit, updateHistory,
  } = useDataStore();

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden mb-[calc(55px+var(--safe-area-bottom))]",
      "sm:mb-5",
      propsClass
    )}>
      <div className="relative mb-1 flex items-center justify-center text-center shrink-0">
        {/* 배경 선: 전체 너비를 차지하며 수직 중앙에 위치 */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-active-color h-[1px]"></div>

        {/* 참여자 명단: Flex 아이템으로서 선 위에 배치되며, z-index와 배경색으로 선을 가림 */}
        <div className="relative z-1 px-2 bg-main-bg">
          지출 내역
        </div>
      </div>
      <div className={cn("flex-1 overflow-y-auto p-2",
        "max-sm:pb-12",
      )}>
        <ul className={cn("grid grid-cols-1 gap-4",

        )}>
          {useHistory.map((curPlace) => {
            const isDetailMode = curPlace.isDetailMode ?? false;
            const subTotal = curPlace.placeDetails.reduce((sum, d) => sum + d.placeItemPrice, 0);

            // 토글 핸들러
            const handleDetailToggle = () => {
              if (!isEdit) return;

              const nextDetailMode = !isDetailMode;

              updateHistory(useHistory.map(h => {
                if (h.placeId === curPlace.placeId) {
                  // 상세 모드 ON: 기존 total 값을 첫 번째 세부 항목으로 이전
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
                  // 상세 모드 OFF: 진입 전 보관했던 placePrevTotalPrice 값으로 복구
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
                  className={cn("relative rounded-2xl border-2 overflow-hidden shadow-sm",
                    isEdit ? "border-main-color/20 bg-main-color/5" : "border-gray-100 bg-white"
                  )}>
                {/* 장소 헤더 (선금/전체금액 설정) */}
                <div className={cn("flex flex-col gap-1",
                )}>
                  <div className={cn("flex gap-2 px-3 pt-2 pb-2 items-center",
                    (isEdit || (curPlace.placeExcludeUser?.length || 0) > 0) && "pb-0"
                  )}>
                    {/* 세부 항목 삭제 버튼 */}
                    {isEdit && (
                      <button
                        onClick={() => updateHistory(useHistory.filter(h => h.placeId !== curPlace.placeId))}
                        className="flex items-center justify-center text-red-500 font-bold size-6 hover:bg-red-100 transition-all rounded-full cursor-pointer"
                      >
                        <span className="relative top-[1px]">-</span>
                      </button>
                    )}
                    {/* 장소 명 , 가격 */}
                    <div className="flex-1 gap-2 grid grid-cols-[1fr_1fr]">
                      {/* 장소 명 */}
                      <div className="flex gap-1">
                        <span className="font-money">•</span>
                        <input
                          value={curPlace.placeName}
                          disabled={!isEdit}
                          onChange={(e) => updateHistory(useHistory.map(h => h.placeId === curPlace.placeId ? {
                            ...h,
                            placeName: e.target.value
                          } : h))}
                          className={cn(
                            "flex-1 w-0 min-w-0 border-b-2 border-transparent font-money text-lg outline-none bg-transparent transition-all",
                            isEdit && "px-1 border-b-2 border-b-active-color/30 focus:border-b-active-color",
                          )}
                          placeholder="장소 (예: 1차 고기집)"
                        />
                      </div>
                      {/* 가격 */}
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
                            "flex-1 w-0 min-w-0 text-right text-lg border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                            isEdit && !isDetailMode && "px-1 border-b-2 border-b-active-color/30 focus:border-b-active-color",
                            isDetailMode && "text-main-color" // 상세 모드임을 시각적으로 강조
                          )}
                        />
                        <span className="text-sm font-bold">원</span>
                      </div>
                    </div>
                  </div>

                  {/* 장소 단위 제외 설정 */}
                  {(isEdit || (curPlace.placeExcludeUser?.length || 0) > 0) && (
                    <div className="flex px-3 pb-2 gap-1">
                      {isEdit && (
                        <div className="flex items-center shrink-0 gap-1 cursor-pointer"
                             onClick={handleDetailToggle}>
                          <span className="text-[12px] mt-1 text-active-color">세부 항목 모드</span>
                          <div
                            className={cn("relative w-10 h-5 rounded-full transition-colors", isDetailMode ? "bg-main-color" : "bg-gray-300")}>
                            <Motion.div
                              className="absolute -translate-y-1/2 top-1/2 left-0.5 w-4 h-4 bg-white rounded-full"
                              initial={false}
                              animate={{ x: isDetailMode ? 20 : 0 }}
                            />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => isEdit && openModal("ModalParticipantList", {
                          placeId: curPlace.placeId,
                          isPlaceLevel: true, // 장소 단위임을 표시
                        })}
                        className={cn(
                          "flex ml-auto px-2 py-1 bg-active-color/80 text-white font-money rounded-md text-sm transition-all",
                          isEdit ? "cursor-pointer hover:bg-active-color/90" : "cursor-default", // isEdit이 아닐 때 커서 모양 변경
                        )}
                      >
                        {(curPlace.placeExcludeUser?.length || 0) > 0 ? (
                          <div className="flex gap-1 items-center">
                            <div className="shrink-0 text-xs">
                              장소 제외 :
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {curPlace.placeExcludeUser.map((userId, index) => {
                                const findPeople = people.find((p) => p.userId === userId);
                                const name = findPeople ? findPeople.userName : "알 수 없음";

                                return (
                                  <span
                                    className="text-active-color shrink-0 text-xs bg-main-bg rounded-full px-2 py-1"
                                    key={index}>
                                        {name}
                                      </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <span>장소에서 제외</span>
                        )}
                      </button>
                    </div>
                  )}
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
                      <div className="p-2 flex flex-col gap-1 border-t-2 border-dashed border-gray-200">
                        {curPlace.placeDetails.map((sub) => (
                          <div key={sub.placeItemId}
                               className={cn("flex flex-col pl-2 items-center",
                                 isEdit && "gap-y-1"
                               )}
                          >
                            <div className="flex w-full gap-1">
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
                                  className="flex items-center justify-center text-red-500 font-bold size-7 hover:bg-red-100 transition-all rounded-full cursor-pointer"
                                >
                                  <span className="relative top-[1px]">×</span>
                                </button>
                              )}
                              <div className="flex-1 gap-2 grid grid-cols-[1fr_1fr]">
                                <div className="flex gap-1">
                                  <span className="font-money">ㄴ</span>
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
                                    className={cn(
                                      "flex-1 w-0 min-w-0 text-left border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                                      isEdit && "px-1 border-b-2 border-b-active-color/30 focus:border-b-active-color",
                                    )}
                                    placeholder="항목 (예: 삼겹살)"
                                  />
                                </div>
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
                                    className={cn(
                                      "flex-1 w-0 min-w-0 text-right border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                                      isEdit && "px-1 border-b-2 border-b-active-color/30 focus:border-b-active-color",
                                    )}
                                  />
                                  <span className="text-[10px] font-bold">원</span>
                                </div>
                              </div>
                              {isEdit && (
                                <button
                                  onClick={() => isEdit && openModal("ModalParticipantList", {
                                    placeId: curPlace.placeId,
                                    subItemId: sub.placeItemId,
                                  })}
                                  className={cn("px-2 py-1 rounded-md font-money text-[10px] font-bold bg-sub-color hover:bg-active-color text-white cursor-pointer transition-all",
                                  )}
                                >
                                  <span>제외하기</span>
                                </button>
                              )}
                            </div>
                            {(sub.placeItemExcludeUser?.length || 0) > 0 && (
                              <div
                                className="flex w-full gap-1 cursor-default justify-end font-money items-center">
                                <div className="flex gap-1 shrink-0 text-sm">
                                  <p>{sub.placeItemName}</p>
                                  <p>제외 :</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                  {sub.placeItemExcludeUser.map((userId, index) => {
                                    const findPeople = people.find((p) => p.userId === userId);
                                    const name = findPeople ? findPeople.userName : "알 수 없음";

                                    return (
                                      <span
                                        className="shrink-0 text-xs border border-active-color rounded-full px-2 py-1"
                                        key={index}>
                                          {name}
                                        </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {isEdit && (
                          <AddBtn
                            label="세부 항목 추가"
                            type="detail"
                            placeId={curPlace.placeId}
                            className="text-xs py-2 border border-main-color/20" // 기존의 세부 항목 전용 스타일 전달
                          />
                        )}
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
        {isEdit &&
          <div className="p-3 shrink-0">
            <AddBtn label="장소 추가" type="history" />
          </div>
        }
    </div>
  )
}

export default Spend;