import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiCreditCard,
  FiDownload,
  FiUser,
} from "react-icons/fi";

export const STEPS = [
  { label: "Quote Requested", icon: FiUploadCloud },
  { label: "Receive Quotation", icon: FiFileText },
  { label: "Accept or Reject Quote", icon: FiCheckCircle },
  { label: "Add credit hrs or upload PO", icon: FiCreditCard },
  { label: "Work in Progress", icon: FiUser },
  { label: "Receive Files", icon: FiDownload },
];

export const SOFTWARE_OPTIONS = {
  "": { name: "Select software", versions: [] },
  solidworks: {
    name: "SolidWorks - .sldprt",
    versions: [
      "2026", "2025", "2024", "2023", "2022", "2021", "2020", 
      "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011"
    ],
  },
 creo: {
    name: "Creo- .prt",
    versions: ["12.0", "11.0", "10.0", "9.0", "8.0", "7.0", "6.0", "5.0"],
  },
  inventor: {
    name: "Inventor - .lam,lpt",
    versions: ["2025", "2024", "2023", "2022", "2021", "2020", "2019"],
  },
  nx: {
    name: "Siemens NX - .prt",
    versions: ["NX 10", "NX 11", "NX 12", "HIGHER VERSIONS"],
  },
  catia: { name: "CATIA - .catpart", versions: ["V5 ", "HIGHER VERSIONS"] },
};

export const ALLOWED_INFO_FILE_EXTENSIONS = [
  "xls", "pdf", "ppt", "jpeg", "jpg", "png", "tif", "mp"
];