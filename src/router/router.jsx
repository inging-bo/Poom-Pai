import { Route, Routes } from "react-router-dom";
import Error from "../view/Error.jsx";
import Home from "../view/Home.jsx";
import MoneyDetails from "../view/MoneyDetails.jsx";
import MakeMoneyDetails from "../view/MakeMoneyDetails.jsx";

export default function Router() {

  return (
    <Routes>
      <Route path="*" element={<Error/>}/>
      <Route path="/" element={<Home/>}/>
      <Route path="/money-details" element={<MoneyDetails/>}/>
      <Route path="/make-money-details" element={<MakeMoneyDetails/>}/>
    </Routes>
  );
}