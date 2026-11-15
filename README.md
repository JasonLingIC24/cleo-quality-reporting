# cleo-quality-reporting

Quality reporting and failure investigation tooling for Cleo automated test suites.

## Overview

cleo-quality-reporting consumes automation test artifacts and generates investigation-focused reports for QA and Automation Engineers.

The tool is designed to reduce the time required to diagnose regression failures by automatically:

- Parsing Mochawesome results
- Extracting failed test cases
- Classifying failure types
- Discovering screenshots
- Discovering videos
- Grouping duplicate failures
- Building investigation reports

---

## Supported Inputs

### Cypress

Current support:

- Mochawesome JSON
- Cypress screenshots
- Cypress videos

Example:

```text
artifacts/

    artifacts/

        mochawesome/
            index.json

        screenshots/

        videos/
```

---

## Generated Outputs

```text
reports/

    failure-investigation/

        index.md

        auditLogView.md

        casesFilters.md

        privatePrescribing.md

        userSettingsByOrgAdmin.md
```

---

## Failure Investigation Reports

Each report contains:

### Spec Summary

- Spec file
- Failure count
- Root cause breakdown

### Common Failure Groups

Failures are grouped by:

- Root cause
- Missing selector

Example:

```text
[data-testid="prescriber-info-edit-button"]

Affected Tests

- USE-USBOA-TC-09
- USE-USBOA-TC-13
- USE-USBOA-TC-14
```

### Failure Details

For each failed test:

- Test Case ID
- Scenario
- Root Cause Classification
- Missing Selector
- Hook Information
- Screenshot Evidence
- Video Evidence
- Raw Error

---

## Root Cause Classification

Current classifications include:

- Element Missing
- Content Missing
- Page Load Timeout
- Command Timeout
- Authentication Failure
- Authorisation Failure
- Resource Not Found
- Internal Server Error
- Service Unavailable
- Application Exception
- Automation Code Error
- Test Framework Error
- Invalid JSON
- Null Reference
- Assertion Failure
- Content Assertion Failure
- Test Data Configuration

---

## Usage

Install dependencies:

```bash
npm install
```

Run analysis:

```bash
npm start
```

Build project:

```bash
npm run build
```

---

## Intended Audience

### Failure Investigation Reports

Primary users:

- Junior QA Engineers
- QA Engineers
- QA Automation Engineers

Purpose:

- Investigate failures
- Identify root causes
- Review screenshots
- Review videos
- Prioritise fixes

---

## Version

Current Version:

```text
v1.0.0
```

Status:

```text
Production Ready
```

The current release provides complete failure investigation reports for Cypress regression executions.
