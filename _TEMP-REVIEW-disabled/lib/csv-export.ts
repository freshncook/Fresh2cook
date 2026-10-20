export function exportToCSV(
  filename: string,
  data: any[]
) {
  if (!data || data.length === 0) {
    alert("No data available");
    return;
  }

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((field) => {
          const value = row[field];

          if (
            value === null ||
            value === undefined
          ) {
            return "";
          }

          return `"${String(value).replace(
            /"/g,
            '""'
          )}"`;
        })
        .join(",")
    ),
  ];

  const csvString = csvRows.join("\n");

  const blob = new Blob(
    [csvString],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const link =
    document.createElement("a");

  const url =
    URL.createObjectURL(blob);

  link.href = url;

  link.download = `${filename}.csv`;

  link.style.display = "none";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportProductsCSV(
  products: any[]
) {
  exportToCSV(
    "products-export",
    products
  );
}

export function exportOrdersCSV(
  orders: any[]
) {
  exportToCSV(
    "orders-export",
    orders
  );
}

export function exportLeadsCSV(
  leads: any[]
) {
  exportToCSV(
    "leads-export",
    leads
  );
}

export function exportTasksCSV(
  tasks: any[]
) {
  exportToCSV(
    "tasks-export",
    tasks
  );
}





