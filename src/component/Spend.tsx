import { cn } from "@/lib/utils.ts";
import { AnimatePresence, motion as Motion, Reorder, useDragControls } from "framer-motion";
import { useDataStore, type Person, type UseHistory, type UseHistoryDetails } from "@/store/useDataStore.ts"; // 정의된 타입 임포트
import { useModalStore, type ModalData, type ModalType } from "@/store/modalStore.ts"; // 모달 타입 임포트
import AddBtn from "@/ui/AddBtn.tsx";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// ReorderItem Props 인터페이스 정의
interface ReorderItemProps {
  curPlace: UseHistory;
  isEdit: boolean;
  useHistory: UseHistory[];
  updateHistory: (history: UseHistory[]) => void;
  people: Person[];
  openModal: (type: ModalType, data: ModalData) => string;
}

// 개별 아이템 컴포넌트 (Hook 규칙 준수 및 타입 적용)
const ReorderItem = ({
                       curPlace,
                       isEdit,
                       useHistory,
                       updateHistory,
                       people,
                       openModal
                     }: ReorderItemProps) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  // 세부 항목 있는지
  const isSubDetail = curPlace.placeDetails.length > 0

  // 세부 항목 합계
  const subTotal = curPlace.placeDetails.reduce((sum: number, d: UseHistoryDetails) => sum + d.placeItemPrice, 0);

  // 장소 금액 - 세부 항목 합계
  const reMainPrice = curPlace.placeTotalPrice - subTotal;

  return (
    <Reorder.Item
      key={curPlace.placeId}
      value={curPlace}
      dragListener={false}
      dragControls={dragControls}
      transition={{ type: "spring", stiffness: 700, damping: 40 }}
      // 2. 레이아웃 변화가 생길 때 부드럽게 애니메이션 처리
      layout
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "relative rounded-2xl border-2 overflow-hidden shadow-sm list-none",
        isEdit ? "border-main-color/20 bg-main-bg" : "border-gray-100 bg-white",
        isDragging && "border-active-color z-999"
      )}
    >
      {/* 장소 헤더 (선금/전체금액 설정) */}
      <div className={cn("flex flex-col")}>
        {/* 순서 변경 handle */}
        {isEdit && (
          <button
            className={cn("flex justify-center py-2 cursor-grab",
              isDragging && "cursor-grabbing"
            )}
            style={{
              touchAction: "none",
              WebkitUserSelect: "none", // iOS 사파리 텍스트 선택 방지
              userSelect: "none"
            }} // 모바일 터치 간섭 방지 (핵심 추가)
            onPointerDown={(e) => {
              e.preventDefault(); // 브라우저 기본 포커스/드래그 방지
              e.stopPropagation();
              dragControls.start(e);
            }}
          >
            <div className={cn("w-10 h-1 rounded-full",
              isDragging ? "bg-main-text w-14" : "bg-main-color"
            )}></div>
          </button>
        )}

        <div className={cn("flex gap-1 px-3 pb-1 items-center",
          !isEdit && "pt-2"
        )}>
          {/* 세부 항목 삭제 버튼 */}
          {isEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateHistory(useHistory.filter((h: UseHistory) => h.placeId !== curPlace.placeId));
              }}
              className="flex items-center justify-center text-red-500 font-bold size-6 hover:bg-red-100 transition-all rounded-full cursor-pointer z-10"
            >
              <span className="relative top-[1px]">-</span>
            </button>
          )}

          {/* 장소 명 , 가격 */}
          <div className="flex-1 gap-1 grid grid-cols-[1fr_1fr]">
            {/* 장소 명 */}
            <div className="flex gap-1">
              {!isEdit && (
                <span className="font-money">•</span>
              )}
              <div className="relative flex flex-1">
                <input
                  value={curPlace.placeName}
                  disabled={!isEdit}
                  onPointerDown={(e) => e.stopPropagation()}
                  onChange={(e) => updateHistory(useHistory.map((h: UseHistory) => h.placeId === curPlace.placeId ? {
                    ...h,
                    placeName: e.target.value
                  } : h))}
                  className={cn(
                    "flex-1 w-0 min-w-0 text-base border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                    "sm:text-lg",
                    isEdit && "px-1 border-b-active-color/30 focus:border-b-active-color",
                  )}
                  placeholder="장소 (예: 1차 고기집)"
                />
                {isEdit && curPlace.placeName !== "" && (
                  <button
                    type="button"
                    onClick={() => updateHistory(useHistory.map(p => p.placeId === curPlace.placeId ? {
                      ...p,
                      placeName: ""
                    } : p))}
                    className={cn("absolute p-0.5 rounded-full bg-sub-color text-white right-1 top-1/2 -translate-y-1/2 cursor-pointer",
                      "hover:bg-sub-color-hover"
                    )}
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>

            {/* 가격 */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-money">합계 : </span>
              <input
                value={(curPlace.placeTotalPrice || 0).toLocaleString()}
                disabled={!isEdit}
                onPointerDown={(e) => e.stopPropagation()}
                inputMode="numeric"
                onChange={(e) => {
                  const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                  updateHistory(useHistory.map((h: UseHistory) => h.placeId === curPlace.placeId ? {
                    ...h,
                    placeTotalPrice: val
                  } : h));
                }}
                className={cn(
                  "flex-1 w-0 min-w-0 text-right text-base border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                  "sm:text-lg",
                  isEdit && "px-1 border-b-active-color/30 focus:border-b-active-color",
                )}
              />
              <span className="text-sm font-money">원</span>
            </div>
          </div>
        </div>

        {/* 장소 단위 제외 설정 */}
        {(isEdit || (curPlace.placeExcludeUser?.length || 0) > 0) && (
          <div className="flex px-3 pb-2 gap-1">
            {isEdit && (
              <div className="flex items-center shrink-0 gap-1 cursor-pointer z-10"
                   onPointerDown={(e) => e.stopPropagation()}>
                <AddBtn
                  label="세부 항목 추가"
                  type="detail"
                  placeId={curPlace.placeId}
                />
              </div>
            )}

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                return isEdit && openModal("ModalParticipantList", {
                  placeId: curPlace.placeId,
                  isPlaceLevel: true,
                })
              }}
              className={cn(
                "flex ml-auto px-2 py-1 bg-active-color/80 text-white font-money rounded-md text-sm transition-all z-10",
                isEdit ? "cursor-pointer hover:bg-active-color/90" : "cursor-default",
              )}
            >
              {(() => {
                // 1. 실제로 존재하는(이름이 있는) 참여자만 먼저 필터링합니다.
                const validExcludes = (curPlace.placeExcludeUser || []).filter((userId) => {
                  const findPeople = people.find((p) => p.userId === userId);
                  return findPeople && findPeople.userName.trim() !== "";
                });

                // 2. 필터링된 인원이 1명이라도 있으면 명단을 보여주고, 없으면 선택 문구를 보여줍니다.
                return validExcludes.length > 0 ? (
                  <div className="flex gap-1 items-center">
                    <div className="shrink-0 text-xs">장소 제외 :</div>
                    <div className="flex flex-wrap items-center gap-1">
                      {validExcludes.map((userId) => {
                        const findPeople = people.find((p) => p.userId === userId);
                        return (
                          <span
                            className="text-active-color shrink-0 text-xs bg-main-bg rounded-full px-2 py-1"
                            key={userId}>
                            {findPeople?.userName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <span>제외 인원 선택</span>
                );
              })()}
            </button>
          </div>
        )}
      </div>

      {/* 세부 항목 리스트 (AnimatePresence) */}
      <AnimatePresence initial={false}>
        {isSubDetail && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="p-2 flex flex-col gap-1 border-t-2 border-dashed border-gray-200">
              {curPlace.placeDetails.map((sub: UseHistoryDetails) => (
                <div key={sub.placeItemId} className={cn("flex flex-col items-center",
                  isEdit && "gap-y-1",
                  !isEdit && "pl-1",
                )}
                >
                  <div className="flex w-full gap-1">
                    {/* 세부내역 삭제 버튼 */}
                    {isEdit && (
                      <button
                        onClick={() => {
                          const nextDetails = curPlace.placeDetails.filter((d) => d.placeItemId !== sub.placeItemId);
                          updateHistory(useHistory.map((h: UseHistory) => h.placeId === curPlace.placeId ? {
                            ...h,
                            placeDetails: nextDetails,
                          } : h));
                        }}
                        className="self-center flex items-center justify-center text-red-500 font-bold size-5 hover:bg-red-100 transition-all rounded-full cursor-pointer"
                      >
                        <X size={14} strokeWidth={5} />
                      </button>
                    )}

                    <div className="flex-1 gap-2 grid grid-cols-[1fr_1fr]">
                      <div className="flex gap-1">
                        {!isEdit && (
                          <span className={cn("font-money text-main-color")}>ㄴ</span>
                        )}
                        {/* 세부 항목 이름 */}
                        <div className="relative flex flex-1">
                          <input
                            value={sub.placeItemName}
                            disabled={!isEdit}
                            onChange={(e) => {
                              const nextDetails = curPlace.placeDetails.map((d: UseHistoryDetails) => d.placeItemId === sub.placeItemId ? {
                                ...d,
                                placeItemName: e.target.value
                              } : d);
                              updateHistory(useHistory.map((h: UseHistory) => h.placeId === curPlace.placeId ? {
                                ...h,
                                placeDetails: nextDetails
                              } : h));
                            }}
                            className={cn(
                              "flex-1 w-0 text-base min-w-0 text-left border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                              "sm:text-lg",
                              isEdit && "px-1 border-b-active-color/30 focus:border-b-active-color",
                              !isEdit && "text-main-color"
                            )}
                            placeholder="항목 (예: 삼겹살)"
                          />
                          {isEdit && sub.placeItemName !== "" && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextDetails = curPlace.placeDetails.map((d: UseHistoryDetails) => d.placeItemId === sub.placeItemId ? {
                                  ...d,
                                  placeItemName: ""
                                } : d);
                                updateHistory(useHistory.map((h: UseHistory) => h.placeId === curPlace.placeId ? {
                                  ...h,
                                  placeDetails: nextDetails
                                } : h));
                              }}
                              className={cn("absolute p-0.5 rounded-full bg-sub-color text-white right-1 top-1/2 -translate-y-1/2 cursor-pointer",
                                "hover:bg-sub-color-hover"
                              )}
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 세부 항목 가격 */}
                      <div className="flex gap-1">
                        <input
                          value={sub.placeItemPrice.toLocaleString()}
                          disabled={!isEdit}
                          inputMode="numeric"
                          onChange={(e) => {
                            const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                            const nextDetails = curPlace.placeDetails.map((d: UseHistoryDetails) => d.placeItemId === sub.placeItemId ? {
                              ...d,
                              placeItemPrice: val
                            } : d);

                            updateHistory(useHistory.map((h: UseHistory) => h.placeId === curPlace.placeId ? {
                              ...h,
                              placeDetails: nextDetails,
                            } : h));
                          }}
                          className={cn(
                            "flex-1 w-0 text-base min-w-0 text-right border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                            "sm:text-lg",
                            isEdit && "px-1 border-b-active-color/30 focus:border-b-active-color",
                            !isEdit && "text-main-color"
                          )}
                        />
                        <span className="flex self-center text-[10px] font-money">원</span>
                      </div>
                    </div>

                    {isEdit && (
                      <button
                        onClick={() => openModal("ModalParticipantList", {
                          placeId: curPlace.placeId,
                          subItemId: sub.placeItemId,
                        })}
                        className="px-2 py-1 rounded-md font-money text-[10px] bg-sub-color hover:bg-active-color text-white cursor-pointer transition-all"
                      >
                        <span>제외하기</span>
                      </button>
                    )}
                  </div>

                  {/* 세부 항목 제외 인원 표시 */}
                  {(() => {
                    // 1. 실제로 존재하는 참여자만 필터링
                    const validItemExcludes = (sub.placeItemExcludeUser || []).filter((userId) => {
                      const findPeople = people.find((p) => p.userId === userId);
                      return findPeople && findPeople.userName.trim() !== "";
                    });

                    // 2. 유효한 제외 인원이 있을 때만 렌더링
                    if (validItemExcludes.length === 0) return null;

                    return (
                      <div className="flex w-full gap-1 cursor-default justify-end font-money items-center">
                        <div className="flex gap-1 shrink-0 text-sm">
                          <p>{sub.placeItemName}</p>
                          <p>제외 :</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {validItemExcludes.map((userId) => {
                            const findPeople = people.find((p) => p.userId === userId);
                            return (
                              <span
                                className="shrink-0 text-xs border border-active-color rounded-full px-2 py-1"
                                key={userId}>
                                {findPeople?.userName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
              {reMainPrice !== 0 && (
                <div className={cn("text-right font-money pt-1 pr-1",
                  !isEdit && "border-t-2 border-t-gray-200 text-red-600"
                )}>※ 미분류 잔액 : {reMainPrice.toLocaleString()}</div>
              )}

            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};

const Spend = ({ propsClass }: { propsClass: string }) => {
  const { openModal } = useModalStore();
  const { people, useHistory, isEdit, updateHistory } = useDataStore();

  const prevHistoryCountRef = useRef<number>(useHistory.length);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEdit && scrollRef.current && useHistory.length > prevHistoryCountRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
    prevHistoryCountRef.current = useHistory.length;
  }, [useHistory.length, isEdit]);

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden mb-safe-bottom", "sm:mb-5", propsClass)}>
      <div onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
           className="fixed z-100 top-0 w-full h-3"></div>

      <div className="relative mb-1 flex items-center justify-center text-center shrink-0">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-active-color h-[1px]"></div>
        <div className="relative z-1 px-2 bg-main-bg">지출 내역</div>
      </div>

      <div ref={scrollRef} className={cn("flex-1 overflow-y-auto p-2", "max-sm:pb-28")}>
        <Reorder.Group axis="y" values={useHistory} onReorder={updateHistory} className="grid grid-cols-1 gap-4">
          {useHistory.map((curPlace) => (
            <ReorderItem
              key={curPlace.placeId}
              curPlace={curPlace}
              isEdit={isEdit}
              useHistory={useHistory}
              updateHistory={updateHistory}
              people={people}
              openModal={openModal}
            />
          ))}
        </Reorder.Group>
      </div>

      {isEdit && (
        <div className="sm:p-3 sm:shrink-0">
          <AddBtn label="장소 추가" type="history" />
        </div>
      )}
    </div>
  );
};

export default Spend;