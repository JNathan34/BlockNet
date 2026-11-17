# BlockNet — Interactive Network Dashboard

A polished, responsive **BlockNet Mini / Lite / Home / Pro dashboard prototype**, based on the BlockNet business plan and supplied UI mockups. The site works on desktop, tablet and mobile, with a live-looking simulation generated entirely inside your browser.

> **Interactive concept — not a real ad blocker.** No real network is monitored, no DNS requests are intercepted, and no physical BlockNet device is connected. Statistics, connected clients, logs, security events, update statuses and firmware versions are sample data. Do not use this demo to claim verified protection, manufacturing readiness or product availability.

## Preview

| Mini | Lite |
|:---:|:---:|
| ![Mini dashboard](assets/previews/mini-desktop.png) | ![Lite dashboard](assets/previews/lite-desktop.png) |

| Home | Pro |
|:---:|:---:|
| ![Home dashboard](assets/previews/home-desktop.png) | ![Pro dashboard](assets/previews/pro-desktop.png) |

| Mobile Pro | Pro dark mode |
|:---:|:---:|
| ![Mobile Pro](assets/previews/pro-mobile.png) | ![Pro dark mode](assets/previews/pro-dark-desktop.png) |

## Start the demo

**Option A — no installation:** Download/extract the files and open `index.html` in Firefox, Chrome, Edge or Safari.

**Option B — local web server:** From the project directory:

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

**Switch models:** Open **Settings → Demo controls → BlockNet model**, then select Mini, Lite, Home or Pro. The entire dashboard updates instantly, including its branding, navigation, displayed tools, sample metrics and network details. Your chosen model, dark mode, filters and demo settings are remembered by the browser when local storage is available.

## Product models

| Model | Planned device | Browser dashboard | Mobile companion app | Demo layout |
| --- | --- | --- | --- | --- |
| **Mini** | USB-powered ESP32-C3, 2.4 GHz Wi‑Fi | Basic rebranded firmware UI | **No** | Basic: overview, network, domain rules, updates, settings |
| **Lite** | Raspberry Pi 3 B+, Ethernet, Pi-hole | BlockNet UI | **No** | Basic: overview, network, domain rules, updates, settings |
| **Home** | Raspberry Pi 4 2 GB, Ethernet, Pi-hole | BlockNet UI | **Planned** | Advanced: traffic charts, clients, filtering, security and reports |
| **Pro** | Raspberry Pi 5 4 GB, Ethernet, Pi-hole, front display | BlockNet UI | **Planned** | Advanced: richer analytics, exports and system health |

This is a *responsive website*, not a downloadable Android or iOS app. The future companion app is in the business plan for Home/Pro only. **Family profiles and scheduled parental restrictions are excluded for all models.** The brand shield has no tick/check mark.

## Interactive features

- Continuous simulated DNS queries, blocked requests, events, clients and chart activity.
- Fully responsive desktop sidebar and mobile bottom navigation.
- Four-model preview selector that adapts the layout and sample telemetry.
- Light/dark mode with local persistence.
- Demo offline/reconnect controls, pause/resume updates and reset data.
- Device explorer, sample per-client filtering controls for supported model demos.
- Ad/tracker filters and sample allow/block domain rules. Mini's firmware feature set must be verified before a real implementation.
- CSV exports and printable HTML demo reports on the advanced model views.
- Local-only static files, no framework, build tools, account or server required.

## GitHub Pages deployment

1. Create a new GitHub repository (suggested name: `BlockNet-Website`).
2. Upload the contents of this folder with `index.html` at the repository root.
3. Go to **Settings → Pages**, choose **Deploy from a branch**, `main` and `/(root)`, and save.
4. The deployed site will be a **public demonstration only**; it will not connect to DNS hardware.

The GitHub Pages steps apply after a repository is created and Pages is enabled; uploading the files alone does not publish a website.

## Project structure

```text
BlockNet-Website/
├── index.html                # All four dashboards and page navigation
├── styles.css                # Mobile, desktop, theme and model-specific layouts
├── app.js                    # Live simulation, model switching and demo controls
├── favicon.svg               # No-check shield logo
├── .nojekyll                 # Static GitHub Pages support
├── README.md
├── assets/
│   ├── previews/             # Screenshots of each model, desktop and mobile
│   └── product-renders/      # Device, logo and packaging concept artwork
└── docs/
    ├── BlockNet_Business_Plan_2026.docx # Original source specification
    ├── implementation-notes.md
    └── references/           # Provided design and change-request images
```

## Planning source and caveats

Primary source: `docs/BlockNet_Business_Plan_2026.docx`, particularly **pages 3, 7, 9–11 and 13–17**, which define device capabilities and show the desktop/mobile dashboards. The plan explicitly describes its photography and interface artwork as concepts, not completed software or shipped devices. Original concept renders from the plan are included as design references. The source document also describes monthly **BlockNet Flex** plans; this repository is only the *device management dashboard*, **not** a shop, checkout, payment system or subscription service.

Before connecting this UI to real hardware, build an authenticated local backend, verify API access to the chosen firmware or Pi-hole version, test router DNS requirements, secure device credentials and validate the actual telemetry. DNS filtering does **not** block every advert, substitute for antivirus or improve broadband throughput.

**Asset rights:** The logo, reference images, product renders and business plan were supplied as BlockNet project materials. No third-party license is granted by this repository. Review project content and private information before making the repository public.
