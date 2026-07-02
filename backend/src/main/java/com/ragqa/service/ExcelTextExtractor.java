package com.ragqa.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Converts an Excel workbook (.xlsx/.xls) into plain text so it can flow
 * through the same chunking + embedding pipeline as .txt/.md/.csv files.
 * Each row becomes one line, formatted as "Header: value | Header: value",
 * using the first row of each sheet as column headers. This works well both
 * for FAQ-style sheets (Question/Answer columns) and general tabular data.
 */
@Service
public class ExcelTextExtractor {

    public String extractText(InputStream inputStream) {
        StringBuilder text = new StringBuilder();
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                if (sheet.getPhysicalNumberOfRows() == 0) continue;

                text.append("Sheet: ").append(sheet.getSheetName()).append("\n\n");

                List<String> headers = new ArrayList<>();
                Row headerRow = sheet.getRow(sheet.getFirstRowNum());
                if (headerRow != null) {
                    for (Cell cell : headerRow) {
                        headers.add(cellToString(cell));
                    }
                }

                for (int r = sheet.getFirstRowNum() + 1; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row == null) continue;

                    List<String> parts = new ArrayList<>();
                    for (int c = 0; c < row.getLastCellNum(); c++) {
                        Cell cell = row.getCell(c);
                        String value = cellToString(cell);
                        if (value.isBlank()) continue;
                        String label = (c < headers.size() && !headers.get(c).isBlank())
                                ? headers.get(c) : "Column " + (c + 1);
                        parts.add(label + ": " + value);
                    }
                    if (!parts.isEmpty()) {
                        text.append(String.join(" | ", parts)).append("\n");
                    }
                }
                text.append("\n");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not read the Excel file. Make sure it's a valid .xlsx or .xls file.", e);
        }
        return text.toString();
    }

    private String cellToString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toString()
                    : stripTrailingZero(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private String stripTrailingZero(double value) {
        if (value == Math.floor(value) && !Double.isInfinite(value)) {
            return String.valueOf((long) value);
        }
        return String.valueOf(value);
    }
}
