import React, { useState } from "react";
import { Button } from "antd";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../css/Report.module.css";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const Report = () => {
  const [expandedPanels, setExpandedPanels] = useState([]);
  const [expandedSubPanels, setExpandedSubPanels] = useState([]);
  const [companyName, setCompanyName] = useState("Company Name");
  const [isEditing, setIsEditing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const data = [
    {
      title: "Revenue",
      details: [
        {
          subTitle: "Product Sales",
          amount: 3000,
          subDetails: [
            { subSubTitle: "Online Sales", amount: 2000 },
            { subSubTitle: "In-Store Sales", amount: 1000 },
          ],
        },
        { subTitle: "Service Income", amount: 2000, subDetails: [] },
      ],
      total: 5000,
    },
    {
      title: "Expenses",
      details: [
        { subTitle: "Rent", amount: 1000, subDetails: [] },
        { subTitle: "Utilities", amount: 500, subDetails: [] },
        {
          subTitle: "Salaries",
          amount: 1500,
          subDetails: [
            { subSubTitle: "Full-time", amount: 1200 },
            { subSubTitle: "Part-time", amount: 300 },
          ],
        },
        { subTitle: "Office Supplies", amount: 200, subDetails: [] },
      ],
      total: 3200,
    },
    {
      title: "Net Income",
      details: [],
      total: 1800,
    },
  ];

  const exportToExcel = () => {
    const formattedData = [];

    // Add title row with dynamic company name
    formattedData.push([companyName, "", "", ""]); // Company Name
    formattedData.push(["Accounting Report", "", "", ""]); // Report Title
    formattedData.push(["January - December 2024", "", "", ""]); // Date range
    formattedData.push(["", "", "", ""]); // Empty row for spacing
    formattedData.push(["Category", "Subcategory", "Details", "Total"]); // Column headers

    data.forEach((item) => {
      // Add the main category (e.g., Revenue)
      formattedData.push([item.title, "", "", item.total]); // Column A: Title, Column D: Total

      item.details.forEach((detail) => {
        // Add the detail with subdetails
        formattedData.push([detail.subTitle, "", "", detail.amount]); // Column A: SubTitle, Column D: Amount

        detail.subDetails.forEach((subDetail) => {
          // Add the subdetail
          formattedData.push(["", subDetail.subSubTitle, "", subDetail.amount]); // Column B: SubSubTitle, Column D: Amount
        });
      });
    });

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(formattedData);

    // Set column widths for better visibility
    ws["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };

  const exportToPDF = () => {
    setIsExportingPDF(true);
    setExpandedPanels(data.map((_, idx) => true));

    const reportElement = document.getElementById("report");
    reportElement.classList.add("hiding-buttons");

    html2canvas(reportElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        floatPrecision: 16,
      });

      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("report.pdf");
      reportElement.classList.remove("hiding-buttons");
      setExpandedPanels([]);
      setIsExportingPDF(false);
    });
  };

  const styles = `
    .hiding-buttons button {
        display: none; /* Hide buttons when exporting */
    }
    `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  const togglePanel = (index) => {
    setExpandedPanels((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSubPanel = (panelIndex, subPanelIndex) => {
    const key = `${panelIndex}-${subPanelIndex}`;
    setExpandedSubPanels((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div
      id="report"
      className="max-w-3xl mx-auto mt-5 p-5 border border-gray-300 rounded bg-white"
    >
      {/* Buttons for exporting */}
      {!isExportingPDF && (
        <>
          <Button onClick={exportToExcel} className="m-2">
            Export to Excel
          </Button>
          <Button onClick={exportToPDF} className="m-2">
            Export to PDF
          </Button>
        </>
      )}

      {/* Header Section */}
      <div className="text-center">
        {isEditing ? (
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="border p-2 rounded"
          />
        ) : (
          <span className="text-2xl">{companyName}</span>
        )}
        <Button
          onClick={handleEditClick}
          className="border-none bg-transparent cursor-pointer text-lg absolute"
        >
          {isEditing ? <CheckOutlined /> : <EditOutlined />}
        </Button>
        <p className="text-center mb-8">
          <b className="text-sm">ACCOUNTING REPORT</b> <br />
          January - December 2024
        </p>
      </div>
      <hr className="my-2" />
      <p className="text-right font-bold text-sm mr-2 mb-4 mt-3">TOTAL</p>
      <hr />

      {/* Main Data Section */}
      {data.map((item, index) => (
        <div key={index}>
          <div
            className="flex items-center cursor-pointer p-2"
            onClick={() => togglePanel(index)}
          >
            <span className="mt-1">
              {expandedPanels.includes(index) ? (
                <CaretUpOutlined />
              ) : (
                <CaretDownOutlined />
              )}
            </span>
            <span className="ml-2">{item.title}</span>
            {!expandedPanels.includes(index) && (
              <span className="ml-auto font-bold">${item.total}</span>
            )}
          </div>

          {expandedPanels.includes(index) && (
            <div className="ml-5">
              {item.details.map((detail, idx) => (
                <div key={idx}>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleSubPanel(index, idx)}
                  >
                    {detail.subDetails.length > 0 ? (
                      <span className="mr-2">
                        {expandedSubPanels.includes(`${index}-${idx}`) ? (
                          <CaretUpOutlined />
                        ) : (
                          <CaretDownOutlined />
                        )}
                      </span>
                    ) : (
                      <span
                        className="mr-2"
                        style={{ visibility: "hidden", width: "18px" }}
                      ></span>
                    )}
                    <div className="flex justify-between w-full mb-2">
                      <p className="flex-grow">{detail.subTitle}:</p>
                      <span className="ml-2 mr-2">{detail.amount}</span>
                    </div>
                  </div>

                  {expandedSubPanels.includes(`${index}-${idx}`) &&
                    detail.subDetails.map((subDetail, subIdx) => (
                      <div
                        key={subIdx}
                        className="ml-10 mr-2 mb-2 mt-0.5 flex justify-between text-gray-700"
                      >
                        <p className="mr-2">{subDetail.subSubTitle}:</p>
                        <span>{subDetail.amount}</span>
                      </div>
                    ))}
                </div>
              ))}
              <hr />
              <div className="flex justify-between px-2 mt-2 mb-4 font-bold total-section">
                <p>Total Income:</p>
                <span>${item.total}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Report;
