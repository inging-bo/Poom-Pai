import React from 'react';
import { useModalStore } from "../store/modalStore.js";

const ModalParticipantList = ({ participantList, place, placeId, modalId }) => {
  console.log(placeId)
  const { closeModal } = useModalStore();
  
  const close = () => {
    if (modalId) {
      closeModal(modalId)
    }
  }
  
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#00000050] z-50">
      <div className="flex flex-col max-w-xl gap-4 w-[90%] items-center bg-main-bg rounded-lg border-main-color border-6 py-4 px-4">
        <div>사용처 : {place}</div>
        <div>제외할 인원을 선택하세요</div>
        <ul className="flex flex-col justify-center items-center ">
          {participantList.map((people) => (
            <li
              key={people.userId}
            >{people.name}</li>
          ))}
        </ul>
        <div className="flex gap-4 w-full justify-between">
          <button onClick={() => close()}
                  className="px-1 py-2 flex-1 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg">취소
          </button>
          <button
                  className="px-1 py-2 flex-1 text-2xl bg-main-color text-white rounded-lg">제외하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalParticipantList;
