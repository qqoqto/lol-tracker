# LOL Tracker - 英雄聯盟戰績查詢系統

一個功能完整的英雄聯盟召喚師戰績查詢網站，提供詳細的對戰記錄、統計數據和 LP 變化追蹤。

## 功能特色

✅ **召喚師資料查詢**
- 召喚師基本資訊（頭像、等級、名稱）
- 單/雙排位和彈性排位資訊
- 段位、LP、勝率統計

✅ **對戰記錄分析**
- 最近 20 場對戰詳細記錄
- 英雄、符文、召喚師技能顯示
- KDA、裝備、傷害統計
- 隊友牌位顯示
- 可點擊其他玩家名稱查詢

✅ **統計圖表**
- 最近 20 場勝率圓形圖
- LP 變化趨勢折線圖
- 常用英雄統計（前 5 名）
- 最近遊玩英雄列表

✅ **支援遊戲模式**
- 單/雙排位、彈性排位
- ARAM、一般遊戲
- URF、鬥魂競技場等特殊模式
- 共支援 50+ 種遊戲模式

## 技術棧

- **框架**: Next.js 16.0.0 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS 4
- **圖表**: Recharts 3.3.0
- **API**: Riot Games API

## 本地開發設定

### 1. 取得 Riot API Key

前往 [Riot Developer Portal](https://developer.riotgames.com/) 註冊並取得 API Key。

> ⚠️ 注意：開發金鑰每 24 小時過期，正式環境需申請正式金鑰。

### 2. 安裝依賴

```bash
npm install
```

### 3. 設定環境變數

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入你的 API Key：

```
RIOT_API_KEY=your_riot_api_key_here
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 方法一：透過 GitHub 部署（推薦）

1. **建立 GitHub 儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/lol-tracker.git
   git push -u origin main
   ```

2. **連接 Vercel**
   - 前往 [vercel.com](https://vercel.com)
   - 點擊「New Project」
   - 選擇你的 GitHub 儲存庫
   - 設定環境變數：`RIOT_API_KEY`
   - 點擊「Deploy」

3. **完成！**
   - Vercel 會自動建置和部署
   - 獲得一個 `.vercel.app` 網址
   - 每次推送到 main 分支都會自動重新部署

### 方法二：Vercel CLI 部署

1. **安裝 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登入 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **設定環境變數**
   ```bash
   vercel env add RIOT_API_KEY
   ```

5. **正式部署**
   ```bash
   vercel --prod
   ```

## 環境變數說明

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `RIOT_API_KEY` | Riot Games API 金鑰 | ✅ |

## 專案結構

```
lol-tracker/
├── app/
│   ├── api/              # API 路由
│   │   ├── lp-history/   # LP 歷史追蹤
│   │   ├── match/        # 對戰詳細資料
│   │   ├── ranks/        # 批量牌位查詢
│   │   ├── stats/        # 統計分析
│   │   └── summoner/     # 召喚師查詢
│   ├── components/       # React 元件
│   │   ├── LPChart.tsx   # LP 折線圖
│   │   ├── MatchCard.tsx # 對戰記錄卡片
│   │   └── WinRateCircle.tsx # 勝率圓圈圖
│   ├── summoner/         # 召喚師頁面
│   └── page.tsx          # 首頁
├── lib/
│   └── riot-api.ts       # Riot API 封裝
└── types/
    └── riot.ts           # TypeScript 型別定義
```

## API 限制

### 開發金鑰限制
- 每 2 分鐘 20 次請求
- 每 24 小時過期
- 適用於開發和測試

### 正式金鑰申請
前往 [Riot Developer Portal](https://developer.riotgames.com/) 申請正式金鑰以獲得更高的請求限制。

## 支援的地區

- 🇹🇼 台灣 (tw2)
- 🇰🇷 韓國 (kr)
- 🇯🇵 日本 (jp1)
- 🇺🇸 北美 (na1)
- 🇪🇺 西歐 (euw1)
- 🇪🇺 北歐與東歐 (eun1)

## 常見問題

### Q: 為什麼搜尋不到召喚師？
A: 請確認：
1. 輸入格式正確（遊戲名稱#標籤，如：陳大牌#tw2）
2. 標籤使用小寫
3. API Key 是否有效（開發金鑰每 24 小時過期）

### Q: 為什麼沒有對戰記錄？
A: Riot API 只保留最近 1-3 個月的對戰記錄，長時間未遊玩的帳號可能無對戰記錄。

### Q: LP 變化為什麼是估算值？
A: Riot API 不提供 LP 歷史數據，我們透過勝敗記錄估算（勝利 +20 LP，失敗 -15 LP），實際變化會受 MMR 影響。

### Q: 可以查詢歷史賽季嗎？
A: Riot API 不提供歷史賽季數據，目前僅顯示當前賽季。

## License

MIT

## 相關連結

- [Riot Developer Portal](https://developer.riotgames.com/)
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [Next.js 文檔](https://nextjs.org/docs)
- [Vercel 部署文檔](https://vercel.com/docs)
