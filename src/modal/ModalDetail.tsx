import { useDataStore } from "@/store/useDataStore.ts";
import { cn } from "@/lib/utils.ts";
import { motion as Motion, AnimatePresence, type Transition } from "framer-motion";
import { useModalStore } from "@/store/modalStore.ts";
import { X } from "lucide-react";

const ModalDetail = ({ modalId }: { modalId: string }) => {
  const {
    selectedUserId,
    setSelectedUserId,
    getUserExpenseDetails,
    people,
    useHistory // 실제 사용 금액을 가져오기 위해 추가
  } = useDataStore();

  const { closeModal } = useModalStore();
  const targetUser = people.find(p => p.userId === selectedUserId);
  const details = selectedUserId ? getUserExpenseDetails(selectedUserId) : [];

  // --- 장소별 그룹화 로직 ---
  const groupedDetails = details.reduce((acc, item) => {
    if (!acc[item.placeName]) {
      acc[item.placeName] = [];
    }
    acc[item.placeName].push(item);
    return acc;
  }, {} as Record<string, typeof details>);

  const totalAmount = details.reduce((sum, item) => sum + item.amount, 0);

  const handleClose = () => {
    setSelectedUserId(null);
    closeModal(modalId);
  };

  const modalTransition: Transition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.3
  };

  return (
    <AnimatePresence>
      {selectedUserId && targetUser && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center">
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/10"
          />

          <Motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={modalTransition}
            className={cn(
              "relative w-full bg-white rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]",
              "sm:max-w-md sm:rounded-[2rem] sm:border-t-0",
              "border-t-4 border-active-color "
            )}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            <div className="p-6 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl text-gray-800">
                  <span className="text-active-color">{targetUser.userName}</span> 님
                </h2>
                <p className="text-sm text-gray-500 mt-1">지출된 상세 내역입니다.</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 active:scale-95 active:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X strokeWidth={4} className="text-gray-400">×</X>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
              {Object.keys(groupedDetails).length > 0 ? (
                <ul className="flex flex-col gap-6 pb-6">
                  {Object.entries(groupedDetails).map(([placeName, items], pIdx) => {
                    const placeSum = items.reduce((sum, item) => sum + item.amount, 0);

                    // 해당 장소 정보 찾기 (전체 금액 및 세부 항목 금액 참조용)
                    const originalPlace = useHistory.find(h => h.placeName === placeName);
                    const actualTotalPrice = originalPlace?.placeTotalPrice || 0;

                    const subListItems = items.filter(item => item.itemName !== "장소 전체");
                    const hasSubItems = subListItems.length > 0;

                    return (
                      <li key={`${placeName}-${pIdx}`} className="flex flex-col gap-2">
                        {/* 장소명 (그룹 헤더) */}
                        <div className="flex items-center gap-1 border-b border-gray-100 pb-1">
                          <span className="font-money text-lg">•</span>
                          <div className="flex flex-col">
                            <span className={cn("text-sm uppercase tracking-tight text-main-text",
                              "sm:text-lg"
                            )}>
                              {placeName}
                            </span>
                            <span className={cn("text-[10px] font-money text-gray-400",
                              "sm:text-xs"
                            )}>
                              전체 {actualTotalPrice.toLocaleString()}원 중
                            </span>
                          </div>

                          <div className="flex items-baseline gap-0.5 ml-auto">
                            <span className={cn("text-lg text-main-text",
                            )}>
                              {Math.round(placeSum).toLocaleString()}
                            </span>
                            <span className={cn("text-sm text-gray-500 font-money",
                              "sm:text-lg"
                            )}>원</span>
                          </div>
                        </div>

                        {/* 세부 항목 및 미분류 잔액 리스트 */}
                        {hasSubItems && (
                          <div className="flex flex-col gap-3 pl-2">
                            {subListItems.map((item, idx) => {
                              const isRemaining = item.itemName === "공통(미분류) 잔액";

                              // 해당 세부 항목의 실제 총 사용 금액 찾기
                              const originalDetail = originalPlace?.placeDetails?.find(d => d.placeItemName === item.itemName);
                              const detailTotalAmount = originalDetail?.placeItemPrice || 0;

                              return (
                                <div key={`${item.itemName}-${idx}`} className="flex justify-between items-center">
                                  <div className="flex items-center gap-1">
                                    {!isRemaining && (
                                      <span className="font-money text-gray-400 text-xs">ㄴ</span>
                                    )}
                                    <div className="flex flex-col">
                                      <span className={cn(
                                        "text-sm font-money",
                                        "sm:text-base",
                                        isRemaining ? "text-active-color" : "text-main-color"
                                      )}>
                                        {item.itemName}
                                      </span>
                                      {/* 세부 항목 총 금액 표시 (미분류 잔액 제외) */}
                                      {!isRemaining && detailTotalAmount > 0 && (
                                        <span className="text-[9px] font-money text-gray-400">
                                          총 {detailTotalAmount.toLocaleString()}원
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-baseline gap-0.5">
                                    <span className={cn(
                                      "font-money",
                                      isRemaining ? "text-active-color" : "text-main-color"
                                    )}>
                                      {Math.round(item.amount).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-money">원</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-16 text-center text-gray-400 font-money">
                  계산된 내역이 없습니다.
                </div>
              )}
            </div>

            <div className={cn("p-6 bg-active-color/5 border-t border-active-color/10", "max-sm:pb-[calc(24px+env(safe-area-inset-bottom))]")}>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">지출 합계</span>
                <div className="text-xl font-money font-black text-active-color">
                  {Math.round(totalAmount).toLocaleString()}
                  <span className="text-sm ml-1">원</span>
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalDetail;