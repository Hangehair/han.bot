document.addEventListener('DOMContentLoaded', () => {
  liff.init({ liffId: "2007657502-N6Xb70bg" })
    .then(() => console.log("LIFF initialized"))
    .catch((err) => {
      console.error("LIFF 初始化失敗：", err);
      alert("LIFF 初始化失敗，請稍後再試！");
    });

  const toggleOtherInput = (selectEl, inputEl) => {
    selectEl.addEventListener('change', () => {
      inputEl.style.display = selectEl.value === "其他" ? 'block' : 'none';
    });
    inputEl.style.display = selectEl.value === "其他" ? 'block' : 'none';
  };

  toggleOtherInput(document.querySelector('[name="q1"]'), document.querySelector('[name="q1_other"]'));
  toggleOtherInput(document.querySelector('[name="q2"]'), document.querySelector('[name="q2_other"]'));
  toggleOtherInput(document.querySelector('[name="q4"]'), document.querySelector('[name="q4_other"]'));

  const form = document.getElementById('quiz-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const getFormValue = (name) => {
      const selectedValue = form.elements[name].value;
      const otherValue = form.elements[`${name}_other`] ? form.elements[`${name}_other`].value : '';
      return selectedValue === "其他" ? otherValue : selectedValue;
    };

    const formData = {
      髮型困擾: getFormValue("q1"),
      接髮效果: getFormValue("q2"),
      接髮經驗: getFormValue("q3"),
      想接髮原因: getFormValue("q4"),
      染燙習慣: getFormValue("q5"),
      想接髮時間: getFormValue("q6"),
      預算範圍: getFormValue("q7"),
      髮質狀況: getFormValue("q8")
    };

    const determineRecommendation = (budget) => {
      switch (budget) {
        case "12000": return { name: "天羽款式", type: "鑽石髮質" };
        case "15000": return { name: "天羽款式", type: "處女髮質" };
        case "18000": return { name: "天羽款式", type: "仙女髮質" };
        default: return { name: "韓哥評估後推薦", type: "依實際需求調整" };
      }
    };

    const rec = determineRecommendation(formData["預算範圍"]);

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
              text: "✨ 接髮評估結果 ✨",
              weight: "bold",
              size: "lg",
              color: "#c84d64"
            },
            {
              type: "text",
              text: `推薦款式：${rec.name}`,
              size: "md"
            },
            {
              type: "text",
              text: `髮質推薦：${rec.type}`,
              size: "md"
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "text",
              text: "你的填寫資料：",
              weight: "bold",
              margin: "md"
            },
            ...Object.entries(formData).map(([key, value]) => ({
              type: "text",
              text: `${key}：${value}`,
              wrap: true,
              size: "sm"
            }))
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#c84d64",
              action: {
                type: "message",
                label: "查看接髮價位",
                text: "接髮價位"
              }
            }
          ]
        }
      }
    };

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
