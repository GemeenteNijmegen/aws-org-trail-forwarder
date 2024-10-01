# OrgTrail Forwarder

> [!CAUTION]
> This project is not used and therfore archived. AWS does not allow the manipulation of the orgtrail bucket managed by ControlTower. Therefore, no notifications can be setup. We considered creating a second OrgTrail, however, this will not fall in the free tier and end up costing too much.

This project deploys a queue to forward the orgtrail logging (in a different account) to the SIEM/SOC solution IRvN is using.


![Flow of logs](./docs/flow.drawio.png)