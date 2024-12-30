const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

// 載入環境變數
dotenv.config();

// 建立伺服器
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 載入 Google API 憑據
const CREDENTIALS_PATH = './credentials.json';
const TOKEN_PATH = './token.json';

// 初始化 OAuth2
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const getOAuth2Client = () => {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

// 產生授權 URL
app.get('/auth-url', (req, res) => {
  const oAuth2Client = getOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.send({ authUrl });
});

// 取得授權 Token
app.get('/auth-callback', async (req, res) => {
  const oAuth2Client = getOAuth2Client();
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send('授權成功！請回到伺服器繼續操作。');
  } catch (error) {
    console.error('授權失敗：', error);
    res.status(500).send('授權失敗');
  }
});

// 建立日曆事件
app.post('/api/createEvent', async (req, res) => {
  const oAuth2Client = getOAuth2Client();
  if (!fs.existsSync(TOKEN_PATH)) {
    return res.status(400).send('尚未完成授權！');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const event = req.body; // 從前端接收事件資料

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    res.status(200).send(response.data);
  } catch (error) {
    console.error('建立事件失敗：', error);
    res.status(500).send('建立事件失敗');
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動，請訪問 http://localhost:${PORT}`);
});
