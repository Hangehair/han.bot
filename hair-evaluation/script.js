document.addEventListener('DOMContentLoaded', () => {
  // 初始化 LIFF
  liff.init({ liffId: "2007657502-N6Xb70bg" })
    .then(() => {
      console.log("LIFF initialized");
    })
    .catch((err) => {
      console.error("LIFF 初始化失敗：", err);
      alert("LIFF 初始化失敗，請稍後再試！");
    });

  // 表單處理邏輯
  const form = document.getElementById('quiz-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // 阻止表單的預設提交行為

    // 取得表單值的工具函式
    const getFormValue = (name) => {
      const selectedValue = form.elements[name].value;
      const otherValue = form.elements[`${name}_other`] ? form.elements[`${name}_other`].value : '';
      return selectedValue === "其他" ? otherValue : selectedValue;
    };

    // 收集表單資料
    const formData = {
      髮型困擾: getFormValue("q1"),
      接髮效果: getFormValue("q2"),
      接髮經驗: getFormValue("q3"),
      想接髮原因: getFormValue("q4"),
      染燙習慣: getFormValue("q5"),
      想接髮時間: getFormValue("q6")
    };

    // 推薦邏輯
    const determineRecommendation = (data) => {
      if (data["染燙習慣"] === "不會染燙" && data["接髮效果"] === "加厚") {
        return "羽毛鑽石髮";
      } else if (data["染燙習慣"] === "會，定期染燙") {
        return "羽毛處女髮";
      } else if (data["接髮經驗"] === "沒有") {
        return "羽毛仙女髮";
      }
      return "羽毛處女髮"; // 預設推薦
    };

    const recommendation = determineRecommendation(formData);

    // 建立 Flex Message
    const flexMessage = {
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
            ...Object.entries(formData).map(([key, value]) => ({
              type: "text",
              text: `${key}：${value}`,
              wrap: true
            }))
          ]
        }
      }
    };

    // 傳送 Flex Message
    liff.sendMessages([flexMessage])
      .then(() => {
        alert("已成功傳送結果至聊天室！");
        liff.closeWindow();
      })
      .catch((err) => {
        console.error("傳送訊息失敗：", err);
        alert("傳送訊息失敗，請稍後再試！");
      });
  });
});