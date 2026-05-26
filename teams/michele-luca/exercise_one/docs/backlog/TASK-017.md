# TASK-017: Documentation and User Guide

## Metadata
- **Track**: Polish
- **Priority**: P3 (Low - nice-to-have)
- **Estimate**: 1-2 hours
- **Dependencies**: All tasks (document completed features)
- **Blocks**: None
- **Status**: Blocked by completion of other tasks

## Objective
Create user-facing documentation: README with getting started, feature overview, screenshots, and troubleshooting. Also document codebase architecture for future developers.

## Acceptance Criteria
- [ ] README.md updated with: project description, installation instructions, feature list, screenshots
- [ ] User guide (inline help or separate doc): how to create accounts, add transactions, set budgets, interpret dashboard
- [ ] Architecture document: folder structure, state management, domain model overview
- [ ] Troubleshooting section: common issues (localStorage full, browser compatibility)
- [ ] License and attribution (if using third-party libraries)
- [ ] Optional: video demo or animated GIFs showing key workflows

## Technical Notes
- Use markdown for all docs (easy to maintain, renders on GitHub)
- Screenshots: capture at 1280x720 or similar for clarity
- Architecture diagram: use Mermaid (GitHub supports inline rendering) or ASCII art
- Keep docs up-to-date: note which features are MVP vs. future work

## Implementation Hints
```markdown
# Budget App

A personal finance and budgeting application built with React 19, TypeScript, and Vite.

## Features

- Track accounts (checking, savings, credit cards)
- Categorize transactions
- Set monthly budgets with rollover support
- Dashboard with spending insights
- Dark mode
- Export/import data as JSON

## Getting Started

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Open http://localhost:5173

## Usage

### Adding an Account
1. Navigate to Accounts page
2. Click "Add Account"
3. Fill in name, type, and initial balance
4. Click Save

(Continue for other features...)

## Troubleshooting

**Issue:** Data not persisting across sessions
**Solution:** Check browser privacy settings; localStorage may be disabled in incognito mode.

## License

MIT
```

## Risks & Considerations
- **Low risk**: Documentation task, no code changes
- Keep it concise: users skim, don't read novels
- Update as features change (living document)
- Consider user feedback: if users ask same questions, add FAQ

## Definition of Done
- README complete with all sections
- At least 3 screenshots included
- Architecture doc covers key design decisions
- All npm scripts documented
- Grammar and spelling checked
- Commit message: "docs: add user guide, architecture overview, and troubleshooting"
