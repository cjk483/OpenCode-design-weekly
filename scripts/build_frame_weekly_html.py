from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "FRAME"
OUT_DIR.mkdir(parents=True, exist_ok=True)

HTML_PATH = OUT_DIR / "FRAME_Weekly_Design_News_2026-05-12.html"

ARTICLES = [
    {
        "date": "2026-05-07",
        "type": "Retail",
        "title": "4 bookstores designed for spending time, not saving it.",
        "zh": "四個書店案例把閱讀從交易行為轉成停留體驗：氛圍、動線與公共性成為新核心。",
        "take": "實體書店的價值不再只是賣書，而是讓人願意慢下來。",
        "url": "https://frameweb.com/article/retail/4-bookstores-designed-for-spending-time-not-saving-it",
        "image": "https://d1tm14lrsghf7q.cloudfront.net/public/media/214704/conversions/Screenshot-2026-05-06-at-14.57.14-thumb.jpg",
    },
    {
        "date": "2026-05-07",
        "type": "Retail",
        "title": "At its NYC flagship, Extreme Cashmere uses ‘home’ as a compass for both design and philosophy",
        "zh": "Extreme Cashmere 紐約旗艦店把地下室轉化成像朋友家一樣的場域，反轉零售空間的標準語言。",
        "take": "家的尺度與舒適感，正在成為高端零售留客的策略工具。",
        "url": "https://frameweb.com/article/retail/at-its-nyc-flagship-extreme-cashmere-uses-home-as-a-compass-for-both-design-and-philosophy",
        "image": "https://d1tm14lrsghf7q.cloudfront.net/public/media/209327/conversions/Hidde-Dijkstra---Extreme-Cashmere---FRAME---1-thumb.jpg",
    },
    {
        "date": "2026-05-06",
        "type": "Hospitality",
        "title": "Designed to be felt, not photographed, Green Room leans into acoustic engineering and moody lighting",
        "zh": "Green Room 以聲學與低照度氛圍為主軸，讓夜生活空間回到身體感受，而不是社群影像。",
        "take": "體驗型空間的競爭點，從可拍攝性轉向可感知性。",
        "url": "https://frameweb.com/article/hospitality/designed-to-be-felt-not-photographed-green-room-leans-into-acoustic-engineering-and-moody-lighting",
        "image": "https://d1tm14lrsghf7q.cloudfront.net/public/media/209198/conversions/Green-Room---Jack-Simmonds---FRAME---7-thumb.jpg",
    },
    {
        "date": "2026-05-06",
        "type": "Retail",
        "title": "This Tokyo flagship renovation builds spatial cohesion by using a limited palette of techniques",
        "zh": "Maison Mihara Yasuhiro 東京旗艦店以有限技法貫穿五層樓，讓多主題空間仍保持整體性。",
        "take": "當品牌空間複雜化，克制的材料與細部語言反而更關鍵。",
        "url": "https://frameweb.com/article/retail/this-tokyo-flagship-renovation-builds-spatial-cohesion-by-using-a-limited-palette-of-techniques",
        "image": "https://d1tm14lrsghf7q.cloudfront.net/public/media/214504/conversions/00Insideout_MMY_Jingumae_FRAME-thumb.jpg",
    },
    {
        "date": "2026-05-05",
        "type": "Technology",
        "title": "What digital twins mean for the relationship between prediction and preservation",
        "zh": "數位孿生把文化資產保存從事後修復推向預測管理，讓歷史建築維護有新的操作模型。",
        "take": "保存不只是修補過去，也開始依靠資料預判未來風險。",
        "url": "https://frameweb.com/article/technology/what-digital-twins-mean-for-the-relationship-between-prediction-and-preservation",
        "image": "https://d1tm14lrsghf7q.cloudfront.net/public/media/208945/conversions/Screenshot-2026-04-16-at-22.30.22-thumb.jpg",
    },
    {
        "date": "2026-05-05",
        "type": "Awards",
        "title": "May’s FRAME Awards jury is here. Meet the experts evaluating the month’s submissions",
        "zh": "FRAME Awards 五月評審名單公布，顯示空間設計評價正在跨越媒體、策展、品牌與專業實務。",
        "take": "獎項評審結構本身，也反映設計產業判準如何被重組。",
        "url": "https://frameweb.com/article/frame-awards/mays-frame-awards-jury-is-here-meet-the-experts-evaluating-the-months-submissions",
        "image": "https://d1tm14lrsghf7q.cloudfront.net/public/media/214607/conversions/FA26_JURY_MAY_WebArticle_2-thumb.jpg",
    },
]


