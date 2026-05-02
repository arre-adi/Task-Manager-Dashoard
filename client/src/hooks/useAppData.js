import { useContext } from "react";
import { AppDataContext } from "../context/AppDataContext.jsx";

export function useAppData() {
  return useContext(AppDataContext);
}

