import { useContext } from "react";
import { TranslationContext } from "../context/TranslationContext";

const useTranslation = () => {
  return useContext(TranslationContext);
};

export default useTranslation;
