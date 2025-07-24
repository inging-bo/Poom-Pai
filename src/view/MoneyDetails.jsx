import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import TextareaAutosize from 'react-textarea-autosize';
import { useModalStore } from "../store/modalStore.js";
import { v4 } from "uuid";
import { MODE, SAVEDATA } from "../constant/contant.js";

function MoneyDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // /money-details/:id 에서 추출

  const [isEdit, setIsEdit] = useState(false)

  const [totalMoney, setTotalMoney] = useState(0) // 총 경비
  const [haveMoney, setHaveMoney] = useState(0) // 남은 금액
  const [totalUse, setTotalUse] = useState(0)
  const [people, setPeople] = useState([]) // 참여자
  const [useHistory, setUseHistory] = useState([]) // 지출 내역
  const [meetEditCode, setMeetEditCode] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [dbPeople, setDbPeople] = useState([]) // 저장 시 변경사항 확인용
  const [dbUseHistory, setDbUseHistory] = useState([]) // 저장 시 변경사항 확인용

  const textArea = useRef(null)

  const { openModal } = useModalStore()

  const userId = v4();
  const placeId = v4();

  const goHome = () => {
    navigate('/')
  }

  /* 참여자 관련 */
  const addPeople = () => {
    if (!isEdit) return
    setPeople(prev => [...prev, { userId: userId, name: "", givePay: 0 }]);
  }

  const removePeople = (name, userId) => {
    if (!isEdit) return
    setPeople(prev => prev.filter(person => !(person.name === name && person.userId === userId)))
    setUseHistory(prev =>
      prev.map(list => ({
        ...list,
        excludeUser: list.excludeUser.filter(user => user !== userId)
      }))
    );
  }

  const changePeopleName = (userId, value) => {
    setPeople(prev =>
      prev.map(p => p.userId === userId ? { ...p, name: value } : p)
    )
  }

  const divideValue = (info) => {
    const realUserLength = people.filter(p => p.name !== "").length;

    // 각 사람의 divide를 초기화 (필요 시)
    const newPeople = people.map(p => ({ ...p, divide: 0 }));

    // 정산 분배
    useHistory.forEach(list => {
      const exclude = list.excludeUser || [];
      const numRecipients = realUserLength - exclude.length;

      if (numRecipients <= 0) return; // 나눌 대상 없으면 무시

      const dividedAmount = list.useMoney / numRecipients;

      // 분배
      for (let i = 0; i < newPeople.length; i++) {
        const p = newPeople[i];
        if (p.name !== "" && !exclude.includes(p.userId)) {
          newPeople[i].divide += dividedAmount;
        }
      }
    });

    // 현재 info에 해당하는 divide 금액 반환
    const target = newPeople.find(p => p.userId === info.userId);
    return target ? target.givePay - Math.round(target.divide) : 0;
  };
  const changeGivePay = (userId, value) => {
    const numberValue = Number(unComma(value));
    if (isNaN(numberValue)) return;

    setPeople(prev =>
      prev.map(p => p.userId === userId ? { ...p, givePay: numberValue } : p)
    );
  };

  // 쉼표 제거 → 숫자 추출
  const unComma = str => str.replace(/,/g, '');

  // 숫자에 쉼표 추가
  const addComma = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  /* 지출 내역 관련 */

  const changeUsePlaceName = (placeId, value) => {
    setUseHistory(prev =>
      prev.map(p => p.placeId === placeId ? { ...p, name: value } : p)
    )
  }

  const changeUseMoney = (placeId, value) => {
    const numberValue = Number(unComma(value));
    if (isNaN(numberValue)) return;

    setUseHistory(prev =>
      prev.map(p => p.placeId === placeId ? { ...p, useMoney: numberValue } : p)
    );
  };

  const addUseHistory = () => {
    setUseHistory(prev => [...prev, { placeId: placeId, name: "", useMoney: 0, excludeUser: [] }])
  }

  const removeUseHistory = (placeId) => {
    setUseHistory(prev => prev.filter((place) => !(place.placeId === placeId))
    )
  }

  async function saveListToMatchedCode(id, peopleList, useHistoryList) {
    // 변경 없으면 저장하지 않음
    const comparePeople = JSON.stringify(dbPeople) === JSON.stringify(people.filter(p => p.name !== ""))
    const compareUseHistory = JSON.stringify(dbUseHistory) === JSON.stringify(useHistory.filter(history => history.name !== ""))

    if (comparePeople && compareUseHistory) {
      return openModal("ModalNotice", {
        title: SAVEDATA.errorName.sameData
      })
    }

    try {
      setIsLoading(true)
      const meetListRef = collection(db, "MeetList");
      const q = query(meetListRef, where("code", "==", id));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        console.warn("해당 코드에 해당하는 문서가 없습니다.");
        return;
      }

      // 첫 번째 일치 문서만 사용 (중복되지 않는다고 가정)
      const matchedDoc = querySnap.docs[0];
      const docRef = doc(db, "MeetList", matchedDoc.id);

      const filterPeople = peopleList.filter(people => people.name !== "")
      const findUserId = filterPeople.map(item => item.userId)
      const filterHistory = useHistoryList.filter(history => history.name !== "" && history.excludeUser.filter(item => findUserId.includes(item)))

      // 저장할 데이터
      const newData = {
        people: filterPeople,
        history: filterHistory,
        updatedAt: new Date().toISOString(),
      };

      setDbPeople(filterPeople)
      setDbUseHistory(filterHistory)

      // 문서에 데이터 추가
      await updateDoc(docRef, newData);
      console.log("데이터 업데이트 완료!");
      openModal("ModalNotice", {
        title: SAVEDATA.success
      })
    } catch (error) {
      console.error("데이터 저장 실패:", error);
      openModal("ModalNotice", {
        title: SAVEDATA.errorName.error
      })
    } finally {
      setIsLoading(false)
    }
  }

  /* 수정 모드 */
  const handleEditMode = () => {
    if (!isEdit) {
      openModal("ModalEditMode", {
        meetCode: id,
        meetEditCode: meetEditCode,
        isEdit: isEdit,
        setIsEdit: setIsEdit,
      })
    } else {
      openModal("ModalNotice", {
        title: MODE.editEnd,
        cancelName: "아니요",
        onConfirmName: "수정 종료",
        isEdit: isEdit,
        setIsEdit: setIsEdit,
      })
    }
  }

  /* 제외인원 선택 모달 */
  const openParticipantListModal = (list) => {
    openModal("ModalParticipantList", {
      participantList: people,
      setParticipantList: setPeople,
      historyList: useHistory,
      setHistoryList: setUseHistory,
      place: list.name,
      placeId: list.placeId,
      useMoney: list.useMoney,
      meetCode: id
    })
  };
  /* 페이지 로드 시 DB에 저장된 값을 가져옵니다 */
  useEffect(() => {
    if (!id) return;

    async function getMoneyInfo(code) {
      try {
        const meetListRef = collection(db, "MeetList");
        const q = query(meetListRef, where("code", "==", code));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          console.log("해당 코드의 모임이 없습니다.");
          // 예: 에러 페이지로 이동하거나 메시지 표시
          return;
        }

        // 첫 번째 결과 가져오기
        const data = await querySnap.docs[0].data();
        const peopleList = data?.people ?? [];
        const useHistoryList = data?.history ?? [];
        const editCode = data?.edit ?? [];

        setPeople(peopleList);
        setUseHistory(useHistoryList);
        setMeetEditCode(editCode)

        setDbPeople(data.people)
        setDbUseHistory(data.history)
        /* 총 경비용 */
        setTotalMoney(peopleList.reduce((acc, cur) => acc + cur.givePay, 0))
        setTotalUse(useHistoryList.reduce((acc, cur) => acc + cur.useMoney, 0))
        setHaveMoney(totalMoney - useHistoryList.reduce((acc, cur) => acc + cur.useMoney, 0))
        console.log("불러온 데이터:", data);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      }
    }

    getMoneyInfo(id);
  }, []);

  useEffect(() => {
    const total = people.reduce((acc, cur) => acc + cur.givePay, 0);
    const used = useHistory.reduce((acc, cur) => acc + cur.useMoney, 0);

    setTotalMoney(total);
    setTotalUse(used)
    setHaveMoney(total - used);
  }, [people, useHistory]);

  return (
    <Motion.div
      className="relative min-h-[100dvh] w-screen max-w-xl my-0 mx-auto flex flex-col justify-start items-center"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="flex z-50 bg-main-bg border-b-2 border-main-color items-center w-full sticky top-0 justify-between pt-2 pb-1 px-2">
        {/* 상단 */}
        <div className="flex flex-col justify-center min-w-28">
          <div className="text-2xl text-center">
            총 경비
          </div>
          <div className="bg-main-bg text-center text-main-text px-2 py-1 text-lg font-money">
            {totalMoney.toLocaleString()}원
          </div>
        </div>
        <div className="flex flex-col justify-center min-w-32">
          <div className="text-2xl text-center">
            총 사용
          </div>
          <div className="bg-main-bg text-center text-main-text px-2 py-1 text-lg font-money">
            {totalUse.toLocaleString()}원
          </div>
        </div>
        <div className="flex flex-col justify-center min-w-32">
          <div className="text-2xl text-center">
            남은 금액
          </div>
          <div className={`
          ${haveMoney < 0 ? "text-[#ff0000]" : "text-main-text"}
          bg-main-bg text-center px-2 py-1 text-lg font-money`}>
            {haveMoney.toLocaleString()}원
          </div>
        </div>
      </div>
      <div className="relative border-b-2 border-main-color w-full text-center py-2">
        <span className="text-2xl bg-main-bg px-2">참여자 명단</span>
        <button
          onClick={() => handleEditMode()}
          className="flex gap-3 items-end h-9 right-[2%] absolute top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 bg-[#00000010] cursor-pointer">
          <span
            className={`${isEdit ? "text-main-text opacity-60 font-money" : "text-white font-Jal"} z-10`}>{MODE.normal}</span>
          <span
            className={`${isEdit ? "text-white font-Jal" : "text-main-text opacity-60 font-money"} z-10`}>{MODE.edit}</span>
          <span
            className={`${isEdit ? "left-9/20" : "left-0"} duration-200 absolute top-0 bottom-0 w-11/20 bg-active-color rounded-full`}></span>
        </button>
      </div>
      {/* 참여자 */}
      <ul className="flex flex-col gap-3 w-full pt-4 px-2 pb-4 overflow-hidden">
        <li className="flex">
          <span className="basis-[32%] text-2xl text-center">참석자</span>
          <span className="basis-[38%] text-2xl text-center">뿜빠이</span>
          <span className="basis-[38%] text-2xl text-center">선입금</span>
        </li>
        {people.length > 0 && (
          people.map(item => (
              <li
                key={item.userId}
                className="flex text-xl gap-2 font-money">
                {/* 참석자 이름 */}
                <div className="basis-[32%] flex justify-start items-center gap-1">
                  <AnimatePresence>
                    {isEdit && (
                      <Motion.span
                        onClick={() => removePeople(item.name, item.userId)}
                        key="removePeople"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 24 }}
                        exit={{ opacity: 0, width: 0 }} // ✅ exit에 직접 transition 명시
                        className={`
                        text-main-color text-2xl aspect-square h-6 border-sub-color border-1 rounded-full flex justify-center items-center cursor-pointer`}>
                        -
                      </Motion.span>
                    )}
                  </AnimatePresence>
                  <input
                    value={item.name}
                    onChange={(e) => changePeopleName(item.userId, e.target.value)}
                    disabled={!isEdit}
                    className={`
                    ${isEdit ? "bg-[#00000010]" : ""}
                    focus:outline-3 focus:outline-active-color w-full p-1 text-center`}
                    type="text" placeholder="이름"/>
                </div>
                {/* 뿜빠이 금액 */}
                <div className="basis-[38%] flex gap-1 justify-end items-center text-right">
                  <div className={`
                  ${divideValue(item) < 0 ? "text-[#ff0000]" : "text-main-text"}
                  bg-main-bg text-right pl-2 py-1 text-xl font-money`}>
                    {divideValue(item).toLocaleString()}
                  </div>
                  <span>원</span>
                </div>
                {/* 지불한 금액 */}
                <div className="basis-[38%] flex gap-1 items-center text-right">
                  <input
                    value={addComma(item.givePay)}
                    disabled={!isEdit}
                    onChange={(e) => changeGivePay(item.userId, e.target.value)}
                    className={`
                    ${isEdit ? "bg-[#00000010]" : ""}
                    focus:outline-3 focus:outline-active-color w-full py-1 text-lg text-right pr-1 backdrop-opacity-50`}
                    inputMode="numeric" pattern="[0-9]*" placeholder="0"/>
                  <span>원</span>
                </div>
              </li>
            )
          )
        )}
        {isEdit && (
          <Motion.li
            whileTap={{ y: 5 }}
            onClick={() => addPeople()}
            className={`
            p-3 text-center text-xl text-main-color border-2 border-sub-color mx-[10%] rounded-full cursor-pointer`}>인원
            추가
            +
          </Motion.li>
        )}
      </ul>
      <div className="
      before:content-[''] before:absolute before:-z-20  before:left-0 before:right-0 before:bottom-1/2 before:h-1 befor before:-translate-y-1/2 before:top-1/2 before:bg-main-color
      relative text-2xl w-full text-center py-2">
        <span className="bg-main-bg px-2">지출 내역</span>
      </div>
      {/* 사용처 */}
      <ul className="flex flex-col gap-3 w-full py-4 px-2 mb-24">
        <li className="flex">
          <span className="flex-1 text-2xl text-center">사용처</span>
          <span className="flex-1 text-2xl text-center">사용 금액</span>
          <span className="flex-1 text-2xl text-center">제외 인원</span>
        </li>
        {useHistory.length > 0 && (
          useHistory.map(list => (
            <li
              key={list.placeId}
              className="relative flex text-xl gap-2 font-money flex-nowrap ">
              {/* 사용처 */}
              <span className="basis-[32%] flex justify-start items-center gap-1">
                  <AnimatePresence>
                    {isEdit && (
                      <Motion.span
                        onClick={() => removeUseHistory(list.placeId)}
                        key="removeUseHistory"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 24 }}
                        exit={{ opacity: 0, width: 0 }} // ✅ exit에 직접 transition 명시
                        className={`
                        text-main-color text-2xl aspect-square h-6 border-sub-color border-1 rounded-full flex justify-center items-center cursor-pointer`}>
                        -
                      </Motion.span>
                    )}
                  </AnimatePresence>
                  <TextareaAutosize
                    ref={textArea}
                    disabled={!isEdit}
                    onFocus={() => {
                      textArea.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                      });
                    }}
                    value={list.name}
                    onChange={(e) => changeUsePlaceName(list.placeId, e.target.value)}
                    className={`
                    ${isEdit ? "bg-[#00000010]" : ""}
                    focus:outline-3 focus:outline-active-color w-full p-1 text-center resize-none`}
                    name="사용처" placeholder="사용처"/>
              </span>
              {/* 사용 금액 */}
              <span className="flex-1 items-center flex gap-1 text-right">
                 <input
                   value={addComma(list.useMoney)}

                   onChange={(e) => changeUseMoney(list.placeId, e.target.value)}
                   className={`
                   ${isEdit ? "bg-[#00000010]" : ""}
                   focus:outline-3 focus:outline-active-color w-full py-1 text-lg text-right pr-1 backdrop-opacity-50`}
                   inputMode="numeric" pattern="[0-9]*" placeholder="0"/>
                <span>원</span>
              </span>
              {/* 제외 인원 */}
              <Motion.ul
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  openParticipantListModal(list)
                }}
                className={`
                ${list.excludeUser?.length === 0 ? "bg-[#00000010]" : ""}
                relative flex-1 items-center gap-0.5 flex flex-wrap between cursor-pointer`}>
                {list.excludeUser?.length !== 0 ? (
                  people.map(p => list.excludeUser?.includes(p.userId) && (
                    <li
                      key={p.userId}
                      className="text-xs w-[32%] bg-sub-color text-nowrap text-white text-center rounded-lg py-0.5 px-1">
                      {p.name}
                    </li>
                  ))
                ) : (
                  <li className="text-lg flex-1 text-center font-Jal ">추가 +</li>
                )}
              </Motion.ul>
            </li>
          ))
        )}
        {isEdit && (
          <Motion.li
            whileTap={{ y: 5 }}
            onClick={() => addUseHistory()}
            className="p-3 text-center text-xl text-main-color border-2 border-sub-color mx-[10%] rounded-full cursor-pointer">사용처
            추가
            +
          </Motion.li>
        )}
      </ul>
      <div
        className="fixed flex gap-5 px-4 justify-around max-w-xl bottom-[0dvh] pt-3 pb-6 border-t-2 border-main-color bg-main-bg w-full">
        <Motion.button
          whileTap={{ y: 5 }}
          onClick={() => goHome()}
          className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg cursor-pointer">
          뒤로가기
        </Motion.button>
        <Motion.button
          whileTap={{ y: 5 }}
          onClick={() => saveListToMatchedCode(id, people, useHistory)}
          className="px-1 py-2 flex justify-center items-center flex-1 text-2xl bg-main-color text-white rounded-lg cursor-pointer">
          {isLoading ? (
            <div className="flex items-center gap-2">
              저장중
              <span
                className="animate-spin w-5 aspect-square border-4 border-white rounded-full border-t-main-color">
                </span>
            </div>
          ) : (
            <span>저장</span>
          )}
        </Motion.button>
      </div>
    </Motion.div>
  )
}

export default MoneyDetails;