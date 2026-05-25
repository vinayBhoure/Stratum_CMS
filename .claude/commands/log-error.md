Log a resolved error to the Stratum CMS error log for future reference.

If `$ARGUMENTS` is provided, use it as the error description to start with.

**Gather the following information** (ask the developer if not clear from context):
- What was the error? (error message or symptom)
- What caused it? (root cause)
- How was it fixed? (the actual fix applied)
- What files were affected?
- How to prevent it in the future?

**Append to `/docs/tracking/ERRORS.md`** in this exact format:

```
---

#### [YYYY-MM-DD] [Category] — Brief title
**Error:** One-line description of the error or symptom
**Cause:** One-line root cause
**Fix:** One-line description of the fix applied
**Files:** Comma-separated list of affected file paths
**Prevention:** One-line note on how to avoid this in the future
```

Where `Category` is one of: `Type Error`, `Runtime Error`, `Build Error`, `Migration Error`, `Network Error`, `Validation Error`, `Auth Error`, `Database Error`, `Upload Error`, `Config Error`

After appending, confirm the entry was added and show it to the developer.
