# Next Features

## Content Store & AI Humanization System

### Problem
AI-generated content has predictable patterns that Google detects and penalizes. The current auto-publish pipeline produces content that reads as AI-written, hurting rankings and trust.

### Solution
Build a content store system that trains the AI to write in a human voice by learning from reference articles, and switch from auto-publish to a draft review workflow.

### Components

#### 1. Content Store (Dashboard Tab)
- Upload or paste reference articles that represent the desired writing style
- Tag references by type (review, comparison, how-to) and tone (casual, technical, authoritative)
- Store per-site in `content-store.json`
- Support for multiple style profiles (e.g. "casual reviewer", "technical expert")

#### 2. Style Analysis & Extraction
- Analyze reference articles to extract voice characteristics:
  - Average sentence/paragraph length and variance
  - Vocabulary level and word choice patterns
  - Use of first person, humor, opinions, colloquialisms
  - Structure patterns (how sections are organized)
- Generate a style profile that gets injected into generation prompts

#### 3. Anti-AI-Pattern Rules
Hardcoded writing rules injected into every prompt:
- Vary paragraph length (some 1 sentence, some 5+)
- Never start with "When it comes to..." or "In the world of..."
- Avoid overused transitions ("Furthermore", "Additionally", "Moreover")
- Take strong opinionated stances — pick clear winners, call out bad products
- Include personal anecdotes and specific non-obvious details
- Use casual language mixed with technical detail (parenthetical asides, sentence fragments, starting with "And" or "But")
- Unbalanced pros/cons lists (not always 3 and 3)
- Include specific experience details ("the app takes 8 seconds to load live view")

#### 4. Draft Review Workflow
- Replace auto-publish with a draft queue
- Generated articles land in a "Drafts" status instead of publishing immediately
- Dashboard shows drafts for review with:
  - Side-by-side preview (markdown + rendered)
  - Inline editing
  - Approve / Edit / Reject actions
  - AI detection score estimate (optional)
- Only approved articles get published to the site
- Batch approve option for when confident in output quality

### Generation Flow (New)
```
Reference articles --> Style profile --> Enhanced prompt --> AI draft --> Review queue --> Human review --> Publish
```

### Priority
High — this is the single biggest improvement for long-term Google rankings and revenue sustainability.
