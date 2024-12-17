/**
 * Javascript Dynamic Datatable Script
 *
 * @subpackage  Custom Script
 * @category    Javascript
 * @author      Hemant Chandra
 */

// Onload Table call

/**
 * Initializes a dynamic datatable with various features like filtering, exporting, pagination, and custom controls.
 *
 * @param {object} params - Configuration object with various customization options:
 *  @param {string} tableId - ID of the HTML table element to initialize as a DataTable.
 *  @param {string} url - URL to fetch data for server-side processing.
 *  @param {string} dataLength - Selector for custom length menu.
 *  @param {string} dataSearch - Selector for custom search input field.
 *  @param {string} dataFilter - Selector for filter elements.
 *  @param {string} dataExport - Selector for export buttons.
 *  @param {string} dataShowEntries - Selector for displaying entry count message.
 *  @param {string} dataPagination - Selector for custom pagination controls.
 *  @param {string} dataDateFilter - Selector for date filters.
 *  @param {boolean} [dataStateSave=false] - Save table state (pagination, search, filters).
 *  @param {function} drawCallback - Custom callback executed after each redraw of the table.
 */
function datatable({
    tableId,
    url,
    dataLength,
    dataSearch,
    dataFilter,
    dataExport,
    dataShowEntries,
    dataPagination,
    dataDateFilter,
    dataStateSave = false,
    drawCallback
}) {
    // Initialize the DataTable
    var dataTable = $('#' + tableId).DataTable({
        dom: '<"col-sm-12"rt>', // Define the layout of the DataTable (only table content visible)
        processing: true, // Display a loading indicator while data is being processed
        serverSide: true, // Enable server-side processing
        stateSave: dataStateSave, // Optionally save the table state locally (e.g., filters, pagination)
        lengthMenu: [5, 10, 25, 50, 100, 500, 1000], // Options for rows per page
        pageLength: 5, // Default number of rows displayed per page
        order: [[0, 'desc']], // Default sorting: first column in descending order
        ajax: url, // URL for fetching data via AJAX
        rowCallback: function (row, data, index) {
            // Callback function for customizing each row
            var pageInfo = dataTable.page.info(); // Retrieve pagination info
            var rowNumber = pageInfo.start + index + 1; // Calculate row number based on pagination
            $('td:eq(0)', row).html(rowNumber); // Assuming first column is for row numbers
            $('td', row).css('font-size', '12px'); // Set font size for table cells
        },
        buttons: [
            { extend: 'csv', text: 'CSV' }, // Export table data as CSV
            { extend: 'excel', text: 'Excel' }, // Export table data as Excel
            { extend: 'pdf', text: 'PDF' }, // Export table data as PDF
            { extend: 'copy', text: 'Copy' }, // Copy table data to clipboard
            { extend: 'print', text: 'Print' } // Print the table
        ],
        language: {
            searchPlaceholder: "Search here...", // Placeholder text for the search box
            processing: '<div id="lottieAnimationContainer"><iframe src="https://lottie.host/embed/fad75f9c-37b5-4957-9393-fd4894af42df/HaHmy3Jrsi.json"></iframe></div>' // Custom loading animation
        },
        drawCallback: drawCallback // Optional callback function executed after every table redraw
    });

    // Apply custom filters to the table
    applyCustomFilters(dataTable, dataFilter);

    // Apply custom export functionality to the table
    applyCustomExport(dataTable, dataExport);

    // Apply custom length menu functionality to the table
    applyCustomLengthMenu(dataTable, dataLength);

    // Apply custom search functionality to the table
    applyCustomSearchFilter(dataTable, dataSearch);

    // Apply custom date filtering to the table
    applyCustomDateFilter(dataTable, dataDateFilter);

    // Update the "show entries" message on each table redraw
    dataTable.on('draw', function () {
        applyCustomShowEntries(dataTable, dataShowEntries);
    });

    // Add custom pagination controls on each table redraw
    dataTable.on('draw', function () {
        applyCustomPagination(dataTable, dataPagination);
    });

    // Handle click events on custom pagination controls
    $(document).on('click', '[data-pagination] li', function (e) {
        e.preventDefault(); // Prevent default link behavior
        if ($(this).hasClass('disabled') || $(this).hasClass('active')) return; // Ignore disabled or active items

        var pageNum = $(this).data('page'); // Get the selected page number
        dataTable.page(pageNum).draw('page'); // Navigate to the selected page
    });

    // Match the width of dropdown menus to their associated buttons
    var buttonWidth = $('#defaultDropdown').outerWidth();
    $('.dropdown-menu').css('width', buttonWidth + 'px');
}

