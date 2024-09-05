/**
 * Initializes a DataTable with custom configurations and additional features like filtering, exporting, and pagination.
 * @param {Object} options - Configuration options for the DataTable.
 * @param {string} options.tableId - The ID of the table element.
 * @param {string} options.url - The URL for the server-side data.
 * @param {string} options.dataLength - Selector for the length menu element.
 * @param {string} options.dataSearch - Selector for the search input element.
 * @param {string} options.dataFilter - Selector for the filter elements.
 * @param {string} options.dataExport - Selector for the export buttons.
 * @param {string} options.dataShowEntries - Selector for the element displaying the number of entries.
 * @param {string} options.dataPagination - Selector for the pagination container.
 * @param {boolean} options.dataStateSave - Whether to save the table's state in the browser (default is false).
 * @param {Function} options.drawCallback - Callback function that runs after each table draw.
 */
function datatable({tableId, url, dataLength, dataSearch, dataFilter, dataExport, dataShowEntries, dataPagination, dataStateSave = false, drawCallback}) {
    // Initialize the DataTable with custom options
    var dataTable = $('#' + tableId).DataTable({
        dom: '<"col-sm-12"rt>',  // Define the layout
        processing: true,        // Show processing indicator
        serverSide: true,        // Enable server-side processing
        stateSave: dataStateSave, // Save the state of the table
        lengthMenu: [5, 10, 25, 50, 100, 500, 1000], // Length menu options
        pageLength: 5,            // Default page length
        order: [[0, 'desc']],     // Default ordering
        ajax: url,                // URL for server-side data
        rowCallback: function(row, data, index) {
            // Add row numbering and custom row styles
            var pageInfo = dataTable.page.info();
            var rowNumber = pageInfo.start + index + 1;
            $('td:eq(0)', row).html(rowNumber);
            $('td', row).css('font-size', '12px');
        },
        buttons: [
            { extend: 'csv', text: 'CSV' },
            { extend: 'excel', text: 'Excel' },
            { extend: 'pdf', text: 'PDF' },
            { extend: 'copy', text: 'Copy' },
            { extend: 'print', text: 'Print' }
        ],
        language: {
            searchPlaceholder: "Search here...",
            processing: '<div id="lottieAnimationContainer"><iframe src="https://lottie.host/embed/fad75f9c-37b5-4957-9393-fd4894af42df/HaHmy3Jrsi.json"></iframe></div>',
        },
        drawCallback: drawCallback,
    });

    // Apply custom features
    applyCustomFilters(dataTable, dataFilter);
    applyCustomExport(dataTable, dataExport);
    applyCustomLengthMenu(dataTable, dataLength);
    applyCustomSearchFilter(dataTable, dataSearch);
    dataTable.on('draw', function() {
        applyCustomShowEntries(dataTable, dataShowEntries);
        applyCustomPagination(dataTable, dataPagination);
    });

    // Handle pagination click events
    $(document).on('click', '[data-pagination] li', function(e) {
        e.preventDefault();
        if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;

        var pageNum = $(this).data('page');
        dataTable.page(pageNum).draw('page');
    });

    // Set dropdown menu width dynamically
    var buttonWidth = $('#defaultDropdown').outerWidth();
    $('.dropdown-menu').css('width', buttonWidth + 'px');
}

/**
 * Apply custom filters to the DataTable based on user input.
 * @param {Object} table - The DataTable instance.
 * @param {string} filterSelector - Selector for the filter elements.
 */
function applyCustomFilters(table, filterSelector) {
    $(document).on('change', filterSelector, function() {
        const newUrl = new URL(table.ajax.url());
        const filterValues = {};

        // Update the URL with filter values
        $(filterSelector).each(function() {
            const filterName = $(this).attr('id');
            const filterValue = $(this).val();
            if (filterValue) {
                newUrl.searchParams.set(filterName, filterValue);
                filterValues[filterName] = filterValue;
            } else {
                newUrl.searchParams.delete(filterName);
                delete filterValues[filterName];
            }
        });

        // Save filter values to local storage
        localStorage.setItem('filterValues', JSON.stringify(filterValues));
        table.ajax.url(newUrl.toString()).load();
    });

    // Load filter values from local storage
    var savedFilterValues = JSON.parse(localStorage.getItem('filterValues'));
    if (savedFilterValues) {
        $(filterSelector).each(function() {
            const filterName = $(this).attr('id');
            if (savedFilterValues[filterName]) {
                $(this).val(savedFilterValues[filterName]);
                $(this).find(`option[value="${savedFilterValues[filterName]}"]`).attr('selected', 'selected');
                $(this).change();

                if ($(this).hasClass('SumoUnder')) {
                    $(this)[0].sumo.reload();
                }
                if ($(this).hasClass('select2')) {
                    $(this).trigger('change.select2');
                }
            }
        });
    }
}

/**
 * Apply custom export functionality to the DataTable.
 * @param {Object} table - The DataTable instance.
 * @param {string} exportSelector - Selector for the export buttons.
 */
