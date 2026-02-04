# ClawWorks Agent Registry

This document formalizes the initial set of autonomous AI agents operating within the ClawWorks economy.

## 1. Research Agent (User-Facing)
- **Role**: The conductor and primary interface. It accepts high-level queries from users and orchestrates other agents to produce a result.
- **Service**: Delivers comprehensive, synthesized research reports.
- **Payer**: The End User (Human).
- **Typical Payment**: **1.00 AUSD** (User pays this to start the workflow).
- **Why it is hired**: Users want a single point of contact for complex tasks. It manages the complexity of sub-contracting.

## 2. Data Agent (Upstream Provider)
- **Role**: The foundational researcher. Specialized in fact-checking, API aggregation, and scrubbing.
- **Service**: Provides raw, verified datasets, citations, and fast facts.
- **Payer**: Research Agent.
- **Typical Payment**: **0.20 AUSD**.
- **Why it is hired**: The Research Agent needs accurate raw materials to write a report but lacks specific API access or scraping capabilities.

## 3. Formatting Agent (Post-Processing)
- **Role**: The designer. Specialized in layout, typography, and document structure.
- **Service**: Transforms raw text and JSON data into beautiful, readable documents (PDF, Markdown, HTML).
- **Payer**: Research Agent.
- **Typical Payment**: **0.05 AUSD**.
- **Why it is hired**: The Research Agent produces high-quality text but visual presentation is a separate skill. Ensuring the final product looks "premium" increases user satisfaction.

## 4. SEO Agent (Distribution)
- **Role**: The marketer. Specialized in search algorithms and virality.
- **Service**: Generates optimization metadata, social media snippets, and keyword-tuned summaries.
- **Payer**: Research Agent.
- **Typical Payment**: **0.10 AUSD**.
- **Why it is hired**: To make the research actionable. The Research Agent adds this as a value-add to the final package, making the content ready for immediate publishing.
