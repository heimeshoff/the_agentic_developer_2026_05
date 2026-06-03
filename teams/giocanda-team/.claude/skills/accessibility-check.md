---
skill: accessibility-check
description: Validate application accessibility and WCAG 2.1/2.2 compliance
---

# Accessibility Check

This skill validates that the application meets WCAG (Web Content Accessibility Guidelines) principles and is fully accessible to users with disabilities.

## WCAG Principles (POUR)

### 1. Perceivable
Information and UI components must be presentable to users in ways they can perceive.

**Check for:**
- [ ] Text alternatives for non-text content (alt text for images)
- [ ] Captions and transcripts for audio/video
- [ ] Content can be presented in different ways without losing meaning
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] Color is not the only means of conveying information

### 2. Operable
UI components and navigation must be operable by all users.

**Check for:**
- [ ] All functionality available via keyboard (no mouse-only interactions)
- [ ] No keyboard traps (users can navigate away from any component)
- [ ] Sufficient time to read and use content (or ability to extend/disable time limits)
- [ ] No content that flashes more than 3 times per second
- [ ] Clear focus indicators for keyboard navigation
- [ ] Skip links to bypass repetitive content
- [ ] Descriptive page titles
- [ ] Logical focus order

### 3. Understandable
Information and UI operation must be understandable.

**Check for:**
- [ ] Language of page is specified (lang attribute)
- [ ] Language changes are marked up
- [ ] Predictable navigation and consistent patterns
- [ ] Input labels and instructions provided
- [ ] Error messages are clear and provide guidance
- [ ] Context-sensitive help available for complex interactions

### 4. Robust
Content must be robust enough to work with current and future technologies.

**Check for:**
- [ ] Valid HTML (no parsing errors)
- [ ] Proper ARIA attributes where needed
- [ ] Name, role, and value exposed for all UI components
- [ ] Status messages communicated to assistive technologies

## Validation Process

### Static Analysis
1. **HTML Validation:** Check for valid, semantic HTML5
2. **Color Contrast:** Use tools or calculate ratios manually
3. **ARIA Review:** Verify proper use of ARIA roles, states, properties
4. **Heading Structure:** Ensure logical h1-h6 hierarchy
5. **Form Labels:** All inputs have associated labels
6. **Link Text:** Links have meaningful text (avoid "click here")

### Dynamic Testing
1. **Keyboard Navigation:** Tab through entire interface
2. **Screen Reader:** Test with VoiceOver (macOS), NVDA/JAWS (Windows)
3. **Zoom:** Test at 200% zoom level
4. **Color Blindness:** Simulate different types of color blindness
5. **Focus Management:** Verify focus behavior on interactions

### Automated Tools
- `axe-core` - Accessibility testing engine
- `pa11y` - Automated accessibility testing
- `lighthouse` - Chrome DevTools accessibility audit
- `eslint-plugin-jsx-a11y` - Linting for React accessibility

## Common Issues to Flag

### Critical (WCAG Level A)
- Missing alt text on images
- Form inputs without labels
- Insufficient color contrast
- Keyboard traps
- Missing page language

### Important (WCAG Level AA)
- Color contrast below 4.5:1 for normal text
- No focus indicators
- Unclear error messages
- Auto-playing audio/video
- Time limits without control

### Enhanced (WCAG Level AAA)
- Color contrast below 7:1
- Context-sensitive help
- Consistent navigation across pages

## Reporting Format

For each issue found, provide:
- **Severity:** Critical/Important/Enhanced (WCAG Level)
- **Location:** File path and line number
- **Issue:** Description of accessibility problem
- **Impact:** Which users are affected
- **Fix:** Specific code change needed
- **WCAG Criterion:** Reference (e.g., 1.4.3 Contrast Minimum)

## Example Output

```
❌ Critical: Missing alt text (WCAG 1.1.1 - Non-text Content)
   Location: src/components/Dashboard.tsx:45
   Issue: <img src="chart.png" /> has no alt attribute
   Impact: Screen reader users cannot understand the chart
   Fix: Add alt="Monthly spending trend chart showing $2,500 in expenses"

⚠️ Important: Insufficient color contrast (WCAG 1.4.3 - Contrast Minimum)
   Location: src/styles/theme.css:12
   Issue: Text color #767676 on white background has 3.6:1 ratio
   Impact: Users with low vision may struggle to read text
   Fix: Use #595959 or darker for 4.5:1 ratio

✅ Pass: All form inputs have associated labels
```

## Integration with Development

Run this check:
- Before committing significant UI changes
- After adding new interactive components
- Before creating a pull request
- As part of CI/CD pipeline (automated tools)
- During feature acceptance testing