/**
 * Apply custom filter functionality to the DataTable.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} filterSelector - Selector for the filter elements.
 */
function applyCustomFilters(table, filterSelector) {
    $(document).on('change', filterSelector, function () {
        // Logic to apply filters and reload the table
        const newUrl = new URL(table.ajax.url());
        const filterValues = {}; // Object to store filter values

        // Iterate through all filter elements
        $(filterSelector).each(function () {
            const filterName = $(this).attr('id'); // Use element ID as parameter name
            const filterValue = $(this).val(); // Get filter value
            if (filterValue) {
                newUrl.searchParams.set(filterName, filterValue); // Add to URL
                filterValues[filterName] = filterValue; // Add to object
            } else {
                newUrl.searchParams.delete(filterName); // Remove from URL
                delete filterValues[filterName]; // Remove from object
            }
        });

        // Save filter values to localStorage
        localStorage.setItem('filterValues', JSON.stringify(filterValues));

        // Reload the table with the new URL
        table.ajax.url(newUrl.toString()).load();
    });

    // Load filters from localStorage on page load (if saved)
    const savedFilterValues = JSON.parse(localStorage.getItem('filterValues'));
    if (savedFilterValues) {
        $(filterSelector).each(function () {
            const filterName = $(this).attr('id');
            if (savedFilterValues[filterName]) {
                $(this).val(savedFilterValues[filterName]);
                $(this).change(); // Trigger the change event
            }
        });
    }
}

/**
 * Applies custom export functionality to the DataTable.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} exportSelector - Selector for the export buttons.
 */
function applyCustomExport(table, exportSelector) {
    console.log('Applying custom export functionality...');
    $(document).on('click', exportSelector, function (e) {
        e.preventDefault(); // Prevent the default action of the export button

        var exportType = $(this).data('export'); // Get the type of export (e.g., csv, excel, pdf)
        console.log('Export button clicked:', exportType);

        var buttonIndex;
        // Map the export type to the button index in the DataTable
        switch (exportType) {
            case 'csv': buttonIndex = 0; break;
            case 'excel': buttonIndex = 1; break;
            case 'pdf': buttonIndex = 2; break;
            case 'copy': buttonIndex = 3; break;
            case 'print': buttonIndex = 4; break;
            default:
                console.error('Unknown export type:', exportType);
                return; // Exit if the export type is invalid
        }

        // Trigger the corresponding DataTable export button
        table.button(buttonIndex).trigger();
    });
}

/**
 * Applies a custom length menu to control the number of entries shown per page.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} lengthSelector - Selector for the custom length menu dropdown.
 */
function applyCustomLengthMenu(table, lengthSelector) {
    $(lengthSelector).on('change', function () {
        var length = $(this).val(); // Get the selected length value
        if (length === "-1") {
            table.page.len(-1).draw(); // Show all rows if length is -1
        } else {
            table.page.len(parseInt(length)).draw(); // Set the table page length
        }
    });

    // Set the default value for the custom length menu
    $(lengthSelector).val(table.page.len());
    $(lengthSelector).find(`option[value="${table.page.len()}"]`).attr('selected', 'selected');

    // Trigger change event to update the dropdown UI
    $(lengthSelector).change();

    // If using a custom library like Sumoselect or Select2, refresh the element
    if ($(lengthSelector).hasClass('SumoUnder')) {
        $(lengthSelector)[0].sumo.reload();
    }
    if ($(lengthSelector).hasClass('select2')) {
        $(lengthSelector).trigger('change.select2');
    }
}

/**
 * Applies a custom search filter to the DataTable.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} searchSelector - Selector for the search input field.
 */
