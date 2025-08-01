document.addEventListener('DOMContentLoaded', () => {
  liff.init({ liffId: "2007657502-N6Xb70bg" })
    .then(() => console.log("LIFF initialized"))
    .catch(err => {
      console.error("LIFF 初始化失敗：", err);
      alert("LIFF 初始化失敗，請稍後再試！");
    });

  const form = document.getElementById('quiz-form');

  const toggleOtherInputs = (name) => {
    const select = form.elements[name];
    const input = form.elements[`${name}_other`];
    const updateDisplay = () => {
      input.style.display = select.value === '其他' ? 'block' : 'none';
    };
    select.addEventListener('change', updateDisplay);
    updateDisplay();
  };

  ['q1', 'q2', 'q4'].forEach(toggleOtherInputs);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const getFormValue = (name) => {
      const val = form.elements[name].value;
      const other = form.elements[`${name}_other`] ? form.elements[`${name}_other`].value : '';
      return val === '其他' ? other : val;
    };

    const formData = {
      髮型困擾: getFormValue('q1'),
      接髮效果: getFormValue('q2'),
      接髮經驗: getFormValue('q3'),
      想接髮原因: getFormValue('q4'),
      染燙習慣: getFormValue('q5'),
      想接髮時間: getFormValue('q6'),
      預算範圍: getFormValue('q7'),
      髮質狀況: getFormValue('q8')
    };

    const determineRecommendation = (budget) => {
      switch (budget) {
        case "12000":
          return { name: "天羽款式｜鑽石髮質", note: "適合不染燙者，輕柔順滑，髮質超自然" };
        case "15000":
          return { name: "天羽款式｜處女髮質", note: "可低頻染燙，保留原生光澤，手感佳" };
        case "18000":
          return { name: "天羽款式｜仙女髮質", note: "高端精品，絲滑飄逸，耐久使用" };
        default:
          return { name: "韓哥評估後推薦", note: "我們將由韓哥提供專業評估回覆" };
      }
    };

    const recommendation = determineRecommendation(formData["預算範圍"]);

    const flexMessage = {
  type: "flex",
  altText: "這是測試 Flex",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Flex 測試成功！",
          weight: "bold",
          size: "lg",
          color: "#1DB446"
        }
      ]
    }
  }
};

liff.sendMessages([flexMessage])
  .then(() => {
    alert("✅ Flex 傳送成功！");
    liff.closeWindow();
  })
  .catch((err) => {
    console.error("❌ 傳送失敗：", err);
    alert("❌ 傳送失敗：" + JSON.stringify(err));
  });