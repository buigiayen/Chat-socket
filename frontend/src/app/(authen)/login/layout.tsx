import { Metadata } from "next";

  export const metadata: Metadata = {
    title: "Hệ thống chat emc - Socket",
    description: "Hệ thống chat emc của chúng tôi được tạo ra bởi socket.io",
  };

export default function layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-100 via-white to-blue-50 overflow-hidden">
      <div className="absolute bottom-0 right-[-100px] w-[300px] h-[300px] bg-blue-300 rounded-full filter blur-2xl opacity-20 z-0" />
      <main className="flex justify-center items-center flex-grow">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-100">
          {children}
        </div>
      </main>
    </div>
  );
}
