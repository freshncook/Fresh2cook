"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/919811001901"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 bg-[#25D366] p-4 rounded-full shadow-xl"
    >
      <FaWhatsapp
        size={36}
        color="white"
      />
    </a>
  );
}




