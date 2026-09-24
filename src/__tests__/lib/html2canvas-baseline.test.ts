import { describe, expect, it } from "vitest";

import { withHtml2canvasBaselineFix } from "@/lib/dom/html2canvas-baseline";

const probeRules = () =>
  Array.from(document.head.querySelectorAll("style")).filter((s) =>
    s.textContent?.includes("display: inline !important"),
  );

describe("withHtml2canvasBaselineFix", () => {
  it("remet l'image d'essai en ligne pendant la capture seulement", async () => {
    let during = 0;
    const result = await withHtml2canvasBaselineFix(async () => {
      during = probeRules().length;
      return "canvas";
    });

    expect(result).toBe("canvas");
    expect(during).toBe(1);
    expect(probeRules()).toHaveLength(0);
  });

  it("retire la règle même si la capture échoue", async () => {
    await expect(
      withHtml2canvasBaselineFix(async () => {
        throw new Error("échec");
      }),
    ).rejects.toThrow("échec");
    expect(probeRules()).toHaveLength(0);
  });
});
