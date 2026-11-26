"use client";

import { useRouter } from "next/navigation";

export const useNavigate = () => {
  const router = useRouter();
  return (to, options) => {
    if (typeof to === "number") {
      if (to === -1) {
        router.back();
      }
      return;
    }
    router.push(to);
  };
};
