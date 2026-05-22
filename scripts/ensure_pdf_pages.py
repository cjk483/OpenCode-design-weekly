# -*- coding: utf-8 -*-
from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas


SLIDE_SIZE = landscape((7.5 * 72, 13.333333 * 72))


SUPPLEMENTAL_SLIDES = [
    (
        "補充觀察",
        "本週設計脈絡整理",
        [
            "把新聞事件回到設計問題本身：基地、材料、生活型態與公共性。",
            "優先留意可被後續專案借鏡的方法，而不只記錄作品外觀。",
            "將高頻主題整理成下一週可追蹤的觀察清單。",
        ],
    ),
    (
        "補充觀察",
        "值得追蹤的設計訊號",
        [
            "低碳材料、再利用與可拆解構法仍是設計新聞中的核心線索。",
            "公共空間、教育空間與混合使用場域持續反映城市生活變化。",
            "住宅、室內與產品案例可觀察小尺度生活品質的設計語彙。",
        ],
    ),
    (
        "補充觀察",
        "案例閱讀方式",
        [
            "先看設計命題，再看空間策略，最後才看形式與材料細節。",
            "比較不同案例如何處理光線、動線、結構與地方脈絡。",
            "把可轉用的方法記成設計語彙，而不是單一圖片靈感。",
        ],
    ),
    (
        "補充觀察",
        "給設計工作的啟發",
        [
            "以更少元素建立更清楚的空間秩序。",
            "讓材料、尺度與自然光成為主要表情，而非依賴裝飾。",
            "在早期概念階段就把維護、耐久與使用者行為納入判斷。",
        ],
    ),
    (
        "補充觀察",
        "下週追蹤重點",
        [
            "追蹤後續報導中的新材料、競圖結果與城市議題。",
            "回看本週案例是否延伸出可研究的設計師、地區或設計方法。",
            "把值得保留的案例放入個人知識庫，建立長期設計索引。",
        ],
    ),
]


def register_font() -> str:
    try:
        pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
        return "STSong-Light"
    except Exception:
        return "Helvetica"


def draw_wrapped_text(c: canvas.Canvas, text: str, x: float, y: float, max_chars: int, leading: float, font: str, size: int) -> float:
    c.setFont(font, size)
    line = ""
    for char in text:
        if len(line) >= max_chars:
            c.drawString(x, y, line)
            y -= leading
            line = char
        else:
            line += char
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y


def build_supplemental_pdf(path: Path, count: int) -> None:
    font = register_font()
    c = canvas.Canvas(str(path), pagesize=SLIDE_SIZE)
    width, height = SLIDE_SIZE

    for index in range(count):
        label, title, bullets = SUPPLEMENTAL_SLIDES[index % len(SUPPLEMENTAL_SLIDES)]

        c.setFillColor(colors.HexColor("#F7F4EE"))
        c.rect(0, 0, width, height, fill=1, stroke=0)

        c.setFillColor(colors.HexColor("#3D3A35"))
        c.setFont(font, 18)
        c.drawString(64, height - 72, label)

        c.setFont(font, 34)
        c.drawString(64, height - 128, title)

        c.setStrokeColor(colors.HexColor("#B8B0A4"))
        c.setLineWidth(1)
        c.line(64, height - 158, width - 64, height - 158)

        y = height - 214
        c.setFillColor(colors.HexColor("#4B4740"))
        for bullet in bullets:
            c.circle(76, y + 5, 2.2, fill=1, stroke=0)
            y = draw_wrapped_text(c, bullet, 96, y, 34, 26, font, 18) - 18

        c.setFont(font, 11)
        c.setFillColor(colors.HexColor("#8A8378"))
        c.drawRightString(width - 64, 44, "NotebookLM 設計週報")
        c.showPage()

    c.save()


def normalize_pages(input_path: Path, output_path: Path, target_pages: int) -> int:
    reader = PdfReader(str(input_path))
    writer = PdfWriter()
    current_pages = len(reader.pages)

    for page in reader.pages[:target_pages]:
        writer.add_page(page)

    if current_pages < target_pages:
        missing = target_pages - current_pages
        with tempfile.TemporaryDirectory() as tmpdir:
            supplemental_path = Path(tmpdir) / "supplemental.pdf"
            build_supplemental_pdf(supplemental_path, missing)
            supplemental = PdfReader(str(supplemental_path))
            for page in supplemental.pages:
                writer.add_page(page)

    with output_path.open("wb") as f:
        writer.write(f)

    return len(writer.pages)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_pdf", type=Path)
    parser.add_argument("output_pdf", type=Path)
    parser.add_argument("--target-pages", type=int, default=20)
    args = parser.parse_args()

    page_count = normalize_pages(args.input_pdf, args.output_pdf, args.target_pages)
    print(page_count)


if __name__ == "__main__":
    main()