def article_card(article: dict[str, str], index: int) -> str:
    return f"""
      <article class="idx-row" onclick="goto({index + 4})">
        <span class="num">{index:02d}</span>
        <span class="idx-title">{escape(article["title"])}</span>
        <span class="idx-type">{escape(article["type"])}</span>
        <span class="idx-date">{article["date"][5:]}</span>
      </article>"""


def detail_slide(article: dict[str, str], slide_no: int, flip: bool) -> str:
    image = f"""
      <div class="project-image">
        <img src="{escape(article["image"])}" alt="{escape(article["title"])}">
        <a class="source-link" href="{escape(article["url"])}" target="_blank">FRAME SOURCE</a>
      </div>"""
    text = f"""
      <div class="project-copy">
        <div class="eyebrow">{escape(article["type"])} · {article["date"]}</div>
        <h2>{escape(article["title"])}</h2>
        <p class="zh">{escape(article["zh"])}</p>
        <p class="take">{escape(article["take"])}</p>
      </div>"""
    body = text + image if flip else image + text
    return f"""
    <section class="slide project" data-section="CASE NOTES">
      <div class="project-num">{slide_no:02d}</div>
      <div class="split {'flip' if flip else ''}">
        {body}
      </div>
    </section>"""


def main() -> None:
    index_rows = "\n".join(article_card(article, i) for i, article in enumerate(ARTICLES, start=1))
    detail_slides = "\n".join(detail_slide(article, i + 3, i % 2 == 0) for i, article in enumerate(ARTICLES, start=1))
    cover = ARTICLES[0]["image"]
    closing = ARTICLES[2]["image"]
    html = f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FRAME 設計週報 2026-05-12</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root {{
  --cream:#f3eee6; --paper:#fbf8f2; --ink:#171412; --muted:#71685d;
  --line:#d9ccba; --warm:#9b6f44; --dark:#11100f; --gold:#d8b37a;
  --ef:'Jost','Century Gothic',sans-serif; --zf:'Microsoft JhengHei','Noto Sans TC','PingFang TC',sans-serif;
}}
*{{box-sizing:border-box;margin:0;padding:0}}
html{{scroll-snap-type:y mandatory;overflow-y:scroll;background:var(--dark)}}
body{{font-family:var(--zf);color:var(--ink);background:var(--cream)}}
#prog{{position:fixed;top:0;left:0;height:2px;background:var(--gold);z-index:20;width:0;transition:.25s}}
#pg{{position:fixed;right:3vw;bottom:3vh;z-index:20;font-family:var(--ef);letter-spacing:.22em;font-size:11px;color:rgba(255,255,255,.7);text-shadow:0 1px 8px #000}}
.slide{{width:100vw;height:100vh;scroll-snap-align:start;scroll-snap-stop:always;position:relative;overflow:hidden}}
.cover{{background:#0d0b0a;color:white}}
.cover-bg,.closing-bg{{position:absolute;inset:0;background:center/cover no-repeat;filter:saturate(.9);opacity:.42}}
.cover-bg{{background-image:linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,.12)),url('{cover}')}}
.cover-inner{{position:relative;z-index:1;height:100%;padding:6vh 6vw;display:flex;flex-direction:column;justify-content:space-between}}
.brand{{font-family:var(--ef);letter-spacing:.5em;color:var(--gold);font-size:13px}}
.date{{font-family:var(--ef);letter-spacing:.18em;color:rgba(255,255,255,.48);font-size:13px}}
.topline{{display:flex;justify-content:space-between}}
.cover h1{{font-weight:300;font-size:clamp(44px,7vw,112px);line-height:1.05;letter-spacing:.04em;max-width:950px}}
.cover h1 em{{display:block;font-style:normal;color:var(--gold);font-size:.42em;letter-spacing:.18em;margin-bottom:1.8vh;font-family:var(--ef)}}
.cover p{{max-width:720px;color:rgba(255,255,255,.68);line-height:2;font-size:18px;font-weight:300}}
.stats{{background:var(--paper);display:grid;grid-template-rows:auto 1fr auto}}
.header{{padding:5vh 6vw 3vh;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:end}}
.kicker{{font-family:var(--ef);letter-spacing:.38em;color:var(--warm);font-size:12px}}
.header h2{{font-weight:300;font-size:clamp(24px,3vw,46px)}}
.stat-grid{{display:grid;grid-template-columns:repeat(4,1fr)}}
.stat{{display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid var(--line);text-align:center;padding:3vw}}
.stat:last-child{{border-right:0}}
.stat b{{font-family:var(--ef);font-weight:300;font-size:clamp(58px,8vw,132px)}}
.stat span{{font-size:15px;letter-spacing:.12em;color:var(--muted)}}
.tags{{border-top:1px solid var(--line);padding:3vh 6vw;display:flex;gap:12px;flex-wrap:wrap}}
.tag{{font-family:var(--ef);font-size:11px;letter-spacing:.22em;border:1px solid var(--line);padding:8px 14px;color:var(--warm)}}
.index{{background:var(--cream);display:flex;flex-direction:column}}
.index-body{{flex:1;padding:2vh 6vw 5vh;display:flex;flex-direction:column;justify-content:center}}
.idx-row{{display:grid;grid-template-columns:6vw 1fr 16vw 7vw;gap:2vw;align-items:center;border-bottom:1px solid var(--line);padding:2.05vh 0;cursor:pointer;transition:.2s}}
.idx-row:hover{{color:var(--warm);transform:translateX(8px)}}
.num,.idx-type,.idx-date{{font-family:var(--ef);letter-spacing:.18em;color:var(--muted);font-size:12px}}
.idx-title{{font-size:clamp(16px,1.65vw,26px);font-weight:300;line-height:1.35}}
.project{{background:#0b0a09;color:white}}
.project-num{{position:absolute;top:4vh;right:5vw;font-family:var(--ef);letter-spacing:.3em;color:rgba(255,255,255,.38);z-index:3}}
.split{{height:100%;display:grid;grid-template-columns:1.1fr .9fr}}
.split.flip{{grid-template-columns:.9fr 1.1fr}}
.project-image{{position:relative;min-width:0;background:#000}}
.project-image img{{width:100%;height:100%;object-fit:cover;display:block;opacity:.9}}
.project-image:after{{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.18),transparent 45%)}}
.source-link{{position:absolute;left:4vw;bottom:4vh;z-index:2;color:var(--gold);font-family:var(--ef);letter-spacing:.28em;font-size:11px;text-decoration:none;border-bottom:1px solid rgba(216,179,122,.45);padding-bottom:5px}}
.project-copy{{display:flex;flex-direction:column;justify-content:center;padding:8vh 6vw;background:linear-gradient(135deg,#171412,#0b0a09)}}
.eyebrow{{font-family:var(--ef);letter-spacing:.36em;color:var(--gold);font-size:12px;margin-bottom:2.6vh}}
.project h2{{font-size:clamp(28px,4vw,62px);font-weight:300;line-height:1.12;margin-bottom:3vh}}
.zh{{font-size:clamp(16px,1.35vw,22px);font-weight:300;line-height:1.95;color:rgba(255,255,255,.78);margin-bottom:2.5vh}}
.take{{border-left:2px solid var(--gold);padding-left:22px;color:var(--gold);font-size:clamp(15px,1.1vw,18px);line-height:1.8}}
.synthesis{{background:var(--paper);display:grid;place-items:center;padding:6vh 8vw}}
.syn-grid{{display:grid;grid-template-columns:1fr 1fr;gap:5vw;max-width:1280px;align-items:center}}
.big-title{{font-size:clamp(38px,5.8vw,92px);font-weight:300;line-height:1.06}}
.insights{{display:grid;gap:18px}}
.insight{{border-top:1px solid var(--line);padding-top:20px}}
.insight b{{font-family:var(--ef);color:var(--warm);letter-spacing:.25em;font-size:12px}}
.insight p{{font-size:20px;line-height:1.75;margin-top:8px;color:var(--muted)}}
.closing{{background:#080706;color:white;display:grid;place-items:center;text-align:center}}
.closing-bg{{background-image:linear-gradient(rgba(0,0,0,.68),rgba(0,0,0,.72)),url('{closing}')}}
.closing-inner{{position:relative;z-index:1;max-width:1000px;padding:6vw}}
.closing h2{{font-size:clamp(42px,7vw,118px);font-weight:300;line-height:1.05;margin-bottom:3vh}}
.closing p{{font-size:20px;line-height:2;color:rgba(255,255,255,.72)}}
@media print {{
  @page{{size:16in 9in;margin:0}}
  html,body{{background:white;overflow:visible}}
  *{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  .slide{{width:16in;height:9in;page-break-after:always;break-after:page;scroll-snap-align:none}}
  .slide:last-child{{page-break-after:auto;break-after:auto}}
  #prog,#pg{{display:none}}
}}
@media(max-width:850px){{
  .split,.split.flip,.syn-grid{{grid-template-columns:1fr}}
  .project-image{{min-height:42vh}}
  .stat-grid{{grid-template-columns:repeat(2,1fr)}}
  .idx-row{{grid-template-columns:40px 1fr}}
  .idx-type,.idx-date{{display:none}}
}}
</style>
</head>
<body>
<div id="prog"></div><div id="pg"></div>
<main>
  <section class="slide cover" data-section="FRAME WEEKLY">
    <div class="cover-bg"></div>
    <div class="cover-inner">
      <div class="topline"><div class="brand">FRAME</div><div class="date">2026.05.05–05.12</div></div>
      <div><h1><em>WEEKLY DESIGN NEWS</em>空間設計週報</h1><p>以 FRAME 最近一週發布內容為主，整理零售、 hospitality、文化資產科技與設計評審趨勢，轉譯成可閱讀、可展示的 HTML / PDF 簡報。</p></div>
      <div class="date">SOURCE · frameweb.com</div>
    </div>
  </section>
  <section class="slide stats" data-section="WEEK SNAPSHOT">
    <div class="header"><div><div class="kicker">ONE WEEK SIGNALS</div><h2>這週 FRAME 關注什麼？</h2></div><div class="date">May 2026</div></div>
    <div class="stat-grid">
      <div class="stat"><b>6</b><span>近週文章</span></div>
      <div class="stat"><b>3</b><span>零售空間</span></div>
      <div class="stat"><b>1</b><span>夜生活 / 聲學</span></div>
      <div class="stat"><b>1</b><span>保存科技</span></div>
    </div>
    <div class="tags"><span class="tag">RETAIL</span><span class="tag">HOSPITALITY</span><span class="tag">DIGITAL TWINS</span><span class="tag">AWARDS</span><span class="tag">SPATIAL EXPERIENCE</span></div>
  </section>
  <section class="slide index" data-section="INDEX">
    <div class="header"><div><div class="kicker">ARTICLE INDEX</div><h2>六則重點</h2></div><div class="date">click / scroll</div></div>
    <div class="index-body">{index_rows}
    </div>
  </section>
  {detail_slides}
  <section class="slide synthesis" data-section="SYNTHESIS">
    <div class="syn-grid">
      <h2 class="big-title">從「可拍」轉向「可停留、可感知、可維護」</h2>
      <div class="insights">
        <div class="insight"><b>01 RETAIL AS DWELLING</b><p>書店與服裝旗艦店都把零售改寫成慢速停留場景，空間不再只服務購買。</p></div>
        <div class="insight"><b>02 BODY-FIRST EXPERIENCE</b><p>Green Room 把聲音與光線放在影像之前，提示 hospitality 設計重新重視身體感。</p></div>
        <div class="insight"><b>03 DATA-BASED PRESERVATION</b><p>數位孿生讓保存工作從修復轉向預測，設計管理開始進入長期維護模型。</p></div>
      </div>
    </div>
  </section>
  <section class="slide closing" data-section="CLOSING">
    <div class="closing-bg"></div>
    <div class="closing-inner"><h2>FRAME 的本週訊號</h2><p>空間設計的重點正在從視覺風格，轉向時間、身體、資料與制度如何共同塑造場所。</p></div>
  </section>
</main>
<script>
const slides=[...document.querySelectorAll('.slide')];
const progress=document.getElementById('prog');
const pg=document.getElementById('pg');
function update(){{
  let idx=Math.round(window.scrollY/window.innerHeight);
  idx=Math.max(0,Math.min(slides.length-1,idx));
  progress.style.width=((idx+1)/slides.length*100)+'%';
  pg.textContent=String(idx+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0')+' · '+slides[idx].dataset.section;
}}
function goto(n){{ slides[Math.max(0,Math.min(slides.length-1,n-1))].scrollIntoView({{behavior:'smooth'}}); }}
window.addEventListener('scroll',update,{{passive:true}});
window.addEventListener('keydown',e=>{{ if(['ArrowRight','PageDown',' '].includes(e.key))goto(Math.round(window.scrollY/window.innerHeight)+2); if(['ArrowLeft','PageUp'].includes(e.key))goto(Math.round(window.scrollY/window.innerHeight)); if(e.key.toLowerCase()==='f')document.documentElement.requestFullscreen?.(); }});
document.addEventListener('click',e=>{{ if(e.target.closest('a,.idx-row'))return; const x=e.clientX/window.innerWidth; if(x>.7)goto(Math.round(window.scrollY/window.innerHeight)+2); if(x<.3)goto(Math.round(window.scrollY/window.innerHeight)); }});
update();
</script>
</body>
</html>"""
    HTML_PATH.write_text(html, encoding="utf-8")
    print(HTML_PATH)


if __name__ == "__main__":
    main()