function applyCustomExport(table, exportSelector) {
    $(document).on('click', exportSelector, function (e) {
        e.preventDefault();
        var exportType = $(this).data('export');
        var buttonIndex;

        // Map export types to button indexes
        switch (exportType) {
            case 'csv':
                buttonIndex = 0;
                break;
            case 'excel':
                buttonIndex = 1;
                break;
            case 'pdf':
                buttonIndex = 2;
                break;
            case 'copy':
                buttonIndex = 3;
                break;
            case 'print':
                buttonIndex = 4;
                break;
            default:
                console.error('Unknown export type:', exportType);
                return;
        }

        // Trigger the corresponding export button
        table.button(buttonIndex).trigger();
    });
}

/**
 * Apply a custom length menu to the DataTable.
 * @param {Object} table - The DataTable instance.
 * @param {string} lengthSelector - Selector for the length menu element.
 */
function applyCustomLengthMenu(table, lengthSelector) {
    $(lengthSelector).on('change', function() {
        var length = $(this).val();
        if (length === "-1") {
            table.page.len(-1).draw();
        } else {
            table.page.len(parseInt(length)).draw();
        }
    });

    // Set the default value for the length menu
    $(lengthSelector).val(table.page.len());
    $(lengthSelector).find(`option[value="${table.page.len()}"]`).attr('selected', 'selected');
    $(lengthSelector).change();
    if ($(lengthSelector).hasClass('SumoUnder')) {
        $(lengthSelector)[0].sumo.reload();
    }
    if ($(lengthSelector).hasClass('select2')) {
        $(lengthSelector).trigger('change.select2');
    }
}

/**
 * Apply custom search functionality to the DataTable.
 * @param {Object} table - The DataTable instance.
 * @param {string} searchSelector - Selector for the search input element.
 */
function applyCustomSearchFilter(table, searchSelector) {
    // Remove the previous search term from local storage if state saving is disabled
    if (!table.settings()[0].oFeatures.bStateSave) {
        localStorage.removeItem('datatable_search_' + table.table().node().id);
    }

    // Handle search input events
    $(searchSelector).on('input', function() {
        var searchTerm = $(this).val();
        table.search(searchTerm).draw();
        if (table.settings()[0].oFeatures.bStateSave) {
            localStorage.setItem('datatable_search_' + table.table().node().id, searchTerm);
        }
    });

    // Set the default search value
    var defaultSearchValue = table.search();
    if (defaultSearchValue) {
        $(searchSelector).val(defaultSearchValue);
    }
}

/**
 * Update the element showing the number of entries in the DataTable.
 * @param {Object} table - The DataTable instance.
 * @param {string} showEntriesSelector - Selector for the element showing the number of entries.
 */
function applyCustomShowEntries(table, showEntriesSelector) {
    const pageInfo = table.page.info();
    const filteredCount = pageInfo.recordsDisplay;
    const totalCount = pageInfo.recordsTotal;
    const displayStart = pageInfo.start + 1;
    const displayEnd = pageInfo.end;

    // Construct the message showing the number of entries
    const message = (filteredCount === totalCount) 
        ? `Showing ${displayStart} to ${displayEnd} of ${totalCount} entries`
        : `Showing ${displayStart} to ${displayEnd} of ${filteredCount} filtered entries (Total: ${totalCount} entries)`;

    // Display the message
    $(showEntriesSelector).text(message);
}

/**
 * Apply custom pagination to the DataTable.
 * @param {Object} table - The DataTable instance.
 * @param {string} paginationSelector - Selector for the pagination container.
 */
function applyCustomPagination(table, paginationSelector) {
    const pageInfo = table.page.info();
    const paginationElement = $(paginationSelector);
    paginationElement.empty();

    // Create pagination controls
    const prevButton = $('<li>').addClass('page-item').append($('<a>').addClass('page-link').attr('href', '#').data('page', pageInfo.page - 1).text('Previous'));
    const nextButton = $('<li>').addClass('page-item').append($('<a>').addClass('page-link').attr('href', '#').data('page', pageInfo.page + 1).text('Next'));

    // Disable buttons if necessary
    if (pageInfo.page === 0) prevButton.addClass('disabled');
    if (pageInfo.page === pageInfo.pages - 1) nextButton.addClass('disabled');

    // Append buttons to the pagination container
    paginationElement.append(prevButton);
    for (let i = 0; i < pageInfo.pages; i++) {
        const pageButton = $('<li>').addClass('page-item').append($('<a>').addClass('page-link').attr('href', '#').data('page', i).text(i + 1));
        if (i === pageInfo.page) pageButton.addClass('active');
        paginationElement.append(pageButton);
    }
    paginationElement.append(nextButton);
}

/*
// Example usage of the datatable function
$(document).ready(function () {
    datatable({
        tableId: "yourTableId",
        url: "/your-endpoint",
        dataLength: '[data-length]',
        dataSearch: '[data-search]',
        dataFilter: '[data-filter]',
        dataExport: '[data-export]',
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
*/
