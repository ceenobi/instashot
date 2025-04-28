import Instagram from "@/assets/logo_instagram.png";
import preloadImage from "@/libs/preloadImage";

export function LazySpinner() {
  preloadImage(Instagram);
  return (
    <div className="flex flex-col gap-2 justify-center items-center h-screen relative">
      <img src={Instagram} alt="logo" className="w-[75px] h-[75px]" />
      <h1 className="text-md text-gray-500 absolute top-[90%]">
        &copy; {new Date().getFullYear()} Instashots
      </h1>
    </div>
  );
}

export function DataSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-bars loading-md bg-secondary"></span>
    </div>
  );
}
