// src/FileImport.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import Modal from "react-modal";

// Set the app element for accessibility
Modal.setAppElement("#root"); // Ensure to set the app element for accessibility

const FileImport = () => {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [data, setData] = useState([]); // Change to 2D array for sheets
  const [errors, setErrors] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      selectedFile.size <= 2 * 1024 * 1024
    ) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetNames = workbook.SheetNames;
        setSheets(sheetNames);
        const sheetData = sheetNames.map((sheet) =>
          XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
        );
        setData(sheetData);
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      alert("Please upload a valid .xlsx file with size less than 2MB.");
    }
  };

  const handleSheetChange = (event) => {
    const sheetIndex = parseInt(event.target.value);
    setSelectedSheet(sheetIndex);
  };

  const handleDeleteRow = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this row?"
    );
    if (confirmDelete && selectedSheet !== null) {
      const newData = [...data];
      newData[selectedSheet].splice(index, 1);
      setData(newData);
    }
  };

  const handleImport = async () => {
    if (selectedSheet === null) {
      alert("Please select a sheet to import data.");
      return;
    }

    const validRows = data[selectedSheet].filter(
      (row) => row.Name && row.Amount && row.Date
    );

    const response = await fetch("http://localhost:5000/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validRows),
    });

    if (response.ok) {
      alert("Data imported successfully!");
      // Optionally, reset the state after successful import
      setData([]);
      setSheets([]);
      setFile(null);
      setSelectedSheet(null);
    } else {
      const errorData = await response.json();
      setErrors(errorData.errors);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors([]);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">File Import</h1>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="mb-4 border border-gray-300 p-2 rounded"
      />
      <select
        onChange={handleSheetChange}
        className="mb-4 border border-gray-300 p-2 rounded"
      >
        <option value="">Select a sheet</option>
        {sheets.map((sheet, index) => (
          <option key={index} value={index}>
            {sheet}
          </option>
        ))}
      </select>
      {selectedSheet !== null && data[selectedSheet] && (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              {Object.keys(data[selectedSheet][0]).map((key, index) => (
                <th key={index} className="border border-gray-300 p-2">
                  {key}
                </th>
              ))}
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data[selectedSheet].map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 p-2">
                    {value}
                  </td>
                ))}
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        onClick={handleImport}
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
      >
        Import
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Validation Errors"
      >
        <h2>Validation Errors</h2>
        <ul>
          {errors.map((error, index) => (
            <li
              key={index}
            >{`Sheet: ${error.sheet}, Row: ${error.row}, Error: ${error.message}`}</li>
          ))}
        </ul>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default FileImport;
