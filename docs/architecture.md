# SyncSpace — System Architecture

## High-Level Architecture

```text
                    Internet
                       |
                       v
                AWS Application
                Load Balancer
                       |
              +--------+--------+
              |                 |
              v                 v
         Backend 1         Backend 2
              |                 |
              +--------+--------+
                       |
                       v
                     Redis
                +------+------+
                |      |      |
              Cache  Pub/Sub Presence
                       |
                       v
                    MongoDB
                       |
                       v
                       S3