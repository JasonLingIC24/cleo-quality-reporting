# cleo-quality-reporting

A reporting and quality intelligence platform for the Elevate automation estate.

The project consumes GitHub Actions artifacts produced by:

- Cypress UI tests
- Backend Unit tests
- Backend Integration tests
- Frontend Coverage reports
- Manual Regression workbooks

and produces several report types including:

- Nightly Regression Reports
- Release Readiness Reports
- Teams Summary Reports
- Failure Analysis Reports

---

# Objectives

The goals of this project are to:

- Provide a single quality view across all automated and manual testing
- Identify the highest-impact failures in a release
- Group failures into probable defects
- Track release readiness
- Monitor manual regression execution progress
- Surface coverage metrics
- Generate management-friendly release decisions

---

# Supported Report Types

## Nightly Regression Report

Generates a quality report for a GitHub Actions nightly execution.

Includes:

- Cypress statistics
- Backend Unit statistics
- Backend Integration statistics
- Frontend coverage metrics
- Failure trends
- Most impacted features
- Candidate defect grouping
- Executive summary

Example:

```bash
npm run nightly-report -- <github-run-id>
```

Example:

```bash
npm run nightly-report -- 45426083976
```

---

## Release Readiness Report

Generates a release-focused report based on:

- Automated test results
- Manual regression results
- Release-specific test plan

Includes:

- Executive Summary
- Release Recommendation
- Release Test Plan
- Workbook Progress
- Owner Progress
- Manual Regression Summary
- Coverage Metrics
- Release Blocking Issues

Example:

```bash
npm run release-report -- <release-version>
```

Example:

```bash
npm run release-report -- v26.24.1
```

---

## Teams Summary Report

Produces a concise report suitable for Teams posting.

Includes:

- Overall quality status
- Test totals
- Pass rate
- Failures
- Top issues

Example:

```bash
npm run teams-report -- <github-run-id>
```

Example:

```bash
npm run teams-report -- 45426083976
```

---

## Failure Investigation Report

Produces grouped failure intelligence from Cypress failures.

Includes:

- Failure Categories
- Candidate Defects
- Impacted Features
- Impacted Test Cases
- Failure Counts

Example output:

```text
Missing Element

Affected Tests: 22

Affected Features: 8

Root Cause:
div[data-testid="attribute-born"]
```

---

# Release Test Plans

Release readiness is driven by a release test plan.

Location:

```text
release-plans/
```

Example:

```json
{
  "releaseVersion": "v26.24.1",
  "releaseDate": "2026-11-23",
  "githubRunId": "45426083976",
  "manualWorkbooks": [
    {
      "workbookId": "audit-log-viewer",
      "owner": "QA Team",
      "required": true,
      "reason": "Audit functionality changed in release"
    }
  ]
}
```

---

# Release Workbook Fields

## workbookId

Workbook identifier.

Example:

```json
{
  "workbookId": "audit-log-viewer"
}
```

---

## owner

Workbook owner.

Example:

```json
{
  "owner": "QA Team"
}
```

---

## required

Determines whether the workbook contributes towards release readiness.

Example:

```json
{
  "required": true
}
```

If:

```json
{
  "required": false
}
```

the workbook is considered:

```text
Out Of Scope
```

and does not contribute to:

- Release Recommendation
- Manual Regression Totals
- Workbook Progress
- Owner Progress
- Release Status

---

## reason

Documents why the workbook is included or excluded.

Example:

```json
{
  "reason": "Authentication service changes"
}
```

Example:

```json
{
  "reason": "No changes included in release scope"
}
```

---

# Configuration Reference

## Environment Variables

The application uses GitHub Actions run IDs, release plans and downloaded artifacts to build reports.

---

## Release Test Plan

Release reports are driven by JSON files located in:

```text
release-plans/
```

Example:

```text
release-plans/release-test-plan-v26.24.1.json
```

---

## ReleaseTestPlan

```ts
interface ReleaseTestPlan {
  releaseVersion: string;
  releaseDate: string;
  githubRunId: string;
  manualWorkbooks: ReleaseWorkbook[];
}
```

### releaseVersion

Release identifier used when generating release reports.

Example:

```json
{
  "releaseVersion": "v26.24.1"
}
```

---

### releaseDate

Target release date.

Example:

```json
{
  "releaseDate": "2026-11-23"
}
```

---

### githubRunId

GitHub Actions run used as the quality baseline for the release.

Example:

```json
{
  "githubRunId": "45426083976"
}
```

---

## ReleaseWorkbook

```ts
interface ReleaseWorkbook {
  workbookId: string;
  owner?: string;
  required?: boolean;
  reason?: string;
}
```

---

### workbookId

Unique workbook identifier.

Example:

```json
{
  "workbookId": "audit-log-viewer"
}
```

Supported examples:

```text
audit-log-viewer
bars
cis2
cpis
ecds
general-checks
gpc-send-doc
itk3
prescribing
user-login-profiles
vwr-specifics
vwr-white-labeling
```

---

### owner

Workbook owner.

Example:

```json
{
  "owner": "QA Team"
}
```

Used within:

```text
Release Test Plan
Owner Progress
```

---

### required

Determines whether the workbook contributes towards release readiness.

Example:

```json
{
  "required": true
}
```

When:

```json
{
  "required": true
}
```

the workbook contributes to:

- Release Recommendation
- Overall Status
- Manual Regression Summary
- Workbook Progress
- Owner Progress

When:

```json
{
  "required": false
}
```

the workbook appears under:

```text
Excluded Workbooks
```

and does not affect the release decision.

---

### reason

Documents why the workbook is included or excluded from release scope.

