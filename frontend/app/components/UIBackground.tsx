export default function UIBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Background Hitam */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      
      {/* EFEK HALF CIRCLE (Glow Biru Besar di Bawah) */}
      <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-blue-600 via-indigo-600 to-transparent opacity-60 blur-[70px] rounded-t-full" />
      
      {/* Highlight Putih/Biru Muda di tengah (Inti Cahaya) */}
      <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-blue-400 opacity-40 blur-[50px] rounded-full" />
    </div>
  );
}