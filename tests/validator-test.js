// Standalone validator tests — run with: node tests/validator-test.js
// Exercises checkViolations: triplets, equal-count, uniqueness.

const CELL_EMPTY = 0;
const CELL_RED = 1;
const CELL_BLUE = 2;

function getRowBalance(row) {
  const red = row.filter((v) => v === CELL_RED).length;
  const blue = row.filter((v) => v === CELL_BLUE).length;
  return { red, blue };
}

function getColumn(grid, c) {
  return grid.map((row) => row[c]);
}

function checkViolations(grid, size) {
  const violations = {
    rows: Array(size).fill(false),
    cols: Array(size).fill(false),
    cells: Array(size).fill(0).map(() => Array(size).fill(false)),
    reasons: [],
  };

  let hasViolations = false;
  const target = size / 2;

  const flagTriplet = (r, c, direction) => {
    violations.cells[r][c] = true;
    violations.cells[r][c - 1] = true;
    violations.cells[r][c - 2] = true;
    hasViolations = true;
    const color = grid[r][c] === CELL_RED ? 'red' : 'blue';
    violations.reasons.push({
      type: 'triplet',
      row: r,
      col: c,
      direction,
      color,
      start: c - 2,
      end: c,
    });
  };

  for (let r = 0; r < size; r++) {
    const row = grid[r];
    for (let c = 0; c < size; c++) {
      const value = row[c];
      if (c >= 2 && value !== CELL_EMPTY && value === row[c - 1] && value === row[c - 2]) {
        violations.rows[r] = true;
        flagTriplet(r, c, 'row');
      }

      if (r >= 2 && value !== CELL_EMPTY && value === grid[r - 1][c] && value === grid[r - 2][c]) {
        violations.cells[r][c] = true;
        violations.cells[r - 1][c] = true;
        violations.cells[r - 2][c] = true;
        violations.cols[c] = true;
        hasViolations = true;
        const color = grid[r][c] === CELL_RED ? 'red' : 'blue';
        violations.reasons.push({
          type: 'triplet',
          row: r,
          col: c,
          direction: 'column',
          color,
          start: r - 2,
          end: r,
        });
      }
    }

    const rowFull = row.every((cell) => cell !== CELL_EMPTY);
    if (rowFull) {
      const { red, blue } = getRowBalance(row);
      if (red !== target || blue !== target) {
        violations.rows[r] = true;
        hasViolations = true;
        violations.reasons.push({ type: 'count', row: r });
      }
      const rowKey = row.join('');
      for (let other = 0; other < r; other++) {
        if (grid[other].join('') === rowKey) {
          violations.rows[r] = true;
          violations.rows[other] = true;
          hasViolations = true;
          violations.reasons.push({ type: 'uniqueness', row: r, otherRow: other });
        }
      }
    }
  }

  for (let c = 0; c < size; c++) {
    const col = getColumn(grid, c);
    const colFull = col.every((cell) => cell !== CELL_EMPTY);
    if (colFull) {
      const red = col.filter((value) => value === CELL_RED).length;
      const blue = col.filter((value) => value === CELL_BLUE).length;
      if (red !== target || blue !== target) {
        violations.cols[c] = true;
        hasViolations = true;
        violations.reasons.push({ type: 'count', col: c });
      }
      const colKey = col.join('');
      for (let other = 0; other < c; other++) {
        if (getColumn(grid, other).join('') === colKey) {
          violations.cols[c] = true;
          violations.cols[other] = true;
          hasViolations = true;
          violations.reasons.push({ type: 'uniqueness', col: c, otherCol: other });
        }
      }
    }
  }

  return { violations, hasViolations };
}

// ---- test harness ----
let passed = 0;
let failed = 0;

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed += 1;
    console.log(`PASS: ${message}`);
  } else {
    failed += 1;
    console.log(`FAIL: ${message} (expected ${expected}, got ${actual})`);
  }
}

function assertTrue(value, message) {
  assertEqual(value, true, message);
}

function assertFalse(value, message) {
  assertEqual(value, false, message);
}

