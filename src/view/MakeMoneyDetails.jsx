import { useNavigate } from "react-router-dom";

function makeMoneyDetails() {
  
  const navigate = useNavigate()
  
  const goHome = () => {
    navigate('/')
  }
  
  return (
    <>
      <div className="relative min-h-screen w-screen max-w-xl my-0 mx-auto flex flex-col justify-center items-center">
        <div className="flex flex-col border-black border-2">
          <label htmlFor="pass">모임 제목</label>
          <input type="text" id="pass" name="password" minLength="8" required/>
        </div>
        <div className="border-black border-2">
          <button onClick={() => goHome()} className="border-black border-2">등록 취소</button>
          <button className="border-black border-2">등록</button>
        </div>
      </div>
    </>
  )
}

export default makeMoneyDetails;