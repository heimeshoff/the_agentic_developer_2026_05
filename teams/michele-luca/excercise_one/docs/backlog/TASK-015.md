# TASK-015: Data Export and Import

## Metadata
- **Track**: Polish
- **Priority**: P2 (Medium - data portability)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-005
- **Blocks**: None
- **Status**: Blocked by TASK-005

## Objective
Implement export and import functionality to allow users to back up their data and move it between devices. Export as JSON file; import validates and merges data. This mitigates localStorage data loss risk.

## Acceptance Criteria
- [ ] Export button downloads JSON file with all data (accounts, categories, transactions, budgets, settings)
- [ ] Exported filename includes timestamp: `budgetapp-export-2026-05-26.json`
- [ ] Import button accepts JSON file, validates schema, and loads data
- [ ] Import options: replace all data vs. merge (add new, skip duplicates)
- [ ] Validation: ensure imported data matches expected schema (version check)
- [ ] Error handling: display clear error if import fails (invalid JSON, wrong schema)
- [ ] Backup prompt: warn before replacing data, suggest exporting first

## Technical Notes
- Export: serialize entire app state to JSON, trigger browser download
- Import: use `<input type="file" accept=".json">` to select file, read with FileReader API
- Schema validation: check for required fields, correct types
- Version compatibility: include `version: 1` in export, reject incompatible versions
- Merge strategy: use IDs to detect duplicates, skip or prompt user

## Implementation Hints
```typescript
// Export function
function exportData(data: AppData) {
  const exportObject = {
    version: 1,
    exportDate: new Date().toISOString(),
    data,
  };
  
  const jsonString = JSON.stringify(exportObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `budgetapp-export-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Import function
async function importData(file: File): Promise<AppData> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  
  if (parsed.version !== 1) {
    throw new Error('Incompatible export version');
  }
  
  validateSchema(parsed.data); // Throws if invalid
  return parsed.data;
}
```

## Risks & Considerations
- **Low risk**: Standard import/export pattern
- Large datasets: JSON may be large (100+ KB), consider compression (gzip) if needed
- Privacy: warn users not to share exports publicly (contains financial data)
- Merge conflicts: if IDs collide, decide strategy (overwrite, skip, prompt)
- Future: cloud sync would obsolete manual export/import (but out of scope)

## Definition of Done
- Export downloads valid JSON file
- Import loads and validates file, updates UI
- Error messages clear and actionable
- Merge mode prevents duplicates
- Documentation includes import/export usage instructions
- Commit message: "feat: add JSON export and import with schema validation"