// Test 1: horizontal triplet flags the three cells and the row.
{
  // 4x4 grid, row 0 has three reds in a row.
  // Rows 1-3 are balanced, unique, and triplet-free.
  const grid = [
    [CELL_RED, CELL_RED, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_RED, CELL_BLUE],
  ];
  const { violations, hasViolations } = checkViolations(grid, 4);
  assertTrue(hasViolations, 'triplet: hasViolations is true');
  assertTrue(violations.rows[0], 'triplet: row 0 flagged');
  assertTrue(violations.cells[0][0], 'triplet: cell (0,0) flagged');
  assertTrue(violations.cells[0][1], 'triplet: cell (0,1) flagged');
  assertTrue(violations.cells[0][2], 'triplet: cell (0,2) flagged');
  assertFalse(violations.rows[1], 'triplet: clean row 1 not flagged');
  const tripletReasons = violations.reasons.filter((r) => r.type === 'triplet' && r.direction === 'row');
  assertEqual(tripletReasons.length, 1, 'triplet: exactly one horizontal triplet reason');
  assertEqual(tripletReasons[0].row, 0, 'triplet: reason row index');
  assertEqual(tripletReasons[0].start, 0, 'triplet: reason start column');
  assertEqual(tripletReasons[0].end, 2, 'triplet: reason end column');
}

// Test 2: full row with unequal counts is flagged.
{
  // 4x4, row 2 has 3 red / 1 blue -> count violation.
  const grid = [
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
    [CELL_RED, CELL_RED, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
  ];
  const { violations, hasViolations } = checkViolations(grid, 4);
  assertTrue(hasViolations, 'count: hasViolations is true');
  assertTrue(violations.rows[2], 'count: row 2 flagged for unequal counts');
  assertFalse(violations.rows[0], 'count: balanced row 0 not flagged');
  const countReasons = violations.reasons.filter((r) => r.type === 'count' && r.row === 2);
  assertEqual(countReasons.length, 1, 'count: exactly one count reason for row 2');
}

// Test 3: duplicate full rows are flagged.
{
  const grid = [
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
  ];
  const { violations, hasViolations } = checkViolations(grid, 4);
  assertTrue(hasViolations, 'uniqueness: hasViolations is true');
  assertTrue(violations.rows[0], 'uniqueness: row 0 flagged');
  assertTrue(violations.rows[1], 'uniqueness: row 1 flagged');
  assertTrue(violations.rows[2], 'uniqueness: row 2 flagged (duplicate pair with row 3)');
  assertTrue(violations.rows[3], 'uniqueness: row 3 flagged');
  const uniqReasons = violations.reasons.filter((r) => r.type === 'uniqueness' && r.row !== undefined);
  assertEqual(uniqReasons.length, 2, 'uniqueness: two row-uniqueness reasons');
  assertEqual(uniqReasons[0].otherRow, 0, 'uniqueness: first reason points at earlier row');
}

// Test 4: duplicate full columns are flagged.
{
  const grid = [
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
  ];
  const { violations, hasViolations } = checkViolations(grid, 4);
  assertTrue(hasViolations, 'col uniqueness: hasViolations is true');
  assertTrue(violations.cols[0], 'col uniqueness: column 0 flagged');
  assertTrue(violations.cols[2], 'col uniqueness: column 2 flagged');
  const uniqReasons = violations.reasons.filter((r) => r.type === 'uniqueness' && r.col !== undefined);
  assertEqual(uniqReasons.length, 2, 'col uniqueness: two column-uniqueness reasons');
}

// Test 5: valid solved grid has no violations.
{
  const grid = [
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
    [CELL_RED, CELL_BLUE, CELL_BLUE, CELL_RED],
    [CELL_BLUE, CELL_RED, CELL_RED, CELL_BLUE],
  ];
  const { violations, hasViolations } = checkViolations(grid, 4);
  assertFalse(hasViolations, 'valid: hasViolations is false');
  assertTrue(violations.rows.every((v) => !v), 'valid: no row flags');
  assertTrue(violations.cols.every((v) => !v), 'valid: no col flags');
  assertTrue(violations.cells.every((row) => row.every((v) => !v)), 'valid: no cell flags');
  assertEqual(violations.reasons.length, 0, 'valid: no reasons recorded');
}

// Test 6: partial (incomplete) rows are exempt from count/uniqueness checks.
{
  const grid = [
    [CELL_RED, CELL_RED, CELL_RED, CELL_EMPTY],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
    [CELL_RED, CELL_BLUE, CELL_RED, CELL_BLUE],
    [CELL_BLUE, CELL_RED, CELL_BLUE, CELL_RED],
  ];
  const { violations, hasViolations } = checkViolations(grid, 4);
  assertTrue(hasViolations, 'partial: still flags the triplet');
  assertFalse(violations.rows[0] && !violations.cells[0][0] && !violations.cells[0][1] && !violations.cells[0][2],
    'partial: row 0 triplet cells are flagged');
  const countReasons = violations.reasons.filter((r) => r.type === 'count' && r.row === 0);
  assertEqual(countReasons.length, 0, 'partial: no count reason for incomplete row');
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}
