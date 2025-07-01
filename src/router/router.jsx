import { Route, Routes } from "react-router-dom";
import Error from "../view/Error.jsx";
import Home from "../view/Home.jsx";

export default function Router() {

  return (
    <Routes>
      <Route path="*" element={<Error/>}/>
      <Route path="/" element={<Home/>}/>
      <Route path="/List" element={<Home/>}/>
    </Routes>
  );
}