function applyCustomSearchFilter(table, searchSelector) {
    // Clear stored search term if stateSave is disabled
    if (!table.settings()[0].oFeatures.bStateSave) {
        localStorage.removeItem('datatable_search_' + table.table().node().id);
    }

    // Add an input listener for the search field
    $(searchSelector).on('input', function () {
        var searchTerm = $(this).val(); // Get the search term
        table.search(searchTerm).draw(); // Apply the search term to the table

        // Save the search term if stateSave is enabled
        if (table.settings()[0].oFeatures.bStateSave) {
            localStorage.setItem('datatable_search_' + table.table().node().id, searchTerm);
        }
    });

    // Pre-fill the search input with the saved value (if any)
    var defaultSearchValue = table.search();
    if (defaultSearchValue) {
        $(searchSelector).val(defaultSearchValue);
    }
}

/**
 * Updates the custom "show entries" message after the DataTable is redrawn.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} showEntriesSelector - Selector for the element to display the message.
 */
function applyCustomShowEntries(table, showEntriesSelector) {
    const pageInfo = table.page.info(); // Get table pagination info
    const filteredCount = pageInfo.recordsDisplay; // Count of filtered records
    const totalCount = pageInfo.recordsTotal; // Total count of records
    const displayStart = pageInfo.start + 1; // Starting entry number
    const displayEnd = pageInfo.end; // Ending entry number

    // Generate the custom message
    const message = `Showing ${displayStart} to ${displayEnd} of ${filteredCount} entries (filtered from ${totalCount} total entries)`;

    // Update the HTML element with the message
    $(showEntriesSelector).text(message);
}

/**
 * Creates custom pagination controls for the DataTable.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} paginationSelector - Selector for the pagination container.
 */
function applyCustomPagination(table, paginationSelector) {
    var pageInfo = table.page.info();
    var paginationHtml = '';
    var currentPage = pageInfo.page + 1; // Page is 0-indexed, so we add 1 for display
    var totalPages = pageInfo.pages;

    // Previous button
    paginationHtml += `<li class="paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 2}"><a href="#" aria-controls="employee-table-dynamic" tabindex="0" class="page-link">Previous</a></li>`;

    // Page buttons with ellipsis logic
    if (totalPages <= 8) {
        // If 8 or fewer pages, show all page numbers
        for (var i = 0; i < totalPages; i++) {
            paginationHtml += `<li class="paginate_button page-item ${currentPage === (i + 1) ? 'active' : ''}" data-page="${i}"><a href="#" aria-controls="employee-table-dynamic" tabindex="0" class="page-link">${i + 1}</a></li>`;
        }
    } else {
        // Show the first pages (always show first 3 pages)
        for (var i = 0; i < 3; i++) {
            paginationHtml += `<li class="paginate_button page-item ${currentPage === (i + 1) ? 'active' : ''}" data-page="${i}"><a href="#" aria-controls="employee-table-dynamic" tabindex="0" class="page-link">${i + 1}</a></li>`;
        }

        // Add ellipsis if needed
        if (currentPage > 4 && currentPage < totalPages - 4) {
            paginationHtml += `<li class="paginate_button page-item disabled"><a href="#" class="page-link">...</a></li>`;
        }

        // Show pages around the current page (current page +/- 2)
        for (var i = currentPage - 2; i <= currentPage + 2; i++) {
            if (i > 3 && i < totalPages - 2) {  // Only show if within range
                paginationHtml += `<li class="paginate_button page-item ${currentPage === i ? 'active' : ''}" data-page="${i - 1}"><a href="#" aria-controls="employee-table-dynamic" tabindex="0" class="page-link">${i}</a></li>`;
            }
        }

        // Add ellipsis if needed
        if (currentPage < totalPages - 3) {
            paginationHtml += `<li class="paginate_button page-item disabled"><a href="#" class="page-link">...</a></li>`;
        }

        // Show the last pages (always show last 3 pages)
        for (var i = totalPages - 3; i < totalPages; i++) {
            paginationHtml += `<li class="paginate_button page-item ${currentPage === (i + 1) ? 'active' : ''}" data-page="${i}"><a href="#" aria-controls="employee-table-dynamic" tabindex="0" class="page-link">${i + 1}</a></li>`;
        }
    }

    // Next button
    paginationHtml += `<li class="paginate_button page-item next ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage}"><a href="#" aria-controls="employee-table-dynamic" tabindex="0" class="page-link">Next</a></li>`;

    $(paginationSelector).html(paginationHtml);
}


