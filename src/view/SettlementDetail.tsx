import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useEffect } from "react";
import { useDataStore } from "@/store/useDataStore.ts";
import { cn } from "@/lib/utils.ts";
import Participant from "@/component/Participant.tsx";
import Spend from "@/component/Spend.tsx";
import SummaryBox from "@/ui/SummaryBox.tsx";
import { useTab } from "@/hooks/useTab.ts";
import EditModeBtn from "@/ui/EditModeBtn.tsx";
import { useModalStore } from "@/store/modalStore.ts";

function SettlementDetail() {

  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const { tab, setTab } = useTab();

  const {
    meetTitle, enterMeet, getTotals, toggleEditMode, isEdit, saveAllData, isLocal, startLocalMeet
  } = useDataStore();

  const { openModal } = useModalStore();

  const totals = getTotals();

  // 1. 브라우저 새로고침 및 탭 닫기 제어
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 수정 중이고 로컬 모드가 아닐 때만 경고
      if (isEdit && !isLocal) {
        e.preventDefault();
        e.returnValue = ""; // Chrome에서 경고창을 띄우기 위해 필요
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEdit, isLocal]);

  // 2. 라우터 내부 이동(뒤로 가기 등) 제어
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      // 수정 중이고 + 로컬 모드가 아니며 + 현재 경로와 다음 경로가 다를 때 차단
      isEdit && !isLocal && currentLocation.pathname !== nextLocation.pathname
  );

  // Blocker 상태에 따른 모달 제어
  useEffect(() => {
    if (blocker.state === "blocked") {
      openModal("ModalNotice", {
        title: "수정 중인 내용이 있습니다.",
        message: "저장하지 않고 나가시겠습니까?",
        showCancel: true,
        confirmText: "저장 후 나가기",
        cancelText: "닫기",
        onConfirm: async () => {
          try {
            await saveAllData();
            // 저장 성공 시 편집 모드 해제 후 이동 승인
            toggleEditMode(false);
            blocker.proceed();
          } catch (error) {
            console.error(error);
            openModal("ModalNotice", { title: "저장 중 오류가 발생했습니다." });
          }
        },
        onCancel: () => {
          // 이동 취소 및 현재 페이지 유지
          blocker.reset();
        }
      });
    }
  }, [blocker, openModal, saveAllData, toggleEditMode]);

  useEffect(() => {

    if (routeId === "local") {
      // URL이 local이면 로컬 모드 시작 (새로고침 시에도 다시 실행됨)
      startLocalMeet("정산하기 (저장X)");
    } else if (routeId) {
      // 그 외의 ID가 있으면 서버에서 데이터 가져오기
      enterMeet(routeId);
    }

    return () => {
      toggleEditMode(false);
    };
  }, [routeId, enterMeet, startLocalMeet, toggleEditMode]);

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
            className="bg-main-color flex items-center px-4 py-2 rounded-lg hover:bg-active-color text-white active:bg-active-color/90 cursor-pointer"
          >
            나가기
          </Motion.button>
        </div>

        {/* 중앙: 본인 크기만큼만 차지 */}
        <h1 className="text-xl max-w-1/2 text-main-color truncate shrink-0 px-2">
          {meetTitle || "정보 불러오는 중..."}
        </h1>

        {/* 오른쪽: flex-1로 공간 확보 (왼쪽과 대칭) */}
        <div className="flex-1 gap-2 shrink-0 flex justify-end items-center">
          {/* 40rem (640px) 이상에서만 보임 */}
          <EditModeBtn
            propsClass="relative max-sm:hidden sm:font-money"
          />
        </div>
      </div>
      <main className={cn(
        "flex-1 grid grid-cols-1 overflow-hidden",
        "grid-cols-1 grid-rows-[1fr_auto]",
        // PC: 가로 2열로 배치하고, 세로는 전체를 다 씀
        "sm:grid-cols-2 sm:grid-rows-1"
      )}>
        {/* 참여자 명단: 모바일일 때는 tab이 0일 때만 보이고, PC(sm) 이상이면 항상 보임 */}
        <Participant propsClass={cn("",
          tab !== 0 && "hidden sm:flex",
        )} />

        {/* 지출 내역: 모바일일 때는 tab이 1일 때만 보이고, PC(sm) 이상이면 항상 보임 */}
        <Spend propsClass={cn("",
          tab !== 1 && "hidden sm:flex",
        )} />

        {/* 40rem (640px) 미만에서만 보임 */}
        <div className={cn(
          "fixed bottom-safe-bottom z-50 w-full h-12 px-4 gap-2 flex", // 기본 flex 구조 유지
          "sm:hidden" // PC에서는 좌우 패딩 제거 (필요시 조절)
        )}>
          <div className={cn("absolute left-1/2 -translate-x-1/2 bottom-full flex justify-center w-full mb-2",
            ""
          )}>
            <EditModeBtn
              propsClass="relative"
            />
          </div>

          {/* 탭 버튼 영역: sm 미만(모바일)에서만 flex로 노출, sm 이상에서는 hidden */}
          <div className={cn(
            "flex w-full gap-2",
            "sm:hidden"
          )}>
            <button
              onClick={() => setTab(0)}
              className={cn(
                "flex-1 h-12 py-2 rounded-lg text-sm font-bold transition-all",
                tab === 0 ? "bg-main-color text-white shadow-md" : "bg-gray-100 text-gray-400"
              )}
            >
              참여자 명단
            </button>
            <button
              onClick={() => setTab(1)}
              className={cn(
                "flex-1 h-12 max-h-12 py-2 rounded-lg text-sm font-bold transition-all",
                tab === 1 ? "bg-main-color text-white shadow-md" : "bg-gray-100 text-gray-400"
              )}
            >
              지출 내역
            </button>
          </div>
        </div>
      </main>
    </Motion.div>
  );
}

export default SettlementDetail;