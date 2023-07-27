import { useEffect } from "react";

export function useRoulette({
  // isTitleLoading,
  isRoulette,
  titleList,
  roulette,
  title,
}) {
  useEffect(() => {
    const colors = ["#FFFFFF", "#F1F1F1"];
    const canvasRef = roulette.current;
    const canvas = canvasRef.getContext(`2d`);

    const newMake = async () => {
      // 캔버스의 중앙점 구하기
      const [cw, ch] = [canvasRef.width / 2, canvasRef.height / 2];
      const arc = Math.PI / 4;
      // 룰렛 배경 항목 수에 따라 그리기 : 8개
      for (let i = 0; i < 8; i++) {
        // 그리기 시작
        canvas.beginPath();
        // 해당 위치에 넣을 색상 지정
        canvas.fillStyle = colors[i % 2];
        // 중앙점으로 이동
        canvas.moveTo(cw, ch);
        // 호 그리기
        // arc(x,y,r, startAngle, endAngle, anticlockwise)
        // x좌표, y좌표, 반지름, 호의 시작점, 끝점을 각도(라디안 값)로 표시, 그릴 때 반시계 방향으로 그릴지 여부
        canvas.arc(cw, ch, cw, arc * i, arc * (i + 1), false);
        canvas.fill();
        canvas.closePath();
      }
      canvas.fillStyle = "#464747";
      canvas.textAlign = "center";
      canvas.font = "normal 500 17px SUIT";

      // 아이템 표기
      for (let i = 0; i < 8; i++) {
        const angle = arc * i + arc / 2;

        canvas.save();

        canvas.translate(
          cw + Math.cos(angle) * (cw - 75),
          ch + Math.sin(angle) * (ch - 75)
        );
        canvas.rotate(angle + Math.PI / 2);
        // const titleListItem =
        //   titleList.current[i]?.split(" ").length >= 2
        //     ? `${titleList.current[i]?.split(" ")[0]} ${
        //         titleList.current[i]?.split(" ")[1]
        //       }`
        //     : titleList.current[i];
        // canvas.fillText(titleListItem, 0, i, 160);
        const first = 16;
        const second = 14;
        const third = 12;
        const fourth = 10;
        const final = 8;
        const lineHeight = 28;
        // ----------------------- 룰렛 텍스트 박스 -------------------------
        if (titleList.current[i]?.length >= first) {
          const firstLine = titleList.current[i]?.substr(0, first);
          canvas.fillText(firstLine, 0, 0, 200);
        } else {
          const firstLine = titleList.current[i];
          canvas.fillText(firstLine, 0, 0, 200);
        }
        // 2번째 라인
        if (titleList.current[i]?.length - second >= second) {
          const secondLine = titleList.current[i]?.substr(first, second);
          canvas.fillText(secondLine, 0, lineHeight * 1, 180);
        } else {
          const secondLine = titleList.current[i]?.substr(first);
          canvas.fillText(secondLine, 0, lineHeight * 1, 180);
        }
        // 3번째 라인
        if (titleList.current[i]?.length - (first + second) >= third) {
          const thirdLine = titleList.current[i]?.substr(first + second, third);
          canvas.fillText(thirdLine, 0, lineHeight * 2, 160);
        } else {
          const thirdLine = titleList.current[i]?.substr(first + second);
          canvas.fillText(thirdLine, 0, lineHeight * 2, 160);
        }
        // 4번째 라인
        if (titleList.current[i]?.length - (first + second + third) >= fourth) {
          const fourthLine = titleList.current[i]?.substr(
            first + second + third,
            fourth
          );
          canvas.fillText(fourthLine, 0, lineHeight * 3, 140);
        } else {
          const fourthlLine = titleList.current[i]?.substr(
            first + second + third
          );
          canvas.fillText(fourthlLine, 0, lineHeight * 3, 140);
        }
        // 5번째 라인
        if (
          titleList.current[i]?.length - (first + second + third + fourth) >=
          final
        ) {
          const finalLine = titleList.current[i]?.substr(
            first + second + third + fourth,
            final
          );
          canvas.fillText(finalLine, 0, lineHeight * 4, 120);
        } else {
          const finallLine = titleList.current[i]?.substr(
            first + second + third + fourth
          );
          canvas.fillText(finallLine, 0, lineHeight * 4, 120);
        }
        // ...표시
        if (
          titleList.current[i]?.length -
            (first + second + third + fourth + final) >
          0
        ) {
          canvas.fillText("...", 0, lineHeight * 5, 100);
        }
        // ----------------------- 룰렛 텍스트 박스 -------------------------
        canvas.restore();
      }
    };
    newMake();
    // }
  }, [isRoulette, titleList, title, roulette]);
  // isRoulette, titleList, title, roulette
}
