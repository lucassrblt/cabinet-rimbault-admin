import { describe, expect, it } from "vitest";

import { splitLeadIn } from "@/lib/label-lead-in";

describe("splitLeadIn", () => {
  const title = "MAISON 5 PIECES + JARDIN";

  it("isole le titre quand la description commence par lui", () => {
    expect(splitLeadIn("MAISON 5 PIECES + JARDIN – Au calme", title)).toEqual({
      lead: "MAISON 5 PIECES + JARDIN",
      rest: " – Au calme",
    });
  });

  it("ignore la casse et garde celle de la description", () => {
    expect(splitLeadIn("Maison 5 pieces + jardin, au calme", title)).toEqual({
      lead: "Maison 5 pieces + jardin",
      rest: ", au calme",
    });
  });

  it("ignore les espaces de bord", () => {
    expect(splitLeadIn("  MAISON 5 PIECES + JARDIN – Au calme", ` ${title} `)).toEqual({
      lead: "MAISON 5 PIECES + JARDIN",
      rest: " – Au calme",
    });
  });

  it("rend la description entière quand elle ne commence pas par le titre", () => {
    expect(splitLeadIn("Au calme, une MAISON 5 PIECES + JARDIN", title)).toEqual({
      lead: "",
      rest: "Au calme, une MAISON 5 PIECES + JARDIN",
    });
  });

  it("n'isole rien avec un titre vide", () => {
    expect(splitLeadIn("Au calme", "  ")).toEqual({ lead: "", rest: "Au calme" });
  });

  it("gère une description égale au titre", () => {
    expect(splitLeadIn(title, title)).toEqual({ lead: title, rest: "" });
  });
});
