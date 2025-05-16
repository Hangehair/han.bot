// api/ics.js
const { createEvent } = require('ics');

module.exports = async (req, res) => {
  const {
    title = '預約韓哥',
    start = '2025-05-20T13:30',
    duration = 60,
    description = '',
    location = ''
  } = req.query;

  const startDate = new Date(start);
  const startArr = [
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    startDate.getDate(),
    startDate.getHours(),
    startDate.getMinutes()
  ];

  const endDate = new Date(startDate.getTime() + Number(duration) * 60000);
  const endArr = [
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    endDate.getDate(),
    endDate.getHours(),
    endDate.getMinutes()
  ];

  const alarmDate = new Date(startDate);
  alarmDate.setDate(alarmDate.getDate() - 1);
  alarmDate.setHours(11, 30, 0, 0);

  const alarms = [
    {
      action: 'display',
      description: '預約提醒：明天有預約韓哥',
      trigger: {
        type: 'date-time',
        value: [
          alarmDate.getFullYear(),
          alarmDate.getMonth() + 1,
          alarmDate.getDate(),
          alarmDate.getHours(),
          alarmDate.getMinutes()
        ]
      }
    }
  ];

  const event = {
    title,
    description,
    location,
    start: startArr,
    end: endArr,
    alarms,
    startInputType: 'local',
    startOutputType: 'local',
    productId: '//HangeHair//Booking'
  };

  return new Promise((resolve) => {
    createEvent(event, (error, value) => {
      if (error) {
        console.error('ICS 產生錯誤:', error); // 加入錯誤 log
        res.status(500).send('產生失敗，請稍後再試');
        return resolve();
      }
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename=booking.ics');
      res.send(value);
      resolve();
    });
  });
};