# Custom DataTable Package

This package provides a customizable DataTable implementation with additional features like filtering, exporting, pagination, and search functionality. It is built on top of the popular [DataTables](https://datatables.net/) jQuery plugin.

## Features

- Custom filtering logic
- Export options (CSV, Excel, PDF, Copy, Print)
- Pagination control
- Search functionality with state saving
- Dynamic length menu
- Custom draw callbacks

## Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/ChandraHemant/datatable-customizer.git
    cd datatable-customizer
    ```

2. **Install Dependencies:**

    Make sure you have jQuery and DataTables installed in your project. You can include them via CDN:

    ```html
    <link rel="stylesheet" href="https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.0.1/js/dataTables.buttons.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.0.1/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.0.1/js/buttons.print.min.js"></script>

     <!-- SumoSelect CSS and JS -->
    <link rel="stylesheet" href="https://github.com/ChandraHemant/datatable-customizer/blob/main/assets/sumoselect.css">
    <script src="https://github.com/ChandraHemant/datatable-customizer/blob/main/assets/jquery.sumoselect.min.js"></script>
    <script src="https://github.com/ChandraHemant/datatable-customizer/blob/main/assets/jquery.sumoselect.js"></script>
    ```

3. **Include Your Script:**

    Add your custom JavaScript file to your HTML:

    ```html
    <script src="path/to/your/datatable-customizer.js"></script>
    ```

## Usage

1. **Initialize DataTable:**

    You can initialize the DataTable by calling the `datatable` function with the necessary options:

    ```javascript
    $(document).ready(function () {
        datatable({
            tableId: "yourTableId",  // The ID of your table element
            url: "/your-endpoint",    // URL for server-side data processing
            dataLength: '[data-length]',  // Selector for length menu element
            dataSearch: '[data-search]',  // Selector for search input element
            dataFilter: '[data-filter]',  // Selector for filter elements
            dataExport: '[data-export]',  // Selector for export buttons
            dataShowEntries: '[data-show-entries]',  // Selector for showing entries
            dataPagination: '[data-pagination]',  // Selector for pagination container
            dataStateSave: false,  // Save state (optional)
            drawCallback: function(settings) {
                console.log('DataTable Drawn');
                $('[data-bs-toggle="popover"]').popover('dispose');
                $('[data-bs-toggle="popover"]').popover({
                    trigger: 'hover'
                });
            }
        });
    });
    ```

2. **HTML Structure:**

    Ensure your HTML structure includes the necessary elements:

    ```html
    <table id="yourTableId" class="display" style="width:100%">
        <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
                <!-- Add more columns as needed -->
            </tr>
        </thead>
        <tbody>
            <!-- Table data will be loaded via AJAX -->
        </tbody>
    </table>

    <!-- Elements for length, search, filter, export, show entries, and pagination -->
    <select data-length>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="-1">All</option>
    </select>
    <input type="text" data-search placeholder="Search here...">
    <!-- Add filter elements as needed -->
    <button data-export="pdf">Export PDF</button>
    <button data-export="csv">Export CSV</button>
    <div data-show-entries></div>
    <ul data-pagination></ul>
    ```

3. **Customizing Draw Callback:**

    If you need to customize the table's behavior after each draw, modify the `drawCallback` function passed to the `datatable` function:

    ```javascript
    drawCallback: function(settings) {
        console.log('Table redrawn with settings:', settings);
        // Add custom actions here
    }
    ```

## License

This project is licensed under the MIT License.
