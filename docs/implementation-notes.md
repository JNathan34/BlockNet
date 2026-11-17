# BlockNet dashboard — implementation notes

## Design source

The design is derived from the supplied reference screenshots and the Word plan **BlockNet_Business_Plan_With_Flex_Subscriptions_2026** (updated 5 November 2026). The concept dashboards appear on pages **13–17**, with the formal capabilities comparison on page **7** and the software specification on pages **3 and 11**.

## Resolved choices

1. **The brand shield has no check mark.** Check icons elsewhere still indicate an up-to-date list or service status.
2. **A model selector in Settings** switches between Mini, Lite, Home and Pro. The selected model is saved locally and is reflected throughout the interface.
3. **Mini/Lite:** reduced desktop and mobile browser dashboards with basic network, recent domains, activity and blocklist updates. No companion app and no family/parental profiles. Mini uses an illustrative ESP32-C3 firmware frontend; Lite is presented as Pi-hole-based.
4. **Home/Pro:** full analytics panels, filtering, devices, security, reporting and system health. This is still a responsive website; Home/Pro native mobile apps are planned but not built.
5. **Demo telemetry:** local synthetic state changes every ~2.7 seconds. Simulated domain names, client identities and DNS requests must not be treated as actual network security data.

## Real implementation roadmap

- Integrate a real Pi-hole API using a separate authenticated service that protects credentials, validates requests and limits access to authorized LAN clients.
- Implement and test the BlockNet Mini firmware dashboard within ESP32-C3 memory and UI constraints.
- Replace demo-only data with supported DNS metrics; avoid claiming real threat protection without evidence.
- Validate firmware updates, per-client policies and the Pro device's front display on the actual electronics.
- Add Home/Pro native mobile app support as a separate project when API and secure device pairing are complete.
- Keep cloud subscription/payment/account metadata separate from private local DNS histories.

## Product feature boundaries

- Pi-hole is the proposed DNS backend for Lite, Home and Pro, not Mini.
- Family profiles and scheduled parental restrictions are not part of BlockNet's agreed feature set.
- The DNS appliance is *not* a network throughput monitor, full firewall, antivirus or bypass-proof ad blocker.
- Internet-wide access, remote management, ownership changes and rental billing are not implemented in this frontend.
- The sample values in the dashboard are illustrative; product tiers are not broadband speed tiers.
