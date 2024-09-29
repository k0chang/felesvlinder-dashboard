export function LoadingView({ title }: { title: string }) {
  return (
    <div className="fixed top-0 left-0 w-full h-[100%] bg-white opacity-90 flex flex-col justify-center items-center">
      <div className=" w-36 h-36 bg-black flex flex-col justify-center items-center gap-2">
        <span className="animate-moving-moon w-12 h-12 rounded-[50%] inline-block box-border"></span>
        <p className="text-white">{title}</p>
      </div>
    </div>
  );
}
