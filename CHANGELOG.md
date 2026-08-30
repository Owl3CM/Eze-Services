# Changelog

## 2.0.1

- Corrected six `utils` import paths so clean checkouts build on case-sensitive filesystems.
- Added a Git-tree-aware import-casing verification to the release pipeline.
- Updated vulnerable development tooling, made the clean Rollup TypeScript pipeline explicit, and replaced the deprecated terser plugin; production and development audits are clean.
- Pinned repository build, test, and publish work to Node.js 22 LTS while retaining the Node.js 18+ runtime contract.
- Kept the dual ESM/CommonJS package contract and portable installed agent documentation introduced in 2.0.0.

## 2.0.0

- Added the expanded Hive, Query, Table, Flow, Form, Loader, Paginator, Status, and Exporter APIs.
- Added dual ESM/CommonJS exports, TypeScript declarations, packaged source, and installed-agent documentation.
- Added focused regression coverage and manual, artifact-first release verification.
