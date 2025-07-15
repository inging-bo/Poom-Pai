import React, { useEffect, useState } from 'react';
import { useModalStore } from "../store/modalStore.js";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase.js";

const ModalParticipantList = ({
                                participantList,
                                setParticipantList,
                                historyList,
                                setHistoryList,
                                place,
                                placeId,
                                meetCode,
                                modalId
                              }) => {

  const { closeModal } = useModalStore();

  const [isLoding, setIsLoding] = useState(false)
  const [excludeCheck, setExcludeCheck] = useState([])

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

    if (isSame) {
      console.log("변경 사항 없음. 저장하지 않음.");
      return;
    }

    const updatedHistory = historyList.map(p =>
      p.placeId === placeId ? { ...p, excludeUser: excludeCheck } : p
    );

    // 먼저 상태 업데이트
    setHistoryList(updatedHistory);

    try {
      setIsLoding(true)
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", meetCode));
      const querySnap = await getDocs(q);

      const matchedDoc = querySnap.docs[0];
      const docRef = doc(db, "MeetList", matchedDoc.id);

      const newData = {
        people: participantList,
        history: updatedHistory,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, newData);
      console.log("데이터 업데이트 완료!");
    } catch (error) {
      console.error("데이터 저장 실패:", error);
    } finally {
      setIsLoding(false)
    }
  }

  console.log(isLoding)
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
          {participantList.map((people) => (
            <li
              key={people.userId}
              onClick={() => choice(people.userId)}
              className={`${excludeCheck.includes(people.userId) ? "opacity-100" : "opacity-30"}
              cursor-pointer flex w-full justify-between items-center border-2 border-main-color rounded-lg p-1`}
            >
              <span className="text-xl">{people.name}
              </span>
              <button className="cursor-pointer bg-main-color text-white font-money p-1 rounded-lg">제외</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 w-full justify-between">
          <button onClick={() => close()}
                  className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg cursor-pointer">취소
          </button>
          <button
            onClick={() => excludeSave()}
            className="px-1 py-2 flex-1 text-2xl bg-main-color text-white rounded-lg flex gap-2 justify-center items-center cursor-pointer">제외하기
            {isLoding && (
              <span
              className="animate-spin h-1/2 aspect-square border-4 border-white rounded-full border-t-main-color"></span>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalParticipantList;
