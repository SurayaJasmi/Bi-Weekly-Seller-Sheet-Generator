# Automated Reporting Cycle Generator (Google Apps Script)

A Google Apps Script automation tool that generates new reporting cycles across multiple Google Spreadsheets. It copies the latest reporting structure, resets data, and prepares the next cycle automatically.

---

## Features

- Automatically generates new reporting cycles
- Copies latest Report and RAW sheets
- Resets data for new cycle
- Maintains consistent naming and structure
- Processes multiple spreadsheets from a Master List

---

## Reporting Cycle Logic

- 1st–14th → W3 W4 (Previous Month)
- 15th–End → W1 W2 (Current Month)

---

## How It Works

1. Reads Master List (supplier name + spreadsheet URL)
2. Opens each spreadsheet
3. Finds latest report and RAW sheets
4. Copies and renames them for new cycle
5. Clears and resets data
6. Reorders sheets

---

## Setup

1. Open Google Sheets → Extensions → Apps Script  
2. Paste `Code.gs`  
3. Ensure a sheet called `Master List` exists  
4. Add supplier names + spreadsheet URLs  
5. Run `generateNewReportingCycle()`  

---

## Notes

- Sheet names must follow: `W1 W2 Jan`
- RAW sheets must end with `RAW`
- At least one previous cycle must exist
