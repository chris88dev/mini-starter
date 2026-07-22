---
name: agent-browser
description: Gebruik de agent-browser CLI om de lokale preview te openen, screenshots te maken en zichtbare wijzigingen op desktop en mobiel te controleren. Gebruik na websitewijzigingen volgens de hoofd-instructies, of wanneer gevraagd wordt de preview te bekijken.
---

# Agent Browser

Gebruik `agent-browser` voor visuele controle van de lokale preview.

De commando's kunnen per versie verschillen. Laad daarom bij de eerste browsercontrole van een sessie de actuele instructies uit de CLI:

```bash
agent-browser skills get core
```

Volg daarna de desktop- en mobiele routine uit de hoofd-instructies (`CLAUDE.md` / `AGENTS.md`). Minimaal, voor een gewijzigde pagina op `<PREVIEW_URL>/<PAD>`:

```bash
agent-browser open "<PREVIEW_URL>/<PAD>"
agent-browser wait --load networkidle
agent-browser set viewport 1280 900
agent-browser screenshot --full /tmp/starter-preview-desktop.png
agent-browser set viewport 390 844
agent-browser screenshot --full /tmp/starter-preview-mobile.png
agent-browser errors
```

Bekijk beide screenshots daadwerkelijk voordat je meldt dat de wijziging klaar is.

## Extra controle voor secties en overgangen

Bij wijzigingen aan zichtbare secties controleer je extra scherp de overgang naar de sectie ervoor en erna, vooral bij toegevoegde, verborgen, verwijderde, ingekorte of herordende secties.

- Scroll langs alle gewijzigde secties zodat scroll-animaties zichtbaar zijn.
- Let op afgebroken of overlappende tekst, horizontale overflow, ontbrekende onderdelen, verkeerde achtergrondkleuren tussen secties, en illustraties die over tekst of knoppen vallen.
- Controleer minimaal de overgang boven en onder de gewijzigde sectie.
- Zie je een fout aangesloten overgang, herstel die en maak opnieuw screenshots op beide formaten.

Ontbreekt `agent-browser` of kan het nog geen browser openen, gebruik `setup-machine`; die installeert de CLI en voert `agent-browser install` uit.
