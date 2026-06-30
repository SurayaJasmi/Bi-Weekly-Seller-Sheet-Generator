function generateNewReportingCycle() {
  const masterSS = SpreadsheetApp.getActiveSpreadsheet();
  const masterListSheet = masterSS.getSheetByName('Master List');

  if (!masterListSheet) {
    throw new Error("Master List sheet not found.");
  }

  const lastRow = masterListSheet.getLastRow();
  if (lastRow < 2) return;

  const reportList = masterListSheet
    .getRange(2, 1, lastRow - 1, 2)
    .getValues()
    .filter(([_, spreadsheetUrl]) =>
      spreadsheetUrl &&
      spreadsheetUrl.toString().includes('docs.google.com/spreadsheets/d/')
    );

  // ===== DATE LOGIC =====
  const today = new Date();
  const cycleDate = new Date(today);
  let period;

  if (today.getDate() <= 14) {
    period = 'W3 W4';
    cycleDate.setMonth(cycleDate.getMonth() - 1);
  } else {
    period = 'W1 W2';
  }

  const month = cycleDate.toLocaleString('en-US', { month: 'short' });

  const reportSheetName = `${period} ${month}`;
  const rawSheetName = `${period} ${month} RAW`;

  const placeholderRows = 4;

  // ===== PROCESS FILES =====
  reportList.forEach(([reportName, spreadsheetUrl]) => {

    const spreadsheet = openSpreadsheet(spreadsheetUrl);
    if (!spreadsheet) return;

    try {

      const previousReport = findLatestReportSheet(spreadsheet);
      const previousRaw = findLatestRawSheet(spreadsheet);

      if (!previousReport || !previousRaw) {
        Logger.log(`${reportName}: Missing previous reporting cycle`);
        return;
      }

      // ===== REPORT SHEET =====
      const newReportSheet = previousReport
        .copyTo(spreadsheet)
        .setName(reportSheetName);

      SpreadsheetApp.flush();

      if (newReportSheet.getLastRow() > 4) {
        newReportSheet.deleteRows(5, newReportSheet.getLastRow() - 4);
      }

      spreadsheet.setActiveSheet(newReportSheet);
      spreadsheet.moveActiveSheet(1);

      // ===== RAW SHEET =====
      const newRawSheet = previousRaw
        .copyTo(spreadsheet)
        .setName(rawSheetName);

      SpreadsheetApp.flush();

      const lastColumn = newRawSheet.getLastColumn();

      if (newRawSheet.getLastRow() > 1) {
        newRawSheet.deleteRows(2, newRawSheet.getLastRow() - 1);
      }

      const placeholderData = Array.from(
        { length: placeholderRows },
        () => Array(lastColumn).fill('NULL')
      );

      newRawSheet
        .getRange(2, 1, placeholderRows, lastColumn)
        .setValues(placeholderData);

      newRawSheet
        .getRange(2, 1, placeholderRows, lastColumn)
        .clearFormat();

      spreadsheet.setActiveSheet(newRawSheet);
      spreadsheet.moveActiveSheet(newReportSheet.getIndex() + 1);

      Logger.log(`${reportName}: Reporting cycle created`);

    } catch (error) {
      Logger.log(`${reportName}: ${error.message}`);
    }

  });
}

/* ================= HELPERS ================= */

function openSpreadsheet(url) {
  try {
    return SpreadsheetApp.openByUrl(url.split('/edit')[0] + '/edit');
  } catch {
    return null;
  }
}

function parseSheetMetadata(sheetName) {
  const match = sheetName.trim().match(/W([1-4])\s*W([1-4])\s*([A-Za-z]{3})/);
  if (!match) return null;

  return {
    firstWeek: Number(match[1]),
    secondWeek: Number(match[2]),
    month: new Date(`${match[3]} 1, 2000`).getMonth()
  };
}

function findLatestReportSheet(spreadsheet) {
  const sheets = spreadsheet.getSheets()
    .filter(sheet => !/RAW$/i.test(sheet.getName()))
    .map(sheet => {
      const meta = parseSheetMetadata(sheet.getName());
      return meta ? { sheet, ...meta } : null;
    })
    .filter(Boolean);

  if (!sheets.length) return null;

  sheets.sort((a, b) =>
    a.month - b.month ||
    a.firstWeek - b.firstWeek ||
    a.secondWeek - b.secondWeek
  );

  return sheets[sheets.length - 1].sheet;
}

function findLatestRawSheet(spreadsheet) {
  const sheets = spreadsheet.getSheets()
    .filter(sheet => /RAW$/i.test(sheet.getName()))
    .map(sheet => {
      const meta = parseSheetMetadata(sheet.getName());
      return meta ? { sheet, ...meta } : null;
    })
    .filter(Boolean);

  if (!sheets.length) return null;

  sheets.sort((a, b) =>
    a.month - b.month ||
    a.firstWeek - b.firstWeek ||
    a.secondWeek - b.secondWeek
  );

  return sheets[sheets.length - 1].sheet;
}
