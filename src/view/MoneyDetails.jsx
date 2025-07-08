import { useNavigate, useParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";

function MoneyDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // /money-details/:id 에서 추출

  const [totalMoney, setTotalMoney] = useState(0) // 총 경비
  const [haveMoney, setHaveMoney] = useState(0) // 남은 금액
  const [people, setPeople] = useState([]) // 참여자
  const [useHistory, setUseHistory] = useState([]) // 지출 내역

  const goHome = () => {
    navigate('/')
  }

  /* 참여자 관련 */
  const addPeople = () => {
    setPeople(prev => [...prev, { name: "", givePay: 0 }]);
  }

  const removePeople = (name, idx) => {
    setPeople(prev => prev.filter((person, i) => !(person.name === name && i === idx))
    )
  }

  const changePeopleName = (idx, value) => {
    setPeople(prev =>
      prev.map((p, i) =>
        i === idx ? { ...p, name: value } : p
      )
    )
  }

  const changeGivePay = (idx, value) => {
    // 문자열인 value를 숫자로 변환
    const numberValue = Number(value)

    // 숫자가 아니면 무시
    if (isNaN(numberValue)) return

    // 값이 숫자일 경우 상태 업데이트
    setPeople(prev =>
      prev.map((p, i) =>
        i === idx ? { ...p, givePay: numberValue } : p
      )
    )
  }


  useEffect(() => {
    setTotalMoney(people.reduce((acc, cur) => acc + cur.givePay, 0))
    console.log('gdgd')
  }, [people.map(list => list.givePay)])

  /* 지출 내역 관련 */
  const addUseHistory = () => {
    setUseHistory(prev => [...prev, { name: "", useMoney: 0 }])
  }

  const removeUseHistory = (name, idx) => {
    setUseHistory(prev => prev.filter((place, i) => !(place.name === name && i === idx))
    )
  }

  async function saveListToMatchedCode(id, peopleList, useHistoryList) {
    try {
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

      // 저장할 데이터
      const newData = {
        people: peopleList,
        history: useHistoryList,
        updatedAt: new Date().toISOString(),
      };

      // 문서에 데이터 추가
      await updateDoc(docRef, newData);
      console.log("데이터 업데이트 완료!");
    } catch (error) {
      console.error("데이터 저장 실패:", error);
    }
  }

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
        const useHistoryList = data?.histrory ?? [];
        setPeople(peopleList);
        setUseHistory(useHistoryList);
        setTotalMoney(peopleList.reduce((acc, cur) => acc + cur.givePay, 0))
        console.log("불러온 데이터:", data);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      }
    }

    getMoneyInfo(id);
  }, [id]);

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
        <div className="flex flex-col justify-center">
          <div className="text-2xl text-center">
            총 경비
          </div>
          <div className="bg-main-bg text-center text-main-text px-2 py-1 text-xl font-money">
            {totalMoney}원
          </div>
        </div>
        <div>
          <div className="text-2xl text-center">
            남은 금액
          </div>
          <div className="bg-main-bg text-center text-main-text px-2 py-1 text-xl font-money">
            {haveMoney}원
          </div>
        </div>
      </div>
      <div className="
      {/*before:content-[''] before:absolute before:-z-20  before:left-0 before:right-0 before:bottom-1/2 before:h-1 befor before:-translate-y-1/2 before:top-1/2 before:bg-main-color*/}
      relative text-2xl border-b-2 border-main-color w-full text-center py-2">
        <span className="bg-main-bg px-2">참여자 명단</span>
      </div>
      {/* 참여자 */}
      <ul className="flex flex-col gap-3 w-full pt-4 px-2 pb-8">
        <li className="flex">
          <span className="basis-[32%] text-2xl text-center">참석자</span>
          <span className="basis-[38%] text-2xl text-center">뿜빠이</span>
          <span className="basis-[38%] text-2xl text-center">지불 금액</span>
        </li>
        {people.length > 0 && (
          people.map((people, idx) => (
              <li
                key={idx}
                className="flex text-xl gap-2 font-money">
                {/* 참석자 이름 */}
                <span className="basis-[32%] flex justify-start items-center gap-2">
                <span
                  onClick={() => removePeople(people.name, idx)}
                  className="text-main-color text-2xl aspect-square w-6 h-6 border-sub-color border-1 rounded-full flex justify-center items-center cursor-pointer">
                  -
                </span>
                <input
                  value={people.name}
                  onChange={(e) => changePeopleName(idx, e.target.value)}
                  className="w-full p-1 text-left bg-[#00000010]" type="text" placeholder="이름"/>
              </span>
                {/* 뿜빠이 금액 */}
                <span className="basis-[38%] flex gap-1 items-center text-right">
                <span className="w-full py-1 text-lg text-right">
                  3
                </span>
                <span>원</span>
              </span>
                {/* 지불한 금액 */}
                <span className="basis-[38%] flex gap-1 items-center text-right">
                <input
                  value={people.givePay}
                  onChange={(e) => changeGivePay(idx, e.target.value)}
                  className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50"
                  inputMode="numeric" pattern="[0-9]*" placeholder="0"/>
                <span>원</span>
              </span>
              </li>
            )
          )
        )}
        <li
          onClick={() => addPeople()}
          className="p-3 text-center text-xl text-main-color border-2 border-sub-color mx-[10%] rounded-full">인원 추가
          +
        </li>
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
          useHistory.map((list, idx) => (
            <li
              key={idx}
              className="flex text-xl gap-2 font-money flex-wrap">
            <span className="flex-1 flex justify-start items-center gap-2">
              <span
                onClick={() => removeUseHistory(list.name, idx)}
                className="text-main-color text-2xl aspect-square w-6 h-6 border-sub-color border-1 rounded-full flex justify-center items-center">
                -
              </span>
              {list.name ? (
                  <span className="flex h-full justify-center items-center">
                    {list.name}
                  </span>
                )
                : (
                  <input className="w-full py-1 text-center bg-[#00000010]" type="text" placeholder="이름"/>
                )}
            </span>
              <span className="flex-1 items-center flex gap-1 text-right">
              <input className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50"
                     inputMode="numeric" pattern="[0-9]*" placeholder="0"/><span>원</span>
            </span>
              <span className="flex-1 items-center flex gap-1 text-right">
              <input className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50"
                     inputMode="numeric" pattern="[0-9]*" placeholder="0"/>
            </span>
            </li>
          ))
        )}
        <li
          onClick={() => addUseHistory()}
          className="p-3 text-center text-xl text-main-color border-2 border-sub-color mx-[10%] rounded-full">사용처 추가
          +
        </li>
      </ul>
      <div
        className="fixed flex gap-5 px-4 justify-around max-w-xl bottom-[0dvh] pt-3 pb-6 border-t-2 border-main-color bg-main-bg w-full">
        <button onClick={() => goHome()}
                className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg">
          뒤로가기
        </button>
        <button
          onClick={() => saveListToMatchedCode(id, people, useHistory)}
          className="px-1 py-2 flex-1 text-2xl bg-main-color text-white rounded-lg">저장
        </button>
      </div>
    </Motion.div>
  )
}

export default MoneyDetails;