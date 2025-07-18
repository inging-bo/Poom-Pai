import React, { useEffect, useState } from 'react';
import { useModalStore } from "../store/modalStore.js";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase.js";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { EXCLUDE } from "../constant/contant.js";

const ModalParticipantList = ({
                                participantList,
                                setParticipantList,
                                historyList,
                                setHistoryList,
                                place,
                                placeId,
                                useMoney,
                                meetCode,
                                modalId
                              }) => {

  const { closeModal } = useModalStore();

  // 로딩 확인
  const [isLoading, setIsLoading] = useState(false)
  // 제외 인원 체크
  const [excludeCheck, setExcludeCheck] = useState([])
  // 에러 체크
  const [errorMsg, setErrorMsg] = useState("")

  const choice = (userId) => {
    if (excludeCheck.includes(userId)) {
      setExcludeCheck(prev => prev.filter(item => item !== userId))
    } else {
      setExcludeCheck(prev => [...prev, userId])
    }
  };
  async function excludeSave() {

    const currentPlace = historyList.find(p => p.placeId === placeId);
    const originalExclude = currentPlace?.excludeUser || [];

    // 변경 없으면 저장하지 않음
    const isSame =
      originalExclude.length === excludeCheck.length &&
      originalExclude.every(id => excludeCheck.includes(id));

    if (participantList.filter(p => p.name !== "").length === excludeCheck.length) {
      setErrorMsg(EXCLUDE.full)
      setTimeout(() => {
        setErrorMsg("");
      }, 600)
      return;
    }

    if (isSame) {
      setErrorMsg(EXCLUDE.same)
      setTimeout(() => {
        setErrorMsg("");
      }, 600)
      return;
    }

    try {
      setIsLoading(true)
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", meetCode));
      const querySnap = await getDocs(q);

      const matchedDoc = querySnap.docs[0];
      const docRef = doc(db, "MeetList", matchedDoc.id);

      const updatedHistory = historyList.map(p =>
        p.placeId === placeId ? { ...p, excludeUser: excludeCheck } : p
      );

      // 먼저 상태 업데이트
      setHistoryList(updatedHistory);

      const newData = {
        people: participantList.filter(people => people.name !== ""),
        history: updatedHistory.filter(history => history.name !== ""),
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, newData);
      console.log("데이터 업데이트 완료!");
    } catch (error) {
      console.error("데이터 저장 실패:", error);
    } finally {
      setIsLoading(false)
      closeModal(modalId)
    }
  }

  const close = () => {
    if (modalId) {
      closeModal(modalId)
    }
  }

  /* 페이지 로드 시 DB에 저장된 값을 가져옵니다 */
  useEffect(() => {
    const thisPlace = historyList.filter(list => list.placeId === placeId)
    setExcludeCheck(thisPlace.flatMap(item => item.excludeUser))

  }, []);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#00000050] z-50">
      <div
        className="flex flex-col max-w-xl gap-2 w-[90%] items-center bg-main-bg rounded-lg border-main-color border-6 py-4 px-4">
        <div className="text-2xl">사용처 : {place}</div>
        <div className="text-xl">제외할 사람을 선택하세요</div>
        <ul className="grid grid-cols-2 gap-2 w-full justify-items-center">
          {participantList.filter(people => people.name !== "").map(p => (
            <li
              key={p.userId}
              onClick={() => choice(p.userId)}
              className={`${excludeCheck.includes(p.userId) ? "opacity-100" : "opacity-30"}
              cursor-pointer flex w-full justify-between items-center border-2 border-main-color rounded-lg p-1`}
            >
              <span className="text-xl">
                {p.name}
              </span>
              <button className="cursor-pointer bg-main-color text-white font-money p-1 rounded-lg">제외</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 w-full justify-between">
          <Motion.button
            whileTap={{ y: 5 }}
            onClick={() => close()}
            className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg cursor-pointer">취소
          </Motion.button>
          <Motion.button
            whileTap={{ y: 5 }}
            onClick={() => excludeSave()}
            className="px-1 py-2 flex-1 text-2xl bg-main-color text-white rounded-lg flex justify-center items-center cursor-pointer">
            {isLoading ? (
              <div className="flex items-center gap-2">
                제외중
                <span
                  className="animate-spin w-5 aspect-square border-4 border-white rounded-full border-t-main-color">
                </span>
              </div>
            ) : (
              <span>제외하기</span>
            )}
          </Motion.button>
        </div>
        <AnimatePresence>
          {errorMsg && (
            <Motion.span
              key="duplicationMsg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { delay: 0.4 } }} // ✅ exit에 직접 transition 명시
              transition={{ opacity: { duration: 0.4 } }} // ✅ animate용
              className="text-center text-xl text-red-600"
            >
              {errorMsg}
            </Motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModalParticipantList;
