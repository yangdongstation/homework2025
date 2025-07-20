数据实时取自
• 人口：disease.sh（每日同步联合国人口司 + World Bank）
• 面积：restcountries.com
🌎 3 条可视化结论
1️⃣ 亚洲断层领先：新加坡以 8.3 万人/km² 居首，前 20 高密度国家中 18 个位于亚洲，形成“密度断层带”。
2️⃣ 非洲快速膨胀：撒哈拉以南平均仅 0.002 万人/km²，但年增速超 2 %，未来 30 年将重塑全球人口版图。
3️⃣ 寒旱空洞：俄罗斯、加拿大、澳大利亚因极端气候，密度低于 0.001 万人/km²，在地图上呈现大片深蓝“地球留白”。

project-root/
│
├── public/
│   ├── data/
│   │   ├── area.json
│   │   ├── merged.json
│   │   ├── merged_filtered.json
│   │   └── population.json
│   │
│   └── assets/
│       └── world-110m.json
│
├── src/
│   ├── main.html
│   ├── globe.html
│   ├── bubbleMap.html
│   ├── hexbin.html
│   ├── treemap.html
│   ├── scatterMatrix.html
│   ├── rosePie.html
│   ├── parallel.html
│   ├── river.html
│   ├── signature.html
│   └── style.html
│
└── README.md