Example:

```json
{
  "reason": "Authentication service changes"
}
```

Example:

```json
{
  "reason": "No changes included within release scope"
}
```

Used within:

```text
Release Test Plan
Excluded Workbooks
```

---

## Artifact Structure

Expected artifact directory structure:

```text
artifacts/
└── runs/
    └── <run-id>/
        └── extracted/
            ├── cypress/
            ├── backend-unit/
            ├── backend-integration/
            └── frontend/
```

---

## Cypress Artifacts

Expected files:

```text
cypress/
├── mochawesome.json
├── summary.json
└── summary.md
```

Used by:

```text
Nightly Report
Release Report
Teams Report
```

---

## Backend Unit Artifacts

Expected files:

```text
backend-unit/
└── test-summary.json
```

Used by:

```text
Quality Metrics
Executive Summary
Release Readiness
```

---

## Backend Integration Artifacts

Expected files:

```text
backend-integration/
└── test-summary.json
```

Used by:

```text
Quality Metrics
Executive Summary
Release Readiness
```

---

## Frontend Coverage Artifacts

Expected files:

```text
frontend/
└── coverage-summary.json
```

Used by:

```text
Frontend Coverage
Executive Summary
Release Readiness
```

---

## Report Output Locations

### Management Reports

```text
reports/management/
```

Example:

```text
reports/management/regression-summary.md
```

---

### Teams Reports

```text
reports/teams/
```

Example:

```text
reports/teams/nightly-regression-summary.md
```

---

## Supported Commands

Nightly Report:

```bash
npm run nightly-report -- <github-run-id>
```

Example:

```bash
npm run nightly-report -- 45426083976
```

---

Release Report:

```bash
npm run release-report -- <release-version>
```

Example:

```bash
npm run release-report -- v26.24.1
```

---

Teams Report:

```bash
npm run teams-report -- <github-run-id>
```

Example:

```bash
npm run teams-report -- 45426083976
```

---

TypeScript Build:

```bash
npm run build
```

---

# Release Readiness Workflow

## Step 1

Execute automated testing:

```text
Cypress
Backend Unit
Backend Integration
Frontend Coverage
```

---

## Step 2

Create release plan.

Example:

```text
release-plans/release-test-plan-v26.24.1.json
```

---

## Step 3

Generate release report.

```bash
npm run release-report -- v26.24.1
```

---

## Step 4

Review:

```text
Release Recommendation
Overall Status
Candidate Defects
Manual Regression Status
Coverage
```

---

# Release Statuses

## ✅ Complete

All required workbooks executed.

Example:

```text
Failed Assertions: 0
Not Run Assertions: 0
```

---

## 🟡 In Progress

Required workbook execution remains outstanding.

Example:

```text
Failed Assertions: 0
Not Run Assertions: 75
```

---

## 🔴 Failed

Manual regression failures exist.

Example:

```text
Failed Assertions: 5
```

---

# Release Recommendation States

## 🟢 Release Approved

No blocking automated failures.

No manual failures.

No outstanding required manual execution.

---

## 🟡 Release With Risk

Non-blocking quality concerns detected.

Examples:

- Elevated automation failure rate
- Limited manual execution remaining

---

## 🔴 Do Not Release

Examples:

```text
Manual failures present

or

Critical automation failures detected

or

High-impact candidate defects detected
```

---

# Candidate Defects

Multiple failing tests are automatically grouped into likely defects.

Example:

```text
Root Cause:
div[data-testid="attribute-born"]

Affected Tests:
22

Affected Features:
8
```

Candidate defects are ranked by impact and included within:

```text
Executive Summary
Release Recommendation
Key Issues
```

---

# Manual Regression

Manual regression information is extracted from workbook execution results.

Metrics include:

- Scenario Count
- Assertion Count
- Passed
- Failed
- Not Run
- Not Applicable

Example:

```text
Audit Log Viewer

Assertions: 18

Pass: 18
Fail: 0
Not Run: 0
```

---

# Owner Progress

The release report tracks workbook ownership.

Example:

```text
| Owner | Complete | In Progress | Not Started |
```

Used to identify execution responsibility and release progress.

---

# Excluded Workbooks

Release reports now include:

```text
### Excluded Workbooks
```

This section explains:

- Which workbooks are out of scope
- Why they are excluded

Example:

```text
bars

Reason:
No BaRS changes included in release scope
```

---

# Frontend Coverage

Frontend coverage metrics are collected and reported.

Metrics:

- Lines
- Statements
- Functions
- Branches

Example:

```text
Lines: 67.88%
Statements: 67.60%
Functions: 61.21%
Branches: 59.16%
```

---

# Output Locations

Generated reports are written to:

```text
reports/
```

Management reports:

```text
reports/management/
```

Teams reports:

```text
reports/teams/
```

Downloaded artifacts:

```text
artifacts/
```

---

# Development

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

---

# Common Commands

Generate Nightly Report:

```bash
npm run nightly-report -- 45426083976
```

Generate Release Report:

```bash
npm run release-report -- v26.24.1
```

Generate Teams Summary:

```bash
npm run teams-report -- 45426083976
```

Compile TypeScript:

```bash
npm run build
```

---

# Architecture

```text
GitHub Actions
        │
        ▼
 GitHub Artifacts
        │
        ▼
 Artifact Downloaders
        │
        ▼
        Parsers
        │
        ▼
      Models
        │
        ▼
 Quality Analysis
        │
        ▼
 Report Generators
        │
        ▼
Markdown Reports
```

---

# Generated By

```text
cleo-quality-reporting
```

Purpose:

```text
Transform raw execution results into actionable release intelligence.
```
