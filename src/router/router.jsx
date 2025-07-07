import { Route, Routes, useLocation } from "react-router-dom";
import Error from "../view/Error.jsx";
import Home from "../view/Home.jsx";
import MoneyDetails from "../view/MoneyDetails.jsx";
import { AnimatePresence } from "framer-motion";

export default function Router() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="*" element={<Error/>}/>
        <Route path="/" element={<Home/>}/>
        <Route path="/money-details/:id" element={<MoneyDetails/>}/>
      </Routes>
    </AnimatePresence>
  );
}