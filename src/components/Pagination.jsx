import React from "react";

// 문제점 : 다른 페이지 넘버에 갔다가 이전 페이지 넘버로 이동 시 두개가 합쳐지는 현상 발생 => map함수로 컴포넌트 그릴때 각 컴포넌트가 다른 Id를 가지고 있으면 문제 발생하지 않음
function Pagination({ total, limit, page, setPage }) {
  const numPages = Math.ceil(total / limit);

  return (
    <>
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="w-[2vh] h-full text-[1.5vh] text-white disabled:text-[#777777] disabled:cursor-default"
      >
        &lt;
      </button>
      {Array(numPages)
        .fill()
        .map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            aria-current={page === i + 1 ? "page" : null}
            className="w-[2vh] h-[2.5vh] px-[0.5vh] text-[#D9D9D9] text-[1.5vh] aria-[current]:text-white aria-[current]:font-[800] aria-[current]:text-[1.6vh]"
          >
            {i + 1}
          </button>
        ))}
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === numPages}
        className="w-[2vh] h-full text-[1.5vh] text-white disabled:text-[#777777] disabled:cursor-default"
      >
        &gt;
      </button>
    </>
  );
}

export default Pagination;
