function makeMoneyDetails({ setOpenModal }) {
  const goHome = () => {
    setOpenModal(false)
  }
  
  return (
    <div className="flex flex-col p-5 w-full gap-4">
      <h2 className="text-main-text text-3xl">모임 제목</h2>
      <input className="placeholder:text-sub-color placeholder:font-money border-[6px] h-14 text-xl px-2 border-main-color rounded-lg" type="text" id="pass" name="password" minLength="8" placeholder="모임 제목을 입력하세요" required/>
      <div className="text-main-text flex justify-between">
        <button className="px-1 py-2 w-32 text-2xl border-[6px] border-main-color rounded-lg" onClick={() => goHome()}>등록 취소</button>
        <button className="px-1 py-2 w-32 text-2xl bg-main-color text-white rounded-lg">등록</button>
      </div>
    </div>
  )
}

export default makeMoneyDetails;