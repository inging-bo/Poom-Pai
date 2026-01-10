import { useDataStore } from "@/store/useDataStore.ts";
import { cn } from "@/lib/utils.ts";
import { motion as Motion, AnimatePresence, type Transition } from "framer-motion";
import { useModalStore } from "@/store/modalStore.ts";

const ModalDetail = ({ modalId }: { modalId: string }) => {
  const {
    selectedUserId,
    setSelectedUserId,
    getUserExpenseDetails,
    people
  } = useDataStore();

  const { closeModal } = useModalStore();
  // 선택된 유저 정보 및 상세 지출 내역 계산
  const targetUser = people.find(p => p.userId === selectedUserId);
  const details = selectedUserId ? getUserExpenseDetails(selectedUserId) : [];

  // --- 장소별 그룹화 로직 추가 ---
  const groupedDetails = details.reduce((acc, item) => {
    if (!acc[item.placeName]) {
      acc[item.placeName] = [];
    }
    acc[item.placeName].push(item);
    return acc;
  }, {} as Record<string, typeof details>);

  // 총 합계 계산 (소수점 반올림 전 합산 후 최종 표시 시 반올림)
  const totalAmount = details.reduce((sum, item) => sum + item.amount, 0);

  // 모달 닫기 핸들러
  const handleClose = () => {
    setSelectedUserId(null); // 데이터 초기화
    closeModal(modalId);    // 모달 매니저에서 제거
  };

  const modalTransition: Transition = {
    type: "tween",        // spring 대신 tween 사용 (통통 튀지 않음)
    ease: "easeOut",      // 끝으로 갈수록 부드럽게 감속
    duration: 0.3         // 애니메이션 속도 (취향에 따라 0.2~0.4 권장)
  };

  return (
    <AnimatePresence>
      {selectedUserId && targetUser && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center">
          {/* 배경 레이어 (딤 처리) */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/10"
          />

          {/* 모달 본체 */}
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
            {/* 상단 드래그 핸들 (모바일 느낌용) */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            {/* 헤더 섹션 */}
            <div className="p-6 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  <span className="text-active-color">{targetUser.userName}</span> 님 상세
                </h2>
                <p className="text-sm text-gray-500 mt-1">지출된 상세 내역입니다.</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>

            {/* 상세 내역 리스트 영역 */}
            <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
              {Object.keys(groupedDetails).length > 0 ? (
                <ul className="flex flex-col gap-6 pb-6">
                  {Object.entries(groupedDetails).map(([placeName, items], pIdx) => {
                    // 장소별 합계 계산
                    const placeSum = items.reduce((sum, item) => sum + item.amount, 0);
                    // 세부 항목(ㄴ 표시 대상)이 하나라도 있는지 확인
                    const hasSubItems = items.some(item =>
                      item.itemName !== "장소 전체" && item.itemName !== "공통(미분류) 잔액"
                    );

                    return (
                      <li key={`${placeName}-${pIdx}`} className="flex flex-col gap-2">
                        {/* 장소명 (그룹 헤더 - Spend의 스타일 반영) */}
                        <div className="flex items-center gap-1 text-gray-400 border-b border-gray-100 pb-1">
                          <span className="font-money text-xs">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {placeName}
                          </span>
                          <div className="flex items-baseline gap-0.5 ml-auto">
                            <span className="text-active-color font-money font-bold">
                              {Math.round(placeSum).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 font-money">원</span>
                          </div>
                        </div>

                        {/* 세부 항목이 있을 때만 리스트 표시 */}
                        {hasSubItems && (
                          <div className="flex flex-col gap-3 pl-2">
                            {items.map((item, idx) => {
                              const isSubItem = item.itemName !== "장소 전체" && item.itemName !== "공통(미분류) 잔액";

                              // '장소 전체'나 '공통 잔액'은 헤더 합계와 중복될 수 있으므로 세부 리스트에서는 생략하거나
                              // 혹은 hasSubItems가 true일 때 모든 항목을 보여줄지 결정 가능합니다.
                              // 여기서는 ㄴ 스타일인 항목만 보여주도록 필터링 처리합니다.
                              if (!isSubItem) return null;

                              return (
                                <div key={`${item.itemName}-${idx}`} className="flex justify-between items-center">
                                  <div className="flex items-center gap-1">
                                    <span className="font-money text-gray-400 text-xs">ㄴ</span>
                                    <span className="text-sm font-bold text-gray-700">
                                      {item.itemName}
                                    </span>
                                  </div>

                                  <div className="flex items-baseline gap-0.5">
                                    <span className="font-money font-bold text-lg text-gray-800">
                                      {Math.round(item.amount).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 font-money">원</span>
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

            {/* 하단 합계 섹션 */}
            <div className={cn("p-6 bg-active-color/5 border-t border-active-color/10",
              "max-sm:pb-[calc(24px+env(safe-area-inset-bottom))]",
            )}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-600">지출 합계</span>
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