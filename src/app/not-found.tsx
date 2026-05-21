import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-[#fffdf7]">
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-5 px-5 py-16">
        <p className="text-sm font-black uppercase tracking-normal text-rose-800">
          404
        </p>
        <h1 className="text-4xl font-black tracking-normal sm:text-6xl">
          이 오타는 아직 사전에 없어요
        </h1>
        <p className="text-lg leading-8 text-zinc-700">
          아직 큐레이션되지 않은 오타입니다. 일단 ㅊ미 홈으로 돌아가 오늘의
          기분 전환을 보고 가세요.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-12 w-fit items-center justify-center rounded-[8px] bg-zinc-950 px-5 py-3 font-bold text-white"
        >
          ㅊ미 홈으로
        </Link>
      </section>
    </main>
  );
}
