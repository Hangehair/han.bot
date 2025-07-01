document.addEventListener('DOMContentLoaded', () => {
  liff.init({ liffId: "2007657502-N6Xb70bg" }).then(() => {
    console.log("LIFF initialized");
  });

  const form = document.getElementById('quiz-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const getValue = (name) => {
      const val = form.elements[name].value;
      const otherVal = form.elements[`${name}_other`] ? form.elements[`${name}_other`].value : '';
      return val === "其他" ? otherVal : val;
    };

    const result = {
      髮型困擾: getValue("q1"),
      接髮效果: getValue("q2"),
      接髮經驗: getValue("q3"),
      想接髮原因: getValue("q4"),
      染燙習慣: getValue("q5"),
      想接髮時間: getValue("q6")
    };

    // 推薦邏輯範例（可擴充）
    let recommendation = "羽毛處女髮";
    if (result["染燙習慣"] === "不會染燙" && result["接髮效果"] === "加厚") {
      recommendation = "羽毛鑽石髮";
    } else if (result["染燙習慣"] === "會，定期染燙") {
      recommendation = "羽毛處女髮";
    } else if (result["接髮經驗"] === "沒有") {
      recommendation = "羽毛仙女髮";
    }

    const flexMsg = {
      type: "flex",
      altText: "你的接髮推薦方案已送出！",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "接髮評估結果",
              weight: "bold",
              size: "lg",
              color: "#c84d64"
            },
            {
              type: "text",
              text: `推薦髮質：${recommendation}`,
              wrap: true,
              color: "#111111"
            },
            {
              type: "text",
              text: "你的填寫內容：",
              weight: "bold",
              margin: "md"
            },
            ...Object.entries(result).map(([key, val]) => ({
              type: "text",
              text: `${key}：${val}`,
              wrap: true
            }))
          ]
        }
      }
    };

    liff.sendMessages([flexMsg]).then(() => {
      alert("已傳送結果至聊天室！");
      liff.closeWindow();
    }).catch((err) => {
      alert("錯誤：" + err.message);
    });
  });
});
