package com.ragqa.service;

import com.ragqa.entity.Repository;
import com.ragqa.entity.User;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * Bulk Q&A: takes an uploaded spreadsheet with a "Question" column, runs each
 * question through the same RAG pipeline used by the "Ask" tab, and writes
 * the answers into an "Answer" column (creating it if it isn't already there)
 * — returning the finished workbook as bytes ready for download.
 */
@Service
public class BulkQaService {

    private static final Logger log = LoggerFactory.getLogger(BulkQaService.class);
    private static final int MAX_ROWS = 200; // keep runs bounded — 200 questions is already a lot of API calls

    private final RagService ragService;

    public BulkQaService(RagService ragService) {
        this.ragService = ragService;
    }

    public byte[] processWorkbook(InputStream inputStream, Repository repository, User user) {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() == 0) {
                throw new IllegalArgumentException("The spreadsheet is empty.");
            }

            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                throw new IllegalArgumentException("Could not find a header row in the spreadsheet.");
            }

            int questionCol = findColumn(headerRow, "question");
            if (questionCol == -1) {
                throw new IllegalArgumentException("Could not find a \"Question\" column. " +
                        "Make sure the first row has a header called \"Question\".");
            }

            int answerCol = findColumn(headerRow, "answer");
            if (answerCol == -1) {
                answerCol = headerRow.getLastCellNum() < 0 ? 0 : headerRow.getLastCellNum();
                Cell answerHeader = headerRow.createCell(answerCol);
                answerHeader.setCellValue("Answer");
            }

            CellStyle wrapStyle = workbook.createCellStyle();
            wrapStyle.setWrapText(true);

            int lastRow = sheet.getLastRowNum();
            int processed = 0;
            for (int r = sheet.getFirstRowNum() + 1; r <= lastRow; r++) {
                if (processed >= MAX_ROWS) break;
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Cell questionCell = row.getCell(questionCol);
                String question = cellToString(questionCell);
                if (question.isBlank()) continue;

                String answer;
                try {
                    answer = ragService.ask(repository, user, question, false).getAnswer();
                } catch (Exception e) {
                    log.error("Bulk Q&A failed on row {}", r, e);
                    answer = "Error: could not generate an answer for this question.";
                }

                Cell answerCell = row.createCell(answerCol);
                answerCell.setCellValue(answer);
                answerCell.setCellStyle(wrapStyle);
                processed++;
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Could not process the spreadsheet. Make sure it's a valid .xlsx or .xls file.", e);
        }
    }

    private int findColumn(Row headerRow, String targetLower) {
        for (Cell cell : headerRow) {
            if (cellToString(cell).trim().equalsIgnoreCase(targetLower)) {
                return cell.getColumnIndex();
            }
        }
        return -1;
    }

    private String cellToString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }
}