/**
 * Applies custom date filtering functionality to the DataTable.
 *
 * @param {object} table - The DataTable instance.
 * @param {string} dateSelector - Selector for the date input fields.
 */
function applyCustomDateFilter(table, dateSelector) {
    $(document).on('change', dateSelector, function () {
        var dateFilter = $(this).data('date-filter'); // Get the type of date filter
        var fromDate, toDate;

        // Identify the filter type and assign values
        switch (dateFilter) {
            case 'from-date':
                fromDate = $(this).val();
                break;
            case 'to-date':
                toDate = $(this).val();
                break;
            default:
                console.error('Unknown date filter type:', dateFilter);
                return; // Exit if the filter type is invalid
        }

        // Build the URL with the date filters
        const newUrl = new URL(table.ajax.url());
        const dateFilterValues = {}; // Object to store date filters

        if (fromDate) {
            newUrl.searchParams.set('fromDate', fromDate);
            dateFilterValues['fromDate'] = fromDate;
        } else {
            newUrl.searchParams.delete('fromDate');
        }

        if (toDate) {
            newUrl.searchParams.set('toDate', toDate);
            dateFilterValues['toDate'] = toDate;
        } else {
            newUrl.searchParams.delete('toDate');
        }

        // Save date filter values to localStorage
        localStorage.setItem('dateFilterValues', JSON.stringify(dateFilterValues));

        // Reload the table with the updated URL
        table.ajax.url(newUrl.toString()).load();
    });

    // Pre-fill date inputs with saved values (if any)
    const savedDateFilterValues = JSON.parse(localStorage.getItem('dateFilterValues'));
    if (savedDateFilterValues) {
        if (savedDateFilterValues['fromDate']) {
            $('#from-date').val(savedDateFilterValues['fromDate']).change();
        }
        if (savedDateFilterValues['toDate']) {
            $('#to-date').val(savedDateFilterValues['toDate']).change();
        }
    }
}


/*
// Example usage of the datatable function
<script>
$(document).ready(function () {
    datatable({
        tableId: "yourTableId",
        url: "/your-endpoint",
        dataLength: '[data-length]',
        dataSearch: '[data-search]',
        dataFilter: '[data-filter]',
        dataExport: '[data-export]',
        dataDateFilter: '[data-date-filter]',
        dataShowEntries: '[data-show-entries]',
        dataPagination: '[data-pagination]',
        dataStateSave: false,
        drawCallback: function(settings) {
            console.log('DataTable Drawn');
            $('[data-bs-toggle="popover"]').popover('dispose');
            $('[data-bs-toggle="popover"]').popover({
                trigger: 'hover'
            });
        }
    });
});
</script>

<!-- DataTable -->
<table id="example" class="display" style="width:100%">

    <!-- Custom Export Buttons -->
    <div>
        <button class="custom-export-button" data-export="csv">Export CSV</button>
        <button class="custom-export-button" data-export="excel">Export Excel</button>
        <button class="custom-export-button" data-export="pdf">Export PDF</button>
        <button class="custom-export-button" data-export="copy">Copy</button>
        <button class="custom-export-button" data-export="print">Print</button>
    </div>

    <!-- Custom Length Menu -->
    <select id="custom-length-menu">
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="-1">All</option>
    </select>
    <!-- Custom Date Filters -->
    <input type="date" class="date-filter" data-date-filter="from-date" id="from-date"/>
    <input type="date" class="date-filter" data-date-filter="to-date" id="to-date"/>

    <!-- Custom Search -->
    <input id="custom-search" type="text" placeholder="Search..."/>
    <thead>
        <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Office</th>
            <th>Age</th>
            <th>Start date</th>
            <th>Salary</th>
        </tr>
    </thead>
    <!-- Custom Show Entries -->
    <div id="custom-show-entries"></div>

    <!-- Custom Pagination -->
    <ul id="custom-pagination" class="pagination"></ul>
</table>
*/
