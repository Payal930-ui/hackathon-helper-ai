import type { PPTSlide } from "./types";
import { slugify } from "./utils";

const SLIDE_THEMES: Record<string, { bg: string; accent: string; titleColor: string }> = {
  title: { bg: "1E3A8A", accent: "3B82F6", titleColor: "FFFFFF" },
  problem: { bg: "FFFFFF", accent: "EF4444", titleColor: "1E293B" },
  solution: { bg: "F0FDF4", accent: "22C55E", titleColor: "14532D" },
  features: { bg: "FFFFFF", accent: "8B5CF6", titleColor: "1E293B" },
  architecture: { bg: "F8FAFC", accent: "0EA5E9", titleColor: "0F172A" },
  techStack: { bg: "FFFFFF", accent: "F59E0B", titleColor: "1E293B" },
  workflow: { bg: "EFF6FF", accent: "2563EB", titleColor: "1E3A8A" },
  screenshots: { bg: "FFFFFF", accent: "64748B", titleColor: "334155" },
  future: { bg: "FDF4FF", accent: "D946EF", titleColor: "701A75" },
  thankyou: { bg: "1E3A8A", accent: "60A5FA", titleColor: "FFFFFF" },
  default: { bg: "FFFFFF", accent: "2563EB", titleColor: "1E293B" },
};

function getTheme(type?: string) {
  return SLIDE_THEMES[type || "default"] || SLIDE_THEMES.default;
}

export async function generatePPTX(projectTitle: string, slides: PPTSlide[]): Promise<void> {
  const { default: pptxgen } = await import("pptxgenjs");
  const pres = new pptxgen();
  pres.author = "Hackathon Helper AI";
  pres.title = projectTitle;
  pres.subject = "Hackathon Project Presentation";

  slides.forEach((slide, index) => {
    const s = pres.addSlide();
    const theme = getTheme(slide.type);
    s.background = { color: theme.bg };

    if (slide.type === "title" || index === 0) {
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "1E3A8A" } });
      s.addShape(pres.ShapeType.rect, { x: 0, y: 4.5, w: "100%", h: 1, fill: { color: "3B82F6" } });
      s.addText(slide.title || projectTitle, { x: 0.5, y: 1.8, w: "90%", h: 1.5, fontSize: 36, bold: true, color: "FFFFFF", align: "center", fontFace: "Arial" });
      const subtitle = Array.isArray(slide.content) ? slide.content.join("\n") : slide.content || "Hackathon Project Pitch";
      s.addText(subtitle, { x: 0.5, y: 3.2, w: "90%", h: 1, fontSize: 18, color: "BFDBFE", align: "center", fontFace: "Arial" });
      s.addText("Powered by Hackathon Helper AI", { x: 0.5, y: 4.7, w: "90%", h: 0.5, fontSize: 12, color: "FFFFFF", align: "center", fontFace: "Arial" });
      return;
    }

    if (slide.type === "thankyou" || index === slides.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "1E3A8A" } });
      s.addText(slide.title || "Thank You!", { x: 0.5, y: 2, w: "90%", h: 1.5, fontSize: 44, bold: true, color: "FFFFFF", align: "center", fontFace: "Arial" });
      const content = Array.isArray(slide.content) ? slide.content.join("\n") : slide.content || "Questions?";
      s.addText(content, { x: 0.5, y: 3.5, w: "90%", h: 1.5, fontSize: 20, color: "BFDBFE", align: "center", fontFace: "Arial" });
      return;
    }

    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: "100%", fill: { color: theme.accent } });
    s.addText(slide.title || "Slide", { x: 0.5, y: 0.4, w: "90%", h: 0.8, fontSize: 28, bold: true, color: theme.titleColor, fontFace: "Arial" });
    s.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 2, h: 0.05, fill: { color: theme.accent } });

    const content = slide.content
      ? Array.isArray(slide.content)
        ? slide.content.map((item) => ({ text: item, options: { bullet: true, breakLine: true } }))
        : slide.content
      : "";

    s.addText(content, { x: 0.5, y: 1.6, w: "90%", h: 3.8, fontSize: 16, color: "334155", valign: "top", fontFace: "Arial", bullet: Array.isArray(slide.content) });
  });

  await pres.writeFile({ fileName: `${slugify(projectTitle)}_Presentation.pptx` });
}
