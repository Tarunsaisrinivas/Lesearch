import Image from "next/image";

export const Heroes = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center max-w-5xl select-none">
      <div className="flex items-center justify-between w-full">
        <div className="relative w-[200px] h-[200px] sm:w-[150px] sm:h-[150] md:h-[200px] md:w-[400px]">
          <Image
            src="/assets/documents.png"
            alt="heroes"
            fill
            className="w-[90px] object-contain md:w-[180px] dark:invert"
          />
        </div>
        <div className="relative h-[200px] w-[400px] hidden md:block">
          <Image
            src="/assets/reading.png"
            alt="heroes"
            fill
            className="w-[90px] object-contain md:w-[150px] dark:invert"
          />
        </div>
      </div>
    </div>
  );
};
