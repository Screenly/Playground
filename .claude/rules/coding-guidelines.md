# Coding Guidelines

These guidelines apply regardless of programming language.

## Early Returns

Prefer returning early to reduce nesting. Handle edge cases and error conditions first, then proceed with the main logic.

**Good:**

```javascript
function processItems(items) {
  if (!items || items.length === 0) {
    return [];
  }

  // main logic here
  return items.map(transform);
}
```

**Avoid:**

```javascript
function processItems(items) {
  if (items && items.length > 0) {
    // main logic here
    return items.map(transform);
  } else {
    return [];
  }
}
```

## Flat Code

Keep code as flat as possible. Avoid deep nesting by using early returns, guard clauses, or extracting logic into separate functions.

**Good:**

```javascript
async function fetchData(url) {
  if (!url) return null;

  const response = await fetch(url);
  if (!response.ok) return null;

  return response.json();
}
```

**Avoid:**

```javascript
async function fetchData(url) {
  if (url) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  } else {
    return null;
  }
}
```
