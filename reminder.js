// reminder.js - Hange 韓哥接髮自動提醒系統
// 功能：兩個月回訪提醒 + 生日問候

const admin = require('firebase-admin');
const axios = require('axios');

// 初始化 Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

// LINE Bot 設定
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';

// 發送 LINE 訊息
async function sendLineMessage(userId, message) {
  try {
    await axios.post(
      LINE_MESSAGING_API,
      {
        to: userId,
        messages: [message]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    console.log(`✅ 訊息已發送給用戶：${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ 發送訊息失敗：${userId}`, error.message);
    return false;
  }
}

// 🎯 功能 1：兩個月回訪提醒
async function checkBookingReminders() {
  console.log('🔍 檢查需要回訪提醒的預約...');
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('reminderSent', '==', false)
      .where('reminderDate', '==', today)
      .get();

    console.log(`📋 找到 ${bookingsSnapshot.size} 筆需要提醒的預約`);

    for (const doc of bookingsSnapshot.docs) {
      const booking = doc.data();
      
      // 獲取用戶資料
      const userDoc = await db.collection('users').doc(booking.userId).get();
      if (!userDoc.exists) continue;
      
      const user = userDoc.data();
      
      // 建立 Flex Message
      const flexMessage = {
        type: 'flex',
        altText: '💇 該回來找韓哥啦！',
        contents: {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '💇‍♀️ 回訪提醒',
                weight: 'bold',
                size: 'xl',
                color: '#ffffff'
              }
            ],
            backgroundColor: '#667eea',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: `嗨 ${user.name}！`,
                weight: 'bold',
                size: 'lg',
                margin: 'md'
              },
              {
                type: 'text',
                text: `上次您預約的是：${booking.services.join('、')}`,
                size: 'sm',
                color: '#718096',
                margin: 'md',
                wrap: true
              },
              {
                type: 'text',
                text: '兩個月過去了，您的頭髮還好嗎？😊',
                size: 'sm',
                color: '#2d3748',
                margin: 'md',
                wrap: true
              },
              {
                type: 'text',
                text: '💡 接髮調整建議：每 2 個月回來調整一次，能讓接髮更自然、更持久喔！',
                size: 'xs',
                color: '#718096',
                margin: 'md',
                wrap: true
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'text',
                text: '✨ 回訪專屬優惠',
                weight: 'bold',
                size: 'md',
                margin: 'lg',
                color: '#667eea'
              },
              {
                type: 'text',
                text: '• 接髮調整課程買4送1\n• 頭皮養護療程買3送1',
                size: 'sm',
                color: '#2d3748',
                margin: 'sm',
                wrap: true
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '立即預約',
                  uri: 'https://hangehair.github.io/han.bot/'
                },
                style: 'primary',
                color: '#667eea'
              }
            ]
          }
        }
      };

      // 發送提醒
      const sent = await sendLineMessage(booking.userId, flexMessage);
      
      if (sent) {
        // 標記為已發送
        await doc.ref.update({
          reminderSent: true,
          reminderSentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ 已發送回訪提醒給 ${user.name}`);
      }
    }

    console.log('✅ 回訪提醒檢查完成');
    return { success: true, count: bookingsSnapshot.size };
  } catch (error) {
    console.error('❌ 回訪提醒檢查失敗:', error);
    return { success: false, error: error.message };
  }
}

// 🎂 功能 2：生日問候
async function checkBirthdays() {
  console.log('🎂 檢查今天的壽星...');
  
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${month}-${day}`;
  
  try {
    const usersSnapshot = await db.collection('users').get();
    let birthdayCount = 0;

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      
      if (!user.birthday) continue;
      
      // 檢查是否今天生日
      const userBirthday = user.birthday.substring(5); // 取得 MM-DD
      
      if (userBirthday === todayStr) {
        birthdayCount++;
        
        // 建立生日 Flex Message
        const flexMessage = {
          type: 'flex',
          altText: '🎂 生日快樂！',
          contents: {
            type: 'bubble',
            hero: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '🎉🎂🎁',
                  size: 'xxl',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: '生日快樂',
                  weight: 'bold',
                  size: 'xl',
                  color: '#ffffff',
                  align: 'center',
                  margin: 'md'
                }
              ],
              backgroundColor: '#ff6b9d',
              paddingAll: '30px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: `親愛的 ${user.name}`,
                  weight: 'bold',
                  size: 'lg',
                  margin: 'md'
                },
                {
                  type: 'text',
                  text: '韓哥和團隊祝您生日快樂！🎉',
                  size: 'md',
                  color: '#2d3748',
                  margin: 'md',
                  wrap: true
                },
                {
                  type: 'separator',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '🎁 生日專屬優惠',
                  weight: 'bold',
                  size: 'md',
                  margin: 'lg',
                  color: '#ff6b9d'
                },
                {
                  type: 'text',
                  text: '當月來店消費享 9 折優惠！\n（可與其他優惠合併使用）',
                  size: 'sm',
                  color: '#2d3748',
                  margin: 'md',
                  wrap: true
                },
                {
                  type: 'text',
                  text: '💝 讓我們為您打造最美的生日造型吧！',
                  size: 'xs',
                  color: '#718096',
                  margin: 'md',
                  wrap: true
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'uri',
                    label: '立即預約',
                    uri: 'https://hangehair.github.io/han.bot/'
                  },
                  style: 'primary',
                  color: '#ff6b9d'
                }
              ]
            }
          }
        };

        await sendLineMessage(doc.id, flexMessage);
        console.log(`🎂 已發送生日祝福給 ${user.name}`);
      }
    }

    console.log(`✅ 生日問候檢查完成，找到 ${birthdayCount} 位壽星`);
    return { success: true, count: birthdayCount };
  } catch (error) {
    console.error('❌ 生日問候檢查失敗:', error);
    return { success: false, error: error.message };
  }
}

// 🎯 主函數（每日執行）
async function runDailyReminders() {
  console.log('=== 開始執行每日自動提醒 ===');
  console.log(`執行時間：${new Date().toISOString()}`);
  
  const results = {
    bookingReminders: await checkBookingReminders(),
    birthdays: await checkBirthdays()
  };
  
  console.log('=== 每日自動提醒執行完成 ===');
  console.log('結果：', JSON.stringify(results, null, 2));
  
  return results;
}

// 本地測試用
if (require.main === module) {
  runDailyReminders()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { runDailyReminders };
