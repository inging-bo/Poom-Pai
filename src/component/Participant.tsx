import { cn } from "@/lib/utils.ts";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { v4 } from "uuid";
import { useDataStore } from "@/store/useDataStore.ts";
import AddBtn from "@/ui/AddBtn.tsx";

const Participant = ({ propsClass } : { propsClass : string }) => {
  const {
    people, isEdit,
    updatePeople,
    getBalances
  } = useDataStore();

  const balances = getBalances();

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
          참여자 명단
        </div>
      </div>

      {/* 명단 리스트 스크롤 영역 */}
      <div className={cn("flex-1 overflow-y-auto p-2",
        "max-sm:pb-12"
      )}>
        <ul className={cn("grid items-stretch gap-2",
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
                  "sm:px-4",
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
                        "w-full min-w-0 text-right border-b-2 border-transparent font-money font-bold outline-none truncate bg-transparent transition-all",
                        item.userName.length > 10
                          ? "text-sm"
                          : item.userName.length > 7
                            ? "text-base"
                            : "text-lg",
                        isEdit && "px-1 border-b-2 border-b-active-color/30 focus:border-b-active-color"
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
                          "flex-1 w-0 min-w-0 text-right border-b-2 border-transparent font-money outline-none bg-transparent transition-all",
                          item.upFrontPayment.toLocaleString().length > 10
                            ? "text-sm"
                            : item.upFrontPayment.toLocaleString().length > 7
                              ? "text-base"
                              : "text-lg",
                          isEdit && "px-1 border-b-2 border-b-active-color/30 focus:border-b-active-color"
                        )}
                      />
                      <span className="text-sm font-money">원</span>
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
                      <span className="text-sm font-money">원</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {isEdit && (
        <div className="p-3 shrink-0">
          <AddBtn
            label="인원 추가"
            onClick={() => updatePeople([...people, { userId: v4(), userName: "", upFrontPayment: 0 }])}
          />
        </div>
      )}
    </div>
  )
}

export default Participant;