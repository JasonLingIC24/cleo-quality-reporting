import { FailedTest } from "../../models";
import { findScreenshots } from "../../utils/findScreenshots";

export function extractFailedTests(
  results: any[],
  screenshotsRoot: string,
): FailedTest[] {
  const failures: FailedTest[] = [];

  for (const result of results) {
    walkSuite(
      result,
      result.fullFile ?? result.file ?? "",
      [],
      screenshotsRoot,
      failures,
    );
  }

  return failures;
}

function walkSuite(
  suite: any,
  specFile: string,
  scenario: string[],
  screenshotsRoot: string,
  failures: FailedTest[],
): void {
  const currentScenario = suite.title ? [...scenario, suite.title] : scenario;

  for (const test of suite.tests ?? []) {
    if (test.state !== "failed") {
      continue;
    }

    failures.push({
      testCaseId: extractTestCaseId(test.title),

      feature: extractFeature(test.fullTitle),

      specFile,

      title: test.title,

      thenStep: extractThenStep(test.title),

      rootCause: extractRootCause(test.err?.message ?? ""),

      selector: extractSelector(test.err?.message ?? ""),

      scenario: currentScenario,

      tags: [],

      duration: test.duration ?? 0,

      hook: extractHook(test.err?.message ?? ""),

      errorMessage: test.err?.message ?? "",

      screenshotPaths: findScreenshots(
        screenshotsRoot,
        extractTestCaseId(test.title),
      ),

      videoPath: extractVideo(test.context),
    });
  }

  for (const child of suite.suites ?? []) {
    walkSuite(child, specFile, currentScenario, screenshotsRoot, failures);
  }
}

function extractTestCaseId(title: string): string {
  const match = title.match(/\[(.*?)\]/);

  return match?.[1] ?? "";
}

function extractFeature(fullTitle: string): string {
  const match = fullTitle.match(/^Feature:\s*(.*?)\s+(?:GIVEN|WHEN)/i);

  if (!match) {
    return "Unknown";
  }

  const feature = match[1].replace(/\s+[A-Z][A-Z\s-]{5,}$/, "").trim();

  return feature;
}

function extractHook(errorMessage: string): string {
  if (errorMessage.includes("before all")) {
    return "before all";
  }

  if (errorMessage.includes("before each")) {
    return "before each";
  }

  if (errorMessage.includes("after all")) {
    return "after all";
  }

  return "";
}

function extractVideo(context: string | null): string | undefined {
  if (!context) {
    return undefined;
  }

  const match = context.match(/videos\/.*?\.mp4/);

  return match?.[0];
}

function extractThenStep(title: string): string {
  const match = title.match(/\]\s*(.*)/);

  return match?.[1] ?? title;
}

function extractRootCause(errorMessage: string): string {
  const message = errorMessage.toLowerCase();

  // Missing element

  if (message.includes("expected to find element")) {
    return "Element Missing";
  }

  // Missing content/text

  if (message.includes("expected to find content")) {
    return "Content Missing";
  }

  // Cypress page load issues

  if (message.includes("remote page to load")) {
    return "Page Load Timeout";
  }

  if (message.includes("page did not fire its `load` event")) {
    return "Page Load Timeout";
  }

  // Generic timeout

  if (message.includes("timed out retrying")) {
    return "Command Timeout";
  }

  if (message.includes("timed out after waiting")) {
    return "Command Timeout";
  }

  // Visibility failures

  if (message.includes("not visible")) {
    return "Element Not Visible";
  }

  if (message.includes("expected '<") && message.includes("to be visible")) {
    return "Element Not Visible";
  }

  // Disabled controls

  if (message.includes("to not be disabled")) {
    return "Element Disabled";
  }

  // Detached DOM

  if (message.includes("detached from the dom")) {
    return "Detached DOM Element";
  }

  // Authentication

  if (message.includes("401")) {
    return "Authentication Failure";
  }

  // Authorisation

  if (message.includes("403")) {
    return "Authorisation Failure";
  }

  // Missing resource

  if (message.includes("404")) {
    return "Resource Not Found";
  }

  // Server failure

  if (message.includes("500")) {
    return "Internal Server Error";
  }

  if (message.includes("502")) {
    return "Bad Gateway";
  }

  if (message.includes("503")) {
    return "Service Unavailable";
  }

  // Assertions

  if (message.includes("expected") && message.includes("to equal")) {
    return "Assertion Failure";
  }

  if (message.includes("deep equal")) {
    return "Assertion Failure";
  }

  if (message.includes("to have property")) {
    return "Missing Response Property";
  }

  // Network

  if (message.includes("cy.wait() timed out")) {
    return "Network Timeout";
  }

  if (message.includes("no request ever occurred")) {
    return "Network Request Missing";
  }

  // Content assertion failures
  if (message.includes("to include")) {
    return "Content Assertion Failure";
  }

  // Authentication checks
  if (message.includes("session.ensureauthenticated")) {
    return "Authentication Failure";
  }

  if (message.includes(".elevate-session-id")) {
    return "Authentication Failure";
  }

  // NULL Reference
  if (message.includes("cannot read properties of undefined")) {
    return "Null Reference";
  }

  if (message.includes("cannot read properties of null")) {
    return "Null Reference";
  }

  // Invalid JSON
  if (message.includes("not valid json")) {
    return "Invalid JSON";
  }

  // Test Data Configuration Failure
  if (message.includes("no case types found")) {
    return "Test Data Configuration";
  }

  // Application Exception
  if (
    message.includes(
      "the following error originated from your application code",
    )
  ) {
    return "Application Exception";
  }

  // Test Framework Error
  if (message.includes("mixing up async and sync code")) {
    return "Test Framework Error";
  }

  // Page object Error
  if (message.includes("is not a function")) {
    return "Automation Code Error";
  }

  // URL Assertion Failure
  if (message.includes("to match") && message.includes("assertionerror")) {
    return "URL Assertion Failure";
  }

  // UNKNOWN FAILURE TYPE
  console.log("\n[UNKNOWN FAILURE TYPE]\n");

  const shortMessage = errorMessage.split("\n").slice(0, 5).join("\n");

  console.log(shortMessage);

  console.log("\n---------------------\n");

  return "Unknown";
}

function extractSelector(errorMessage: string): string | undefined {
  const match = errorMessage.match(/Expected to find element:\s*`([^`]+)`/);

  return match?.[1];
}